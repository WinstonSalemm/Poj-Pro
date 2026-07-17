import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  generatePersonalPromoCode,
  PERSONAL_PROMO_DISCOUNT_PERCENT,
} from '@/lib/personalPromo';

// Ensure this runs in Node.js environment
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Input validation schema
interface RegisterRequest {
  name?: string;
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let data: RegisterRequest;
    try {
      data = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { name, email, password } = data;

    // Input validation
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { 
          ok: false, 
          error: 'Password must be a string with at least 6 characters' 
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = (name && typeof name === 'string') ? name.trim() : null;

    // Check for existing user
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true }
      });

      if (existingUser) {
        return NextResponse.json(
          { ok: false, error: 'Email already in use' },
          { status: 409 }
        );
      }
    } catch (dbError) {
      console.error('Database error during user check:', dbError);
      return NextResponse.json(
        { ok: false, error: 'Error checking user existence' },
        { status: 500 }
      );
    }

    // Create new user + personal 8-char promo (5%)
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      let user: { id: string; email: string; personalPromoCode: string | null } | null = null;
      let lastError: unknown;

      for (let attempt = 0; attempt < 12; attempt++) {
        const personalPromoCode = generatePersonalPromoCode();
        try {
          user = await prisma.$transaction(async (tx) => {
            const created = await tx.user.create({
              data: {
                email: normalizedEmail,
                name: normalizedName,
                password: hashedPassword,
                personalPromoCode,
              },
              select: { id: true, email: true, personalPromoCode: true },
            });
            await tx.promoCode.create({
              data: {
                code: personalPromoCode,
                description: `Personal 5% registration promo (${normalizedEmail})`,
                discount: PERSONAL_PROMO_DISCOUNT_PERCENT,
                isActive: true,
              },
            });
            return created;
          });
          break;
        } catch (err: unknown) {
          lastError = err;
          const code =
            typeof err === 'object' && err && 'code' in err
              ? (err as { code?: string }).code
              : undefined;
          // Retry only on unique collision of promo code
          if (code === 'P2002') {
            const target =
              typeof err === 'object' && err && 'meta' in err
                ? (err as { meta?: { target?: string[] } }).meta?.target
                : undefined;
            const hitEmail = Array.isArray(target) && target.some((t) => String(t).includes('email'));
            if (hitEmail) throw err;
            continue;
          }
          throw err;
        }
      }

      if (!user) {
        throw lastError || new Error('Failed to create user with promo');
      }

      return NextResponse.json(
        {
          ok: true,
          user: {
            id: user.id,
            email: user.email,
            personalPromoCode: user.personalPromoCode,
          },
        },
        { status: 201 }
      );

    } catch (createError: unknown) {
      console.error('User creation error:', createError);

      const code = (typeof createError === 'object' && createError && 'code' in createError)
        ? (createError as { code?: string }).code
        : undefined;

      if (code === 'P2002') {
        return NextResponse.json(
          { ok: false, error: 'Email already in use' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { ok: false, error: 'Failed to create user' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Unexpected registration error:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'An unexpected error occurred during registration' 
      },
      { status: 500 }
    );
  }
}

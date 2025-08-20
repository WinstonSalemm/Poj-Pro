import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Ensure this runs in Node.js environment
export const runtime = 'nodejs';

// Input validation schema
interface RegisterRequest {
  name?: string;
  email: string;
  password: string;
}

export async function POST(request: Request) {
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

    // Create new user
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: normalizedName,
          password: hashedPassword,
        },
        select: { id: true, email: true }
      });

      return NextResponse.json(
        { 
          ok: true, 
          user: { id: user.id, email: user.email } 
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

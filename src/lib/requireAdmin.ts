import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/authOptions';

/**
 * Guards route handlers that expose administration data or mutations.
 * Authentication is derived exclusively from the signed NextAuth session;
 * callers must never accept a password or token supplied by the browser.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (!session.user.isAdmin) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  return null;
}

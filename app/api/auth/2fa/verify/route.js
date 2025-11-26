import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from '../../../../../lib/db';

export async function POST(request) {
  try {
    const { email, token } = await request.json();
    if (!email || !token) return NextResponse.json({ error: 'Missing email or token' }, { status: 400 });

    const user = await getUserByEmail(email);
    if (!user || !user.twofa_secret) return NextResponse.json({ error: '2FA not configured' }, { status: 400 });

    const verified = speakeasy.totp.verify({
      secret: user.twofa_secret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // 2FA verified — create JWT session token and set cookie
    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    const payload = { id: user.id, email: user.email };
    const sessionToken = jwt.sign(payload, secret, { expiresIn: '1d' });

    const res = NextResponse.json({ ok: true, message: '2FA verified' }, { status: 200 });
    res.cookies.set('token', sessionToken, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax'
    });
    return res;
  } catch (err) {
    console.error('2fa verify error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

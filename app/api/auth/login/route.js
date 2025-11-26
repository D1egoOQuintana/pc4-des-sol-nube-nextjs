import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from '../../../../lib/db';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    // use sync compare from bcryptjs for simplicity
    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    if (user.twofa_enabled) {
      // Do not create session yet - require 2FA verification
      return NextResponse.json({ twofa: true, email }, { status: 200 });
    }

    // Create JWT and set as httpOnly cookie
    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });

    const res = NextResponse.json({ ok: true, message: 'Logged in' }, { status: 200 });
    res.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax'
    });
    return res;
  } catch (err) {
    console.error('login error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

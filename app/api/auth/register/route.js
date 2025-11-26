import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser } from '../../../../lib/db';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // bcryptjs is synchronous by default; use hashSync to avoid callback complexity here
    const passwordHash = bcrypt.hashSync(password, 10);
    await createUser(email, passwordHash);

    return NextResponse.json({ ok: true, message: 'User created' }, { status: 201 });
  } catch (err) {
    console.error('register error', err);
    // In development return the error message to help debugging (do not expose in production)
    const devMessage = process.env.NODE_ENV === 'production' ? 'Server error' : String(err?.message || err);
    return NextResponse.json({ error: devMessage }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const res = NextResponse.json({ ok: true, message: 'Logged out' }, { status: 200 });
    // Clear cookie
    res.cookies.set('token', '', { httpOnly: true, path: '/', maxAge: 0 });
    return res;
  } catch (err) {
    console.error('logout error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

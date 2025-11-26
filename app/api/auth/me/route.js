import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/(^|; )token=([^;]+)/);
    const token = match ? decodeURIComponent(match[2]) : null;
    if (!token) return NextResponse.json({ authenticated: false }, { status: 200 });

    const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({ authenticated: true, user: payload }, { status: 200 });
  } catch (err) {
    console.error('me route error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { getUserByEmail, saveTwoFA } from '../../../../../lib/db';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const user = await getUserByEmail(email);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const secret = speakeasy.generateSecret({ name: `MyApp (${email})` });
    // Save base32 secret and activate 2FA
    await saveTwoFA(email, secret.base32);

    const otpauth = secret.otpauth_url;
    const qrDataUrl = await qrcode.toDataURL(otpauth);

    return NextResponse.json({ ok: true, otpauth, qr: qrDataUrl }, { status: 200 });
  } catch (err) {
    console.error('2fa setup error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

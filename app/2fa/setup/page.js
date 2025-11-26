"use client";
import { useState } from 'react';

export default function Setup2fa() {
  const [email, setEmail] = useState('');
  const [qr, setQr] = useState(null);
  const [otpauth, setOtpauth] = useState(null);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/auth/2fa/setup', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Error');
    setQr(data.qr);
    setOtpauth(data.otpauth);
  }

  return (
    <div className="container">
      <h1>Enable 2FA</h1>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        </div>
        <button type="submit">Generate 2FA</button>
      </form>

      {error && <p style={{color:'red'}}>{error}</p>}

      {qr && (
        <div>
          <p>Scan this QR with Google Authenticator or other app:</p>
          <img src={qr} alt="2fa qr" />
          <p>Or use this URL: <code>{otpauth}</code></p>
        </div>
      )}
    </div>
  );
}

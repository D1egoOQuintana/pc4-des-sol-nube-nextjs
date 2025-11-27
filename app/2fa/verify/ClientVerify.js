"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientVerify({ email }) {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [msg, setMsg] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return setMsg(data?.error || 'Error');
      router.push('/welcome');
    } catch (err) {
      setMsg('Network error');
    }
  }

  return (
    <div className="container">
      <h1>Verify 2FA</h1>
      <p>Verifying for: <strong>{email}</strong></p>
      <form onSubmit={onSubmit}>
        <div>
          <label>Code</label>
          <input value={token} onChange={(e) => setToken(e.target.value)} required />
        </div>
        <button type="submit">Verify</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}

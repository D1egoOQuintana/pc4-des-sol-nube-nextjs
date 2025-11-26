"use client";
// Force dynamic rendering: this page uses client-side hooks (useSearchParams)
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function Verify2fa() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get('email') || '';
  const [token, setToken] = useState('');
  const [msg, setMsg] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, token })
      });
      const data = await res.json().catch(()=>null);
      if (!res.ok) return setMsg(data?.error || 'Error');

      // Success: server set cookie -> redirect to welcome page
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
          <input value={token} onChange={e=>setToken(e.target.value)} required />
        </div>
        <button type="submit">Verify</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}

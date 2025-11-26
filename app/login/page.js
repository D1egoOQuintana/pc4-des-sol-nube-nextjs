"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Error');
      if (data.twofa) {
        router.push(`/2fa/verify?email=${encodeURIComponent(email)}`);
        return;
      }
      // logged in: verify session by asking /api/auth/me
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (meData.authenticated) {
          setError(null);
          // show a success message instead of an alert
          setError('Logged in as ' + (meData.user.email || meData.user?.email || 'user'));
        } else {
          setError('Logged in, but could not validate session');
        }
      } catch (err) {
        setError('Logged in, but session check failed');
      }
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        </div>
        <div>
          <label>Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{color:'red'}}>{error}</p>}
    </div>
  );
}

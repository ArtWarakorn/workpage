'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });

  function handleChange(e) {
    
  }

  function handleSignIn(e) {
    e.preventDefault();
    router.push(`/dashboard/${id}`);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">sign in</h1>

        <div className="auth-field">
          <label className="auth-label">user name :</label>
          <input
            className="auth-input"
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">password :</label>
          <input
            className="auth-input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </div>

        <div className="auth-actions">
          <button className="btn-primary" onClick={handleSignIn}>
            sign in
          </button>
          <Link href="/register" className="auth-link">
            create account
          </Link>
        </div>
      </div>
    </div>
  );
}
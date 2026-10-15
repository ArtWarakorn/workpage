'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSignIn(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard/${data.encryptedId}`);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">sign in</h1>

        {error && (
          <p style={{
            color: '#fca5a5',
            textAlign: 'center',
            marginBottom: '16px',
            fontSize: '0.88rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px',
            padding: '10px 16px',
          }}>
            {error}
          </p>
        )}

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
          <button
            className={`btn-primary${isLoading ? ' btn-loading' : ''}`}
            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? <><span className="spinner spinner-sm" /> signing in...</> : 'sign in'}
          </button>
          <Link href="/register" className="auth-link">
            create account
          </Link>
        </div>
      </div>
    </div>
  );
}
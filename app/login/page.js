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
        <div className="auth-brand">
          <span className="app-topbar-mark">WP</span>
          <p className="auth-kicker">Work Page</p>
        </div>
        <h1 className="auth-title">เข้าสู่ระบบ</h1>
        <p className="auth-subtitle">จัดการตารางเรียนและงานส่งในที่เดียว</p>

        {error && <p className="auth-error">{error}</p>}

        <div className="auth-field">
          <label className="auth-label">ชื่อผู้ใช้</label>
          <input
            className="auth-input"
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            placeholder="กรอกชื่อผู้ใช้"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">รหัสผ่าน</label>
          <input
            className="auth-input"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="กรอกรหัสผ่าน"
          />
        </div>

        <div className="auth-actions">
          <button
            className={`btn-primary${isLoading ? ' btn-loading' : ''}`}
            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? <><span className="spinner spinner-sm" /> กำลังเข้าสู่ระบบ...</> : 'เข้าสู่ระบบ'}
          </button>
          <Link href="/register" className="auth-link">
            ยังไม่มีบัญชี? สมัครสมาชิก
          </Link>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });

  function handleChange(e) {

  }

  function handleSave(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    router.push('/login');
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Registor</h1>

        <div className="auth-field">
          <label className="auth-label">student id :</label>
          <input
            className="auth-input"
            type="text"
            name="users_"
            value={form.user_id}
            onChange={handleChange}
            autoComplete="users_id"
          />
        </div>

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
            autoComplete="new-password"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">confirm password :</label>
          <input
            className="auth-input"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>

        <div className="auth-actions">
          <button className="btn-primary" onClick={handleSave}>
            Save
          </button>
          <button className="auth-link" onClick={() => router.push('/login')}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
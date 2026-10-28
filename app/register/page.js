'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState({
    users_id: '',
    users_name: '',
    password: '',
    confirmPassword: ''
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    let profileUrl = '';

    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.error) {
          alert('Upload failed: ' + uploadData.error);
          setIsUploading(false);
          return;
        }
        profileUrl = uploadData.url;
      } catch (err) {
        alert('Upload error');
        console.error(err);
        setIsUploading(false);
        return;
      }
    }

    setIsUploading(true);
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        users_id: form.users_id,
        users_name: form.users_name,
        password: form.password,
        users_profile_url: profileUrl
      })
    })
      .then((r) => r.json())
      .then(() => { router.push('/login'); })
      .catch((err) => { console.error('Error registering user:', err); })
      .finally(() => { setIsUploading(false); });
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="app-topbar-mark">WP</span>
          <p className="auth-kicker">Work Page</p>
        </div>
        <h1 className="auth-title">สมัครสมาชิก</h1>
        <p className="auth-subtitle">สร้างบัญชีเพื่อจัดตารางเรียนและติดตามงานส่ง</p>

        <div className="auth-field">
          <label className="auth-label">รหัสนักศึกษา</label>
          <input
            className="auth-input"
            type="text"
            name="users_id"
            value={form.users_id}
            onChange={handleChange}
            autoComplete="off"
            placeholder="เช่น 650xxxxx"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">ชื่อผู้ใช้</label>
          <input
            className="auth-input"
            type="text"
            name="users_name"
            value={form.users_name}
            onChange={handleChange}
            autoComplete="off"
            placeholder="ชื่อที่แสดงในระบบ"
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
            autoComplete="new-password"
            placeholder="ตั้งรหัสผ่าน"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">ยืนยันรหัสผ่าน</label>
          <input
            className="auth-input"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="พิมพ์รหัสผ่านอีกครั้ง"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">รูปโปรไฟล์</label>
          <input
            className="auth-input-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {preview && (
            <div className="auth-preview-container">
              <img src={preview} alt="Preview" className="auth-preview-img" />
            </div>
          )}
        </div>

        <div className="auth-actions">
          <button
            className={`btn-primary${isUploading ? ' btn-loading' : ''}`}
            onClick={handleSave}
            disabled={isUploading}
          >
            {isUploading ? <><span className="spinner spinner-sm" /> กำลังบันทึก...</> : 'สร้างบัญชี'}
          </button>
          <button className="auth-link" onClick={() => router.push('/login')}>
            มีบัญชีแล้ว? เข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  );
}
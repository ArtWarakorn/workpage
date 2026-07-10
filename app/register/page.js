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
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value
    }));
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
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
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

    fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        users_id: form.users_id,
        users_name: form.users_name,
        password: form.password,
        users_profile_url: profileUrl
      })
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('User registered:', data);
        router.push('/login');
      })
      .catch((error) => {
        console.error('Error registering user:', error);
      })
      .finally(() => {
        setIsUploading(false);
      });
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Register</h1>

        <div className="auth-field">
          <label className="auth-label">student id :</label>
          <input
            className="auth-input"
            type="text"
            name="users_id"
            value={form.users_id}
            onChange={handleChange}
            autoComplete="users_id"
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">user name :</label>
          <input
            className="auth-input"
            type="text"
            name="users_name"
            value={form.users_name}
            onChange={handleChange}
            autoComplete="users_name"
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
        <div className="auth-field">
          <label className="auth-label">profile picture :</label>
          <input
            className="auth-input-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {preview && (
            <div className="auth-preview-container">
              <img 
                src={preview} 
                alt="Preview" 
                className="auth-preview-img" 
              />
            </div>
          )}
        </div>

        <div className="auth-actions">
          <button className="btn-primary" onClick={handleSave} disabled={isUploading}>
            {isUploading ? 'Saving...' : 'Save'}
          </button>
          <button className="auth-link" onClick={() => router.push('/login')}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
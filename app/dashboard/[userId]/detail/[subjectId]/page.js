"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { decryptId } from '@/lib/encryptId';

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userId: encryptedUserId, subjectId } = params;
  // ถอดรหัส userId จาก URL เพื่อใช้กับ API
  const userId = encryptedUserId ? decryptId(encryptedUserId) : null;

  const [subject, setSubject] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeletingDone, setIsDeletingDone] = useState(false);

  // Form state for new work
  const [form, setForm] = useState({
    work_title: '',
    work_date_end: '',
    work_detail: '',
    work_status: false,
  });

  // Load subject info
  const loadSubject = async () => {
    try {
      const res = await fetch(`/api/subject/${subjectId}`);
      const data = await res.json();
      if (!data.error) setSubject(data);
    } catch (err) {
      console.error('Error loading subject:', err);
    }
  };

  // Load works for this subject
  const loadWorks = async () => {
    try {
      const res = await fetch(`/api/work?subjectId=${subjectId}&userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setWorks(data);
    } catch (err) {
      console.error('Error loading works:', err);
    }
  };

  useEffect(() => {
    if (subjectId) {
      setLoading(true);
      Promise.all([loadSubject(), loadWorks()]).finally(() => setLoading(false));
    }
  }, [subjectId]);

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Submit new work
  const handleSave = async () => {
    if (!form.work_title.trim()) {
      alert('กรุณาใส่หัวข้องาน');
      return;
    }
    try {
      const res = await fetch('/api/work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_id: subjectId,
          users_id: userId,
          work_title: form.work_title,
          work_date_end: form.work_date_end || null,
          work_detail: form.work_detail || null,
          work_status: form.work_status,
        }),
      });
      if (res.ok) {
        await loadWorks();
        setForm({ work_title: '', work_date_end: '', work_detail: '', work_status: false });
        setIsModalOpen(false);
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด');
    }
  };

  // Toggle work status
  const handleToggleStatus = async (work) => {
    try {
      const res = await fetch(`/api/work/${work.work_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ work_status: !work.work_status }),
      });
      if (res.ok) {
        await loadWorks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete all done works
  const handleDeleteDone = async () => {
    const doneCount = works.filter(w => w.work_status).length;
    if (doneCount === 0) {
      alert('ไม่มีงานที่เสร็จแล้ว');
      return;
    }
    if (!confirm(`ยืนยันการลบงานที่เสร็จแล้วทั้งหมด ${doneCount} รายการ?`)) return;
    setIsDeletingDone(true);
    try {
      const res = await fetch(`/api/work/done?subjectId=${subjectId}&userId=${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadWorks();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingDone(false);
    }
  };

  const doneCount = works.filter(w => w.work_status).length;
  const pendingCount = works.filter(w => !w.work_status).length;

  if (loading) {
    return (
      <div className="detail-layout" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '1.2rem', color: '#1A7DAF' }}>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  return (
    <div className="detail-layout">
      {/* ===== Sidebar ===== */}
      <div className="detail-sidebar">
        <div className="detail-sidebar-info">
          <p><strong>รหัสวิชา :</strong> {subject?.subject_id || subjectId}</p>
          <p><strong>วิชา :</strong> {subject?.subject_name || '—'}</p>
          {subject?.subject_detail && (
            <p style={{ fontSize: '0.95rem', color: '#444', marginTop: 4 }}>
              {subject.subject_detail}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="detail-stats">
          <div className="detail-stat-card stat-pending">
            <span className="stat-num">{pendingCount}</span>
            <span className="stat-label">ยังไม่เสร็จ</span>
          </div>
          <div className="detail-stat-card stat-done">
            <span className="stat-num">{doneCount}</span>
            <span className="stat-label">เสร็จแล้ว</span>
          </div>
        </div>

        {/* Action buttons */}
        <button
          className="detail-add-btn"
          onClick={() => setIsModalOpen(true)}
        >
          + เพิ่มงาน
        </button>

        {doneCount > 0 && (
          <button
            className="detail-delete-done-btn"
            onClick={handleDeleteDone}
            disabled={isDeletingDone}
          >
            {isDeletingDone ? 'กำลังลบ...' : `🗑 ลบงานที่เสร็จแล้ว (${doneCount})`}
          </button>
        )}

        <button
          className="detail-back-btn"
          onClick={() => router.push(`/dashboard/${encryptedUserId}`)}
        >
          ← กลับ
        </button>
      </div>

      {/* ===== Main Content ===== */}
      <div className="detail-main">
        <h2 className="detail-main-title">รายการงาน</h2>

        {works.length === 0 ? (
          <div className="detail-empty">
            <p>ยังไม่มีงาน กดปุ่ม "+ เพิ่มงาน" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="task-list">
            {works.map(work => (
              <div
                key={work.work_id}
                className={`task-card ${work.work_status ? 'status-done' : 'status-pending'}`}
              >
                <p><strong>หัวข้อ :</strong> {work.work_title}</p>
                {work.work_detail && (
                  <p><strong>รายละเอียด :</strong> {work.work_detail}</p>
                )}
                <div className="task-card-dates">
                  {work.work_date_start && (
                    <span><strong>วันที่สั่ง :</strong> {work.work_date_start}</span>
                  )}
                  {work.work_date_end && (
                    <span><strong>วันที่ส่ง :</strong> {work.work_date_end}</span>
                  )}
                </div>
                <div className="task-card-status-row">
                  <span className={`task-status-badge ${work.work_status ? 'badge-done' : 'badge-pending'}`}>
                    {work.work_status ? '✓ เสร็จแล้ว' : '⏳ ยังไม่เสร็จ'}
                  </span>
                  <button
                    className="task-status-btn"
                    onClick={() => handleToggleStatus(work)}
                  >
                    เปลี่ยนเป็น {work.work_status ? 'ยังไม่เสร็จ' : 'เสร็จแล้ว'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Modal: Add Work ===== */}
      {isModalOpen && (
        <div className="detail-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className="detail-modal">
            <h3 className="detail-modal-title">เพิ่มงานใหม่</h3>
            <div className="detail-modal-form">
              <div className="detail-form-group">
                <label>หัวข้อ :</label>
                <input
                  type="text"
                  name="work_title"
                  className="detail-input"
                  placeholder="ชื่องาน / การบ้าน"
                  value={form.work_title}
                  onChange={handleFormChange}
                />
              </div>
              <div className="detail-form-group">
                <label>วันที่ส่ง :</label>
                <input
                  type="date"
                  name="work_date_end"
                  className="detail-input"
                  value={form.work_date_end}
                  onChange={handleFormChange}
                />
              </div>
              <div className="detail-form-group align-top">
                <label>รายละเอียด :</label>
                <textarea
                  name="work_detail"
                  className="detail-textarea"
                  placeholder="รายละเอียดงาน (ถ้ามี)"
                  value={form.work_detail}
                  onChange={handleFormChange}
                />
              </div>
              <div className="detail-form-group">
                <label>สถานะ :</label>
                <select
                  name="work_status"
                  className="detail-select"
                  value={form.work_status.toString()}
                  onChange={(e) => setForm(prev => ({ ...prev, work_status: e.target.value === 'true' }))}
                >
                  <option value="false">ยังไม่เสร็จ</option>
                  <option value="true">เสร็จแล้ว</option>
                </select>
              </div>
              <div className="detail-modal-actions">
                <button className="detail-cancel-btn" onClick={() => setIsModalOpen(false)}>
                  ยกเลิก
                </button>
                <button className="detail-save-btn" onClick={handleSave}>
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardClient({ userId, encryptedUserId }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [form, setForm] = useState({
    subject_id: '',
    subject_name: '',
    subject_detail: '',
    day: 'Mon',
    startTime: '09:00',
    endTime: '10:30'
  });

  // ---- Edit Modal State ----
  const [editModal, setEditModal] = useState(null); // null = ปิด, enroll object = เปิด
  const [editForm, setEditForm] = useState({ day: 'Mon', startTime: '09:00', endTime: '10:30' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // ---- Load Data ----
  const loadEnrollments = () => {
    fetch(`/api/enroll?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error && Array.isArray(data)) {
          setEnrollments(data);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (userId) {
      fetch(`/api/users/${userId}`)
        .then(res => res.json())
        .then(data => { if (!data.error) setUser(data); })
        .catch(err => console.error(err));

      loadEnrollments();

      fetch('/api/subject')
        .then(res => res.json())
        .then(data => {
          if (!data.error && Array.isArray(data)) setAvailableSubjects(data);
        })
        .catch(err => console.error(err));
    }
  }, [userId]);

  // ---- Add Form Handlers ----
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'subject_id') {
      const selected = availableSubjects.find(s => s.subject_id === value);
      if (selected) {
        setForm({ ...form, subject_id: selected.subject_id, subject_name: selected.subject_name || '', subject_detail: selected.subject_detail || '' });
      } else {
        setForm({ ...form, subject_id: value, subject_name: '', subject_detail: '' });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  function formatTime(slotTime) {
    if (slotTime.includes(':')) return slotTime + (slotTime.length === 5 ? ':00' : '');
    const [h, m] = slotTime.split('.');
    return `${h.padStart(2, '0')}:${m}:00`;
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId, 10),
          subject_id: form.subject_id,
          subject_name: form.subject_name,
          subject_detail: form.subject_detail,
          enroll_day: form.day,
          start_time: formatTime(form.startTime),
          end_time: formatTime(form.endTime)
        })
      });
      if (res.ok) { loadEnrollments(); handleClear(); }
      else alert("Error saving class");
    } catch(err) { console.error(err); }
  };

  const handleClear = () => {
    setForm({ subject_id: '', subject_name: '', subject_detail: '', day: 'Mon', startTime: '09:00', endTime: '10:30' });
  };

  const handleClearTimetable = async () => {
    if (enrollments.length === 0) { alert('ตารางเรียนว่างอยู่แล้ว'); return; }
    if (!confirm(`ยืนยันการลบวิชาในตารางเรียนทั้งหมด ${enrollments.length} วิชา?`)) return;
    try {
      const res = await fetch(`/api/enroll?userId=${userId}`, { method: 'DELETE' });
      if (res.ok) setEnrollments([]);
      else { const err = await res.json(); alert('Error: ' + err.error); }
    } catch (err) { console.error(err); alert('เกิดข้อผิดพลาด'); }
  };

  // ---- Edit Modal Handlers ----
  const handleEditOpen = (e, enroll) => {
    e.preventDefault();
    e.stopPropagation();
    setEditForm({
      day: enroll.enroll_day,
      startTime: enroll.start_time.substring(0, 5),
      endTime: enroll.end_time.substring(0, 5),
    });
    setEditModal(enroll);
  };

  const handleEditClose = () => {
    setEditModal(null);
    setIsSavingEdit(false);
  };

  const handleEditSave = async () => {
    if (!editModal) return;
    setIsSavingEdit(true);
    try {
      const res = await fetch('/api/enroll', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId, 10),
          subject_id: editModal.subject_id,
          enroll_day: editForm.day,
          start_time: formatTime(editForm.startTime),
          end_time: formatTime(editForm.endTime),
        }),
      });
      if (res.ok) { loadEnrollments(); handleEditClose(); }
      else { const err = await res.json(); alert('Error: ' + err.error); }
    } catch (err) { console.error(err); alert('เกิดข้อผิดพลาด'); }
    finally { setIsSavingEdit(false); }
  };

  // ---- Timetable Helpers ----
  const getDynamicTimeSlots = () => {
    if (!enrollments || enrollments.length === 0) {
      return [
        '09.00-09.30', '09.30-10.00', '10.00-10.30', '10.30-11.00',
        '11.00-11.30', '11.30-12.00', '12.00-12.30', '12.30-13.00',
        '13.00-13.30', '13.30-14.00', '14.00-14.30', '14.30-15.00',
        '15.00-15.30', '15.30-16.00', '16.00-16.30', '16.30-17.00'
      ];
    }
    let minTime = 24 * 60, maxTime = 0;
    enrollments.forEach(e => {
      if (!e.start_time || !e.end_time) return;
      const [sh, sm] = e.start_time.split(':').map(Number);
      const [eh, em] = e.end_time.split(':').map(Number);
      const startMins = sh * 60 + sm;
      const endMins   = eh * 60 + em;
      if (startMins < minTime) minTime = startMins;
      if (endMins   > maxTime) maxTime = endMins;
    });
    if (minTime >= maxTime) return ['09.00-10.00'];
    minTime = Math.floor(minTime / 30) * 30;
    maxTime = Math.ceil(maxTime / 30) * 30;
    const slots = [];
    const fmt = (m) => `${String(Math.floor(m/60)).padStart(2,'0')}.${m%60===0?'00':m%60}`;
    for (let t = minTime; t < maxTime; t += 30) slots.push(`${fmt(t)}-${fmt(t+30)}`);
    return slots;
  };

  const TIME_SLOTS  = getDynamicTimeSlots();
  const DAYS        = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const SLOT_WIDTH  = 110;
  const SLOT_GAP    = 8;

  return (
    <div className="dashboard-layout">

      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <div className="sidebar-avatar" style={{ overflow: 'hidden' }}>
          {user?.users_profile_url && (
            <img src={user.users_profile_url} alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
        <p className="sidebar-username">User Name : {user?.users_name || '...'}</p>

        <button className="sidebar-logout-btn" onClick={() => router.push('/login')}>
          Logout
        </button>

        <nav className="sidebar-nav">
          <a className="sidebar-nav-btn active" href="">จัดตรางเรียน</a>
          <a className="sidebar-nav-btn" href="https://github.com">Open GitHub</a>
          <a className="sidebar-nav-btn" href="https://drive.google.com/drive/home">Open Google Drive</a>
          <a className="sidebar-nav-btn" href="https://www.canva.com/">Open Canva</a>
        </nav>
      </aside>

      {/* ===== Main ===== */}
      <main className="main-content">

        {/* --- Add Form Panel --- */}
        <section className="task-form-panel">
          <div className="form-col-left-span">
            <div className="form-group">
              <label className="form-label">รหัสวิชา :</label>
              <select className="form-select" name="subject_id" value={form.subject_id} onChange={handleFormChange}>
                <option value="">-- เลือกรหัสวิชา --</option>
                {availableSubjects.map(sub => (
                  <option key={sub.subject_id} value={sub.subject_id}>
                    {sub.subject_id} - {sub.subject_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">วิชา :</label>
              <input className="form-input" name="subject_name" value={form.subject_name} readOnly
                style={{ backgroundColor: '#f1f5f9', color: '#64748b' }} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">รายละเอียด :</label>
              <textarea className="form-textarea" name="subject_detail" rows={3} value={form.subject_detail} readOnly
                style={{ backgroundColor: '#f1f5f9', color: '#64748b' }} />
            </div>
          </div>

          <div style={{ gridColumn: 2, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">วันที่ :</label>
              <select className="form-select" name="day" value={form.day} onChange={handleFormChange}>
                {DAY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">เลือกเวลาเริ่ม :</label>
              <input type="time" className="form-input" name="startTime" value={form.startTime} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="form-label">เลือกเวลาออก :</label>
              <input type="time" className="form-input" name="endTime" value={form.endTime} onChange={handleFormChange} />
            </div>
          </div>

          <div className="form-buttons">
            <button className="btn-save" onClick={handleSave}>Save</button>
            <button className="btn-clear" onClick={handleClear}>Clear</button>
            <button className="btn-clear-timetable" onClick={handleClearTimetable}>
              🗑 Clear ตารางเรียน
            </button>
          </div>
        </section>

        {/* --- Calendar Grid --- */}
        <section className="calendar-area">
          <div className="time-slots-row">
            {TIME_SLOTS.map(slot => (
              <div key={slot} className="time-slot-chip" style={{ width: SLOT_WIDTH }}>{slot}</div>
            ))}
          </div>

          <div className="day-rows">
            {DAYS.map(day => (
              <div key={day} className="day-row">
                <div className="day-label">{day}</div>
                <div className="day-cells"
                  style={{ width: TIME_SLOTS.length * (SLOT_WIDTH + SLOT_GAP) - SLOT_GAP, display: 'flex', gap: SLOT_GAP, position: 'relative' }}
                >
                  {/* Background slots */}
                  {TIME_SLOTS.map(slot => (
                    <div key={slot} style={{ width: SLOT_WIDTH, background: 'transparent', borderRadius: 6 }} />
                  ))}

                  {/* Enrollment blocks */}
                  {enrollments.filter(e => e.enroll_day === day).map((enroll, idx) => {
                    if (!enroll.start_time || !enroll.end_time) return null;

                    const [sh, sm] = enroll.start_time.split(':').map(Number);
                    const [eh, em] = enroll.end_time.split(':').map(Number);
                    const startMins = sh * 60 + sm;
                    const endMins   = eh * 60 + em;

                    const [gsh, gsm] = TIME_SLOTS[0].split('-')[0].split('.').map(Number);
                    const gridStartMins = gsh * 60 + gsm;

                    const startSlotOffset = (startMins - gridStartMins) / 30;
                    const durationSlots   = (endMins - startMins) / 30;
                    const leftPx  = startSlotOffset * (SLOT_WIDTH + SLOT_GAP);
                    const widthPx = durationSlots * SLOT_WIDTH + (durationSlots - 1) * SLOT_GAP;

                    return (
                      <div
                        key={idx}
                        style={{
                          position: 'absolute', left: leftPx, top: 0, bottom: 0,
                          width: widthPx, borderRadius: 6, overflow: 'hidden',
                          zIndex: 10, boxSizing: 'border-box',
                        }}
                      >
                        {/* ปุ่ม ✏️ แก้ไข มุมขวาบน */}
                        <button
                          className="enroll-edit-btn"
                          title="แก้ไขวัน/เวลา"
                          onClick={(e) => handleEditOpen(e, enroll)}
                        >
                          ✏️
                        </button>

                        {/* คลิกเพื่อไปหน้า detail */}
                        <Link
                          href={`/dashboard/${encryptedUserId}/detail/${enroll.subject_id}`}
                          style={{
                            display: 'flex', flexDirection: 'column', justifyContent: 'center',
                            height: '100%', background: '#6366f1',
                            padding: '4px 28px 4px 8px',
                            color: '#fff', fontSize: '12px',
                            border: '1px solid #4f46e5',
                            textDecoration: 'none', cursor: 'pointer',
                            transition: 'opacity 0.15s ease, transform 0.1s ease',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = '1';    e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          <div style={{ fontWeight: 'bold' }}>{enroll.subject_id}</div>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {enroll.subject?.subject_name}
                          </div>
                          <div style={{ fontSize: '10px', marginTop: '2px', color: '#e0e7ff' }}>
                            {enroll.start_time.substring(0, 5)} - {enroll.end_time.substring(0, 5)}
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ===== Edit Modal ===== */}
      {editModal && (
        <div className="edit-modal-overlay" onClick={handleEditClose}>
          <div className="edit-modal-card" onClick={e => e.stopPropagation()}>

            <div className="edit-modal-header">
              <h2 className="edit-modal-title">✏️ แก้ไขตารางเรียน</h2>
              <button className="edit-modal-close" onClick={handleEditClose}>✕</button>
            </div>

            <div className="edit-modal-subject-badge">
              {editModal.subject_id} — {editModal.subject?.subject_name}
            </div>

            <div className="edit-modal-body">
              <div className="edit-modal-field">
                <label className="edit-modal-label">วัน</label>
                <select className="edit-modal-select" value={editForm.day}
                  onChange={e => setEditForm({ ...editForm, day: e.target.value })}>
                  {DAY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="edit-modal-field">
                <label className="edit-modal-label">เวลาเริ่ม</label>
                <input type="time" className="edit-modal-input" value={editForm.startTime}
                  onChange={e => setEditForm({ ...editForm, startTime: e.target.value })} />
              </div>

              <div className="edit-modal-field">
                <label className="edit-modal-label">เวลาออก</label>
                <input type="time" className="edit-modal-input" value={editForm.endTime}
                  onChange={e => setEditForm({ ...editForm, endTime: e.target.value })} />
              </div>
            </div>

            <div className="edit-modal-actions">
              <button className="edit-modal-cancel-btn" onClick={handleEditClose} disabled={isSavingEdit}>
                ยกเลิก
              </button>
              <button className="edit-modal-save-btn" onClick={handleEditSave} disabled={isSavingEdit}>
                {isSavingEdit ? 'กำลังบันทึก...' : '💾 บันทึก'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
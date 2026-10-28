'use client'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import NotificationCenter from "@/components/notifications/NotificationCenter";

export default function DashboardClient({
  userId,
  encryptedUserId,
  initialUser = null,
  initialEnrollments = [],
  initialSubjects = []
}) {
  const router = useRouter();

  const [user, setUser] = useState(initialUser);
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [availableSubjects, setAvailableSubjects] = useState(initialSubjects);
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
  const [isSaving, setIsSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // ---- Load Data ----
  // ใช้สำหรับ refetch enrollments เดี่ยวๆ หลังจาก add/edit/delete
  const loadEnrollments = async () => {
    try {
      const res = await fetch(`/api/enroll?userId=${userId}`);
      const data = await res.json();
      if (!data.error && Array.isArray(data)) setEnrollments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!userId) return;
    // ถ้าไม่มี initialData มาจาก Server ค่อย fetch ฝั่ง client สำรอง
    if (!initialUser || initialSubjects.length === 0) {
      Promise.all([
        fetch(`/api/users/${userId}`).then(r => r.json()),
        fetch(`/api/enroll?userId=${userId}`).then(r => r.json()),
        fetch('/api/subject').then(r => r.json()),
      ])
        .then(([userData, enrollData, subjectData]) => {
          if (!userData.error)                              setUser(userData);
          if (!enrollData.error && Array.isArray(enrollData)) setEnrollments(enrollData);
          if (!subjectData.error && Array.isArray(subjectData)) setAvailableSubjects(subjectData);
        })
        .catch(err => console.error('Initial load error:', err));
    }
  }, [userId, initialUser, initialSubjects.length]);

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

  // ---- Overlap Detection ----
  // คืน true ถ้า [startA, endA) ทับกับ [startB, endB) บนวันเดียวกัน
  const hasTimeConflict = (day, newStartMins, newEndMins, excludeSubjectId = null) => {
    return enrollments.some(e => {
      if (e.enroll_day !== day) return false;
      if (excludeSubjectId && e.subject_id === excludeSubjectId) return false;
      if (!e.start_time || !e.end_time) return false;
      const [sh, sm] = e.start_time.split(':').map(Number);
      const [eh, em] = e.end_time.split(':').map(Number);
      const eStart = sh * 60 + sm;
      const eEnd   = eh * 60 + em;
      // ทับกันเมื่อ interval overlap
      return newStartMins < eEnd && newEndMins > eStart;
    });
  };

  const handleSave = async () => {
    // ตรวจสอบ overlap ก่อนบันทึก
    const [sh, sm] = form.startTime.split(':').map(Number);
    const [eh, em] = form.endTime.split(':').map(Number);
    const newStart = sh * 60 + sm;
    const newEnd   = eh * 60 + em;

    if (newEnd <= newStart) {
      alert('เวลาออกต้องมากกว่าเวลาเริ่ม');
      return;
    }

    if (hasTimeConflict(form.day, newStart, newEnd)) {
      alert('เวลาเรียนของคุณทับกัน');
      return;
    }

    setIsSaving(true);
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
      if (res.ok) { loadEnrollments(); handleClear(); setFormOpen(false); }
      else alert('Error saving class');
    } catch(err) { console.error(err); }
    finally { setIsSaving(false); }
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

    // ตรวจสอบ overlap ก่อนบันทึก (ยกเว้นวิชาที่กำลังแก้ไข)
    const [sh, sm] = editForm.startTime.split(':').map(Number);
    const [eh, em] = editForm.endTime.split(':').map(Number);
    const newStart = sh * 60 + sm;
    const newEnd   = eh * 60 + em;

    if (newEnd <= newStart) {
      alert('เวลาออกต้องมากกว่าเวลาเริ่ม');
      return;
    }

    if (hasTimeConflict(editForm.day, newStart, newEnd, editModal.subject_id)) {
      alert('เวลาเรียนของคุณทับกัน');
      return;
    }

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
  const DAY_TH = { Mon: 'จันทร์', Tue: 'อังคาร', Wed: 'พุธ', Thu: 'พฤหัส', Fri: 'ศุกร์', Sat: 'เสาร์', Sun: 'อาทิตย์' };
  const SLOT_WIDTH  = 110;
  const SLOT_GAP    = 8;

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={`dashboard-layout${menuOpen ? ' menu-open' : ''}`}>
      <header className="app-topbar">
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="app-topbar-brand">
          <span className="app-topbar-mark">WP</span>
          <div>
            <p className="app-topbar-title">ตารางเรียน</p>
            <p className="app-topbar-sub">{user?.users_name || 'กำลังโหลด...'}</p>
          </div>
        </div>
        <NotificationCenter userId={userId} encryptedUserId={encryptedUserId} subjects={availableSubjects} />
      </header>

      {menuOpen && <button className="sidebar-backdrop" onClick={closeMenu} aria-label="ปิดเมนู" />}

      <aside className={`sidebar${menuOpen ? ' open' : ''}`}>
        <div className="sidebar-avatar">
          {user?.users_profile_url && (
            <img src={user.users_profile_url} alt="Profile" />
          )}
        </div>
        <p className="sidebar-username">{user?.users_name || '...'}</p>

        <button className="sidebar-logout-btn" onClick={async () => {
            await fetch('/api/logout', { method: 'POST' });
            router.push('/login');
          }}>
          ออกจากระบบ
        </button>

        <nav className="sidebar-nav">
          <a className="sidebar-nav-btn active" href="" onClick={closeMenu}>ตารางเรียน</a>
          <a className="sidebar-nav-btn" href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a className="sidebar-nav-btn" href="https://drive.google.com/drive/home" target="_blank" rel="noopener noreferrer">Google Drive</a>
          <a className="sidebar-nav-btn" href="https://www.canva.com/" target="_blank" rel="noopener noreferrer">Canva</a>
        </nav>
      </aside>

      <main className="main-content">
        <div className="mobile-toolbar">
          <button className="form-toggle-btn" onClick={() => setFormOpen((open) => !open)}>
            {formOpen ? 'ซ่อนฟอร์มเพิ่มวิชา' : '+ เพิ่มวิชาในตาราง'}
          </button>
        </div>

        <section className={`task-form-panel${formOpen ? ' is-open' : ''}`}>
          <div className="form-col-left-span">
            <div className="form-group">
              <label className="form-label">รหัสวิชา</label>
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
              <label className="form-label">วิชา</label>
              <input className="form-input" name="subject_name" value={form.subject_name} readOnly placeholder="เลือกวิชาแล้วจะขึ้นอัตโนมัติ" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">รายละเอียด</label>
              <textarea className="form-textarea" name="subject_detail" rows={3} value={form.subject_detail} readOnly placeholder="รายละเอียดวิชา" />
            </div>
          </div>

          <div className="form-col-center-panel">
            <div className="form-group">
              <label className="form-label">วันที่</label>
              <select className="form-select" name="day" value={form.day} onChange={handleFormChange}>
                {DAY_OPTIONS.map(d => <option key={d} value={d}>{DAY_TH[d]} ({d})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">เวลาเริ่ม</label>
              <input type="time" className="form-input" name="startTime" value={form.startTime} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="form-label">เวลาออก</label>
              <input type="time" className="form-input" name="endTime" value={form.endTime} onChange={handleFormChange} />
            </div>
          </div>

          <div className="form-buttons">
            <button
              className={`btn-save${isSaving ? ' btn-loading' : ''}`}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <><span className="spinner spinner-sm" /> กำลังบันทึก...</> : 'บันทึกวิชา'}
            </button>
            <button className="btn-clear" onClick={handleClear}>ล้างฟอร์ม</button>
            <button className="btn-clear-timetable" onClick={handleClearTimetable}>
              ลบตารางทั้งหมด
            </button>
          </div>
        </section>

        <section className="schedule-mobile">
          {enrollments.length === 0 ? (
            <div className="detail-empty">ยังไม่มีวิชาในตาราง กด “เพิ่มวิชาในตาราง” เพื่อเริ่มต้น</div>
          ) : DAYS.map((day) => {
            const dayItems = enrollments.filter((e) => e.enroll_day === day);
            if (dayItems.length === 0) return null;
            return (
              <div key={day} className="schedule-day-group">
                <h3 className="schedule-day-title">{DAY_TH[day]} <span>{day}</span></h3>
                {dayItems.map((enroll) => (
                  <article key={`${day}-${enroll.subject_id}`} className="schedule-card">
                    <div>
                      <p className="schedule-card-code">{enroll.subject_id}</p>
                      <p className="schedule-card-name">{enroll.subject?.subject_name || '—'}</p>
                      <p className="schedule-card-time">
                        {enroll.start_time?.substring(0, 5)} – {enroll.end_time?.substring(0, 5)}
                      </p>
                    </div>
                    <div className="schedule-card-actions">
                      <button className="schedule-edit-btn" onClick={(e) => handleEditOpen(e, enroll)}>แก้ไข</button>
                      <Link className="schedule-open-btn" href={`/dashboard/${encryptedUserId}/detail/${enroll.subject_id}`}>
                        ดูงาน
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            );
          })}
        </section>

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
                  {TIME_SLOTS.map(slot => (
                    <div key={slot} style={{ width: SLOT_WIDTH, background: 'transparent', borderRadius: 6 }} />
                  ))}

                  {enrollments.filter(e => e.enroll_day === day).map((enroll, idx) => {
                    if (!enroll.start_time || !enroll.end_time) return null;

                    const [sh, sm] = enroll.start_time.split(':').map(Number);
                    const [eh, em] = enroll.end_time.split(':').map(Number);
                    const startMins = sh * 60 + sm;
                    const endMins   = eh * 60 + em;
                    const durationSlots = Math.max((endMins - startMins) / 30, 1);

                    const [gsh, gsm] = TIME_SLOTS[0].split('-')[0].split('.').map(Number);
                    const gridStartMins = gsh * 60 + gsm;

                    const startSlotOffset = (startMins - gridStartMins) / 30;
                    const leftPx  = startSlotOffset * (SLOT_WIDTH + SLOT_GAP);
                    const widthPx = durationSlots * SLOT_WIDTH + (durationSlots - 1) * SLOT_GAP;

                    return (
                      <div
                        key={idx}
                        className="enroll-block-wrap"
                        style={{ left: leftPx, width: widthPx }}
                      >
                        <button
                          className="enroll-edit-btn"
                          title="แก้ไขวัน/เวลา"
                          onClick={(e) => handleEditOpen(e, enroll)}
                        >
                          แก้ไข
                        </button>
                        <Link
                          href={`/dashboard/${encryptedUserId}/detail/${enroll.subject_id}`}
                          className="enroll-block"
                        >
                          <span className="enroll-block-id">{enroll.subject_id}</span>
                          <span className="enroll-block-name">{enroll.subject?.subject_name}</span>
                          <span className="enroll-block-time">
                            {enroll.start_time.substring(0, 5)} - {enroll.end_time.substring(0, 5)}
                          </span>
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
                {isSavingEdit
                  ? <><span className="spinner spinner-sm" /> กำลังบันทึก...</>
                  : '💾 บันทึก'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
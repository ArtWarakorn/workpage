'use client'
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const params = useParams();
  const userId = params?.userId;
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [form, setForm] = useState({
    subject_id: '',
    subject_name: '',
    subject_detail: '',
    day: 'Mon',
    startTime: '09:00',
    endTime: '10:30'
  });

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
        .then(data => {
          if (!data.error) {
            setUser(data);
          }
        })
        .catch(err => console.error(err));
        
      loadEnrollments();
    }
  }, [userId]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
          userId: parseInt(userId),
          subject_id: form.subject_id,
          subject_name: form.subject_name,
          subject_detail: form.subject_detail,
          enroll_day: form.day,
          start_time: formatTime(form.startTime),
          end_time: formatTime(form.endTime)
        })
      });
      if (res.ok) {
        loadEnrollments();
        handleClear();
      } else {
        alert("Error saving class");
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleClear = () => {
    setForm({
      subject_id: '',
      subject_name: '',
      subject_detail: '',
      day: 'Mon',
      startTime: '09:00',
      endTime: '10:30'
    });
  };

  const getDynamicTimeSlots = () => {
    if (!enrollments || enrollments.length === 0) {
      return [
        '09.00-09.30', '09.30-10.00', '10.00-10.30', '10.30-11.00',
        '11.00-11.30', '11.30-12.00', '12.00-12.30', '12.30-13.00',
        '13.00-13.30', '13.30-14.00', '14.00-14.30', '14.30-15.00',
        '15.00-15.30', '15.30-16.00', '16.00-16.30', '16.30-17.00'
      ];
    }

    let minTime = 24 * 60;
    let maxTime = 0;

    enrollments.forEach(e => {
      if (!e.start_time || !e.end_time) return;
      const startParts = e.start_time.split(':');
      const startMins = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10);
      if (startMins < minTime) minTime = startMins;

      const endParts = e.end_time.split(':');
      const endMins = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);
      if (endMins > maxTime) maxTime = endMins;
    });
    
    if (minTime >= maxTime) return ['09.00-10.00'];

    minTime = Math.floor(minTime / 30) * 30;
    maxTime = Math.ceil(maxTime / 30) * 30;

    const slots = [];
    for (let t = minTime; t < maxTime; t += 30) {
      const formatMin = (m) => {
        const h = Math.floor(m / 60);
        const mins = m % 60;
        return `${String(h).padStart(2, '0')}.${mins === 0 ? '00' : mins}`;
      };
      slots.push(`${formatMin(t)}-${formatMin(t + 30)}`);
    }

    return slots;
  };

  const TIME_SLOTS = getDynamicTimeSlots();

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const SLOT_WIDTH = 110;
  const SLOT_GAP = 8;

  return (
    <div className="dashboard-layout">

      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <div className="sidebar-avatar" style={{ overflow: 'hidden' }}>
          {user?.users_profile_url && (
            <img 
              src={user.users_profile_url} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          )}
        </div>
        <p className="sidebar-username">User Name : {user?.users_name || '...'}</p>

        <nav className="sidebar-nav">
          <a className="sidebar-nav-btn active" href="">จัดตรางเรียน</a>
          <a className="sidebar-nav-btn" href="https://github.com">Open GitHub</a>
          <a className="sidebar-nav-btn" href="https://drive.google.com/drive/home">Open Google Drive</a>
          <a className="sidebar-nav-btn" href="https://www.canva.com/">Open Canva</a>
        </nav>
      </aside>

      {/* ===== Main ===== */}
      <main className="main-content">

        {/* --- Task Form Panel --- */}
        <section className="task-form-panel">

          {/* Col 1: task name + detail */}
          <div className="form-col-left-span">
            <div className="form-group">
              <label className="form-label">รหัสวิชา :</label>
              <input className="form-input" name="subject_id" value={form.subject_id} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="form-label">วิชา :</label>
              <input className="form-input" name="subject_name" value={form.subject_name} onChange={handleFormChange} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">รายละเอียด :</label>
              <textarea className="form-textarea" name="subject_detail" rows={3} value={form.subject_detail} onChange={handleFormChange} />
            </div>
          </div>

          {/* Col 2: date + time selects */}
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

          {/* Col 3: buttons */}
          <div className="form-buttons">
            <button className="btn-save" onClick={handleSave}>Save</button>
            <button className="btn-clear" onClick={handleClear}>Clear</button>
          </div>
        </section>

        {/* --- Calendar Grid --- */}
        <section className="calendar-area">

          {/* Time slots header */}
          <div className="time-slots-row">
            {TIME_SLOTS.map(slot => (
              <div key={slot} className="time-slot-chip" style={{ width: SLOT_WIDTH }}>
                {slot}
              </div>
            ))}
          </div>

          {/* Day rows */}
          <div className="day-rows">
            {DAYS.map(day => (
              <div key={day} className="day-row">
                <div className="day-label">{day}</div>
                <div
                  className="day-cells"
                  style={{ width: TIME_SLOTS.length * (SLOT_WIDTH + SLOT_GAP) - SLOT_GAP, display: 'flex', gap: SLOT_GAP, position: 'relative' }}
                >
                  {/* Background Slots */}
                  {TIME_SLOTS.map(slot => (
                    <div key={slot} style={{ width: SLOT_WIDTH, background: 'transparent', borderRadius: 6 }} />
                  ))}

                  {/* Absolutely positioned enrollments */}
                  {enrollments.filter(e => e.enroll_day === day).map((enroll, idx) => {
                    if (!enroll.start_time || !enroll.end_time) return null;
                    
                    const startParts = enroll.start_time.split(':');
                    const startMins = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10);
                    
                    const endParts = enroll.end_time.split(':');
                    const endMins = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);
                    
                    const gridStartParts = TIME_SLOTS[0].split('-')[0].split('.');
                    const gridStartMins = parseInt(gridStartParts[0], 10) * 60 + parseInt(gridStartParts[1], 10);
                    
                    const startSlotOffset = (startMins - gridStartMins) / 30;
                    const durationSlots = (endMins - startMins) / 30;

                    const leftPx = startSlotOffset * (SLOT_WIDTH + SLOT_GAP);
                    const widthPx = durationSlots * SLOT_WIDTH + (durationSlots - 1) * SLOT_GAP;

                    return (
                      <Link
                        key={idx}
                        href={`/dashboard/${userId}/detail/${enroll.subject_id}`}
                        style={{ 
                          position: 'absolute',
                          left: leftPx,
                          top: 0,
                          bottom: 0,
                          width: widthPx, 
                          background: '#6366f1', 
                          borderRadius: 6, 
                          padding: '4px 8px', 
                          color: '#fff', 
                          fontSize: '12px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'center', 
                          border: '1px solid #4f46e5',
                          overflow: 'hidden',
                          zIndex: 10,
                          boxSizing: 'border-box',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          transition: 'opacity 0.15s ease, transform 0.1s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        <div style={{fontWeight: 'bold'}}>{enroll.subject_id}</div>
                        <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{enroll.subject?.subject_name}</div>
                        <div style={{fontSize: '10px', marginTop: '2px', color: '#e0e7ff'}}>
                          {enroll.start_time.substring(0, 5)} - {enroll.end_time.substring(0, 5)}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
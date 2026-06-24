'use client'
import { useRouter } from "next/navigation";

export default function DashboardPage() {

  const TIME_SLOTS = [
    '9.00-9.30', '10.00-10.30', '11.00-11.30', '12.00-12.30',
    '13.00-13.30', '14.00-14.30', '15.00-15.30', '16.00-16.30',
  ];

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const SLOT_WIDTH = 110;
  const SLOT_GAP = 8;

  return (
    <div className="dashboard-layout">

      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <div className="sidebar-avatar"></div>
        <p className="sidebar-username">User Name : </p>

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
              <input className="form-input" name="name" />
            </div>
            <div className="form-group">
              <label className="form-label">วิชา :</label>
              <input className="form-input" name="name" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">รายละเอียด :</label>
              <textarea className="form-textarea" name="detail" rows={3} />
            </div>
          </div>

          {/* Col 2: date + time selects */}
          <div style={{ gridColumn: 2, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">วันที่ :</label>
              <select className="form-select" name="day">
                {DAY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">เลือกเวลาเริ่ม :</label>
              <select className="form-select" name="startTime">
                {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">เลือกเวลาออก :</label>
              <select className="form-select" name="endTime">
                {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Col 3: buttons */}
          <div className="form-buttons">
            <button className="btn-save">Save</button>
            <button className="btn-clear">Clear</button>
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
                  style={{ width: TIME_SLOTS.length * (SLOT_WIDTH + SLOT_GAP) - SLOT_GAP }}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
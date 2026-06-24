"use client";
import React, { useState } from 'react';

export default function DetailPage({ params }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Example data
  const sub_id = "CSCXXX";
  const sub_name = "Software Engineering";

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "งานที่ 1 (ตัวอย่าง)",
      detail: "รายละเอียดงานที่ 1",
      orderDate: "2026-06-24",
      dueDate: "2026-06-30",
      status: true // true = done (green)
    },
    {
      id: 2,
      title: "งานที่ 2 (ตัวอย่าง)",
      detail: "รายละเอียดงานที่ 2",
      orderDate: "2026-06-24",
      dueDate: "2026-06-28",
      status: false // false = pending (red)
    }
  ]);

  const toggleStatus = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: !task.status } : task
      )
    );
  };

  return (
    <div className="detail-layout">
      {/* Sidebar */}
      <div className="detail-sidebar">
        <div className="detail-sidebar-info">
          <p>รหัสวิชา : {sub_id}</p>
          <p>วิชา : {sub_name}</p>
        </div>
        <button 
          className="detail-add-btn" 
          onClick={() => setIsModalOpen(true)}
        >
          เพิ่มงาน
        </button>
      </div>

      {/* Main Content */}
      <div className="detail-main">
        <div className="task-list">
          {tasks.map(task => (
            <div key={task.id} className={`task-card ${task.status ? 'status-done' : 'status-pending'}`}>
              <p><strong>หัวข้อ :</strong> {task.title}</p>
              <p><strong>รายละเอียด :</strong> {task.detail}</p>
              <div className="task-card-dates">
                <span><strong>วันที่สั่ง :</strong> {task.orderDate}</span>
                <span><strong>วันที่ส่ง :</strong> {task.dueDate}</span>
              </div>
              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <button 
                  className="task-status-btn"
                  onClick={() => toggleStatus(task.id)}
                >
                  เปลี่ยนเป็น {task.status ? 'ยังไม่เสร็จ' : 'เสร็จแล้ว'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="detail-modal-overlay">
          <div className="detail-modal">
            <div className="detail-modal-form">
              <div className="detail-form-group">
                <label>หัวข้อ :</label>
                <input type="text" className="detail-input" />
              </div>
              <div className="detail-form-group">
                <label>รายละเอียด :</label>
                <input type="text" className="detail-input" />
              </div>
              <div className="detail-form-group">
                <label>วันที่ส่ง :</label>
                <input type="date" className="detail-input" />
              </div>
              <div className="detail-form-group align-top">
                <label>รายละเอียด :</label>
                <textarea className="detail-textarea"></textarea>
              </div>
              <div className="detail-form-group">
                <label>เสร็จยัง :</label>
                <select className="detail-select">
                  <option value="false">ยัง</option>
                  <option value="true">เสร็จแล้ว</option>
                </select>
              </div>
              <div className="detail-modal-actions">
                <button 
                  className="detail-save-btn" 
                  onClick={() => setIsModalOpen(false)}
                >
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

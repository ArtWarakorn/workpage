'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationCenter({ userId, encryptedUserId, onWorkUpdated }) {
  const router = useRouter();
  const [works, setWorks] = useState([]);
  const [subjectsMap, setSubjectsMap] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'overdue', 'today', 'soon'
  const [loading, setLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const dropdownRef = useRef(null);

  // Load subject names dictionary
  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subject');
      const data = await res.json();
      if (Array.isArray(data)) {
        const map = {};
        data.forEach(s => {
          map[s.subject_id] = s.subject_name;
        });
        setSubjectsMap(map);
      }
    } catch (err) {
      console.error('Error loading subjects for notification:', err);
    }
  };

  // Load user's tasks
  const fetchUserWorks = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/work?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setWorks(data);
      }
    } catch (err) {
      console.error('Error loading works for notification:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchUserWorks();
  }, [userId]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark task as done from notification panel
  const handleMarkDone = async (e, workId) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/work/${workId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ work_status: true }),
      });
      if (res.ok) {
        fetchUserWorks();
        if (onWorkUpdated) onWorkUpdated();
      }
    } catch (err) {
      console.error('Error completing work:', err);
    }
  };

  // Calculate task status & urgency relative to today
  const calculateUrgency = (endDateStr) => {
    if (!endDateStr) return { type: 'nodate', diffDays: null, label: 'ไม่ระบุวันส่ง', colorClass: 'badge-nodate' };

    const parts = endDateStr.split('-');
    if (parts.length !== 3) return { type: 'nodate', diffDays: null, label: endDateStr, colorClass: 'badge-nodate' };

    const endYear = parseInt(parts[0], 10);
    const endMonth = parseInt(parts[1], 10) - 1;
    const endDay = parseInt(parts[2], 10);

    const endDate = new Date(endYear, endMonth, endDay);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const daysAgo = Math.abs(diffDays);
      return {
        type: 'overdue',
        diffDays,
        label: `🚨 เลยกำหนด ${daysAgo} วัน`,
        colorClass: 'urgency-overdue',
      };
    } else if (diffDays === 0) {
      return {
        type: 'today',
        diffDays,
        label: `⚡ หมดเขตวันนี้!`,
        colorClass: 'urgency-today',
      };
    } else if (diffDays === 1) {
      return {
        type: 'tomorrow',
        diffDays,
        label: `⚠️ ส่งพรุ่งนี้!`,
        colorClass: 'urgency-soon',
      };
    } else if (diffDays <= 3) {
      return {
        type: 'soon',
        diffDays,
        label: `⏰ เหลืออีก ${diffDays} วัน`,
        colorClass: 'urgency-soon',
      };
    } else {
      return {
        type: 'upcoming',
        diffDays,
        label: `📅 เหลืออีก ${diffDays} วัน`,
        colorClass: 'urgency-upcoming',
      };
    }
  };

  // Filter pending tasks only
  const pendingWorks = works.filter(w => !w.work_status);

  // Categorized tasks
  const tasksWithUrgency = pendingWorks.map(w => ({
    ...w,
    urgency: calculateUrgency(w.work_date_end),
    subjectName: w.subject?.subject_name || subjectsMap[w.subject_id] || w.subject_id,
  }));

  const overdueTasks = tasksWithUrgency.filter(t => t.urgency.type === 'overdue');
  const todayTasks = tasksWithUrgency.filter(t => t.urgency.type === 'today');
  const soonTasks = tasksWithUrgency.filter(t => t.urgency.type === 'tomorrow' || t.urgency.type === 'soon');
  const urgentTasksCount = overdueTasks.length + todayTasks.length + soonTasks.length;

  // Filtered tasks for notification panel display
  const displayTasks = tasksWithUrgency.filter(t => {
    if (filter === 'overdue') return t.urgency.type === 'overdue';
    if (filter === 'today') return t.urgency.type === 'today';
    if (filter === 'soon') return t.urgency.type === 'tomorrow' || t.urgency.type === 'soon';
    return t.urgency.type === 'overdue' || t.urgency.type === 'today' || t.urgency.type === 'tomorrow' || t.urgency.type === 'soon';
  }).sort((a, b) => (a.urgency.diffDays ?? 999) - (b.urgency.diffDays ?? 999));

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      {/* Top Banner Alert on Dashboard when urgent tasks exist */}
      {!bannerDismissed && urgentTasksCount > 0 && (
        <div className="notification-banner">
          <div className="banner-content">
            <span className="banner-icon">🔔</span>
            <div className="banner-text">
              <strong>การแจ้งเตือนงานใกล้หมดเวลา:</strong>
              {overdueTasks.length > 0 && (
                <span className="banner-tag tag-overdue">เลยกำหนด {overdueTasks.length} งาน</span>
              )}
              {todayTasks.length > 0 && (
                <span className="banner-tag tag-today">ส่งวันนี้ {todayTasks.length} งาน</span>
              )}
              {soonTasks.length > 0 && (
                <span className="banner-tag tag-soon">ใกล้ส่ง (1-3 วัน) {soonTasks.length} งาน</span>
              )}
            </div>
          </div>
          <div className="banner-actions">
            <button className="banner-btn" onClick={() => setIsOpen(true)}>
              ดูงานทั้งหมด ({urgentTasksCount})
            </button>
            <button className="banner-close-btn" onClick={() => setBannerDismissed(true)} title="ปิดการแจ้งเตือนนี้">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Bell Button */}
      <button
        className={`notification-bell-btn ${urgentTasksCount > 0 ? 'has-notifications' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="การแจ้งเตือนงาน"
      >
        <svg className="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {urgentTasksCount > 0 && (
          <span className="bell-badge">
            {urgentTasksCount > 99 ? '99+' : urgentTasksCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notif-header">
            <div className="notif-title-row">
              <h3>🔔 งานที่ใกล้หมดเวลาส่ง</h3>
              <span className="notif-count-pill">{urgentTasksCount} รายการ</span>
            </div>

            {/* Filter Tabs */}
            <div className="notif-tabs">
              <button
                className={`notif-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                ทั้งหมด ({urgentTasksCount})
              </button>
              <button
                className={`notif-tab ${filter === 'overdue' ? 'active' : ''}`}
                onClick={() => setFilter('overdue')}
              >
                🚨 เลยกำหนด ({overdueTasks.length})
              </button>
              <button
                className={`notif-tab ${filter === 'today' ? 'active' : ''}`}
                onClick={() => setFilter('today')}
              >
                ⚡ ส่งวันนี้ ({todayTasks.length})
              </button>
              <button
                className={`notif-tab ${filter === 'soon' ? 'active' : ''}`}
                onClick={() => setFilter('soon')}
              >
                ⏰ 1-3 วัน ({soonTasks.length})
              </button>
            </div>
          </div>

          <div className="notif-body">
            {loading ? (
              <div className="notif-loading">กำลังโหลดการแจ้งเตือน...</div>
            ) : displayTasks.length === 0 ? (
              <div className="notif-empty">
                <span className="empty-icon">🎉</span>
                <p>ไม่มีงานที่ใกล้หมดเวลาในหมวดนี้</p>
              </div>
            ) : (
              <div className="notif-list">
                {displayTasks.map(task => (
                  <div key={task.work_id} className={`notif-item ${task.urgency.colorClass}`}>
                    <div className="notif-item-header">
                      <span className="notif-subject-badge">
                        {task.subject_id} — {task.subjectName}
                      </span>
                      <span className={`notif-urgency-badge ${task.urgency.colorClass}`}>
                        {task.urgency.label}
                      </span>
                    </div>

                    <h4 className="notif-task-title">{task.work_title}</h4>
                    {task.work_detail && (
                      <p className="notif-task-detail">{task.work_detail}</p>
                    )}

                    <div className="notif-item-footer">
                      <span className="notif-date-info">
                        📅 กำหนดส่ง: {task.work_date_end || 'ไม่ระบุ'}
                      </span>
                      <div className="notif-item-actions">
                        <button
                          className="notif-done-btn"
                          onClick={(e) => handleMarkDone(e, task.work_id)}
                          title="ทำเสร็จแล้ว"
                        >
                          ✓ เสร็จแล้ว
                        </button>
                        <button
                          className="notif-view-btn"
                          onClick={() => {
                            setIsOpen(false);
                            router.push(`/dashboard/${encryptedUserId}/detail/${task.subject_id}`);
                          }}
                        >
                          🔗 ดูงาน
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

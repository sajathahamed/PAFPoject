import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import notificationService from '../services/notificationService';
import '../styles/DashboardSidebar.css';

const POLL_MS = 45000;
const PANEL_LIMIT = 8;

function formatTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString();
  } catch {
    return '';
  }
}

function getTypeIcon(type) {
  switch (type) {
    case 'BOOKING_APPROVED':
    case 'BOOKING_REJECTED':
    case 'BOOKING_UPDATE':
      return '📅';
    case 'TICKET_STATUS_CHANGED':
    case 'TICKET_ASSIGNED':
      return '🎫';
    case 'NEW_COMMENT':
      return '💬';
    case 'SYSTEM_ALERT':
      return '🔔';
    default:
      return '📢';
  }
}

export default function NotificationBell({ compact = false }) {
  const navigate = useNavigate();
  const { isTechnician, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState([]);
  const [loadingPanel, setLoadingPanel] = useState(false);
  const wrapRef = useRef(null);

  const refreshUnread = useCallback(async () => {
    try {
      const n = await notificationService.getUnreadCount();
      setUnreadCount(typeof n === 'number' ? n : 0);
    } catch {
      /* ignore poll errors */
    }
  }, []);

  const loadRecent = useCallback(async () => {
    setLoadingPanel(true);
    try {
      const all = await notificationService.getNotifications({});
      setItems(Array.isArray(all) ? all.slice(0, PANEL_LIMIT) : []);
    } catch {
      setItems([]);
    } finally {
      setLoadingPanel(false);
    }
  }, []);

  useEffect(() => {
    refreshUnread();
    const t = setInterval(refreshUnread, POLL_MS);
    return () => clearInterval(t);
  }, [refreshUnread]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const toggle = (e) => {
    e.stopPropagation();
    const next = !open;
    setOpen(next);
    if (next) {
      loadRecent();
      refreshUnread();
    }
  };

  const handleItemClick = async (n) => {
    try {
      if (!n.isRead && n.id) {
        await notificationService.markAsRead(n.id);
      }
    } catch {
      /* still navigate */
    }
    refreshUnread();
    setOpen(false);
    if (n.relatedEntityType === 'TICKET' && n.relatedId) {
      if (isTechnician()) navigate('/technician/tickets');
      else if (!isAdmin()) navigate('/student/tickets');
      else navigate('/dashboard');
    } else if (n.relatedEntityType === 'BOOKING' && n.relatedId) {
      navigate('/bookings');
    }
  };

  const buttonClass = `nav-item notification-bell ${compact ? 'notification-bell--compact' : ''}`;

  return (
    <div className="notification-bell-wrapper" ref={wrapRef}>
      <button
        type="button"
        className={buttonClass}
        onClick={toggle}
        title="Notifications"
        aria-expanded={open}
        aria-label="Notifications"
        style={{
          border: 'none',
          background: open ? 'var(--sidebar-hover)' : 'transparent',
          position: 'relative',
          width: compact ? 40 : 'auto',
          minWidth: compact ? 40 : undefined,
          justifyContent: 'center',
        }}
      >
        <span className="nav-icon" style={{ position: 'relative', display: 'flex' }}>
          <Bell size={20} strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </span>
        {!compact && <span className="nav-label">Alerts</span>}
      </button>

      {open && (
        <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
          <div className="notification-header">
            <span>Notifications</span>
            <Link to="/notifications" onClick={() => setOpen(false)}>
              View all
            </Link>
          </div>
          <div className="notification-list">
            {loadingPanel ? (
              <div className="notification-empty">Loading…</div>
            ) : items.length === 0 ? (
              <div className="notification-empty">No notifications yet</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                  onClick={() => handleItemClick(n)}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{getTypeIcon(n.type)}</span>
                    <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
                      {(n.title || n.type) && (
                        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>
                          {n.title || String(n.type || '').replace(/_/g, ' ')}
                        </div>
                      )}
                      <div className="notification-message">{n.message}</div>
                      <div className="notification-time">{formatTime(n.createdAt)}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

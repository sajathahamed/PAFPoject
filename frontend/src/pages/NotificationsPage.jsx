import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import DashboardSidebar from '../components/DashboardSidebar';
import notificationService from '../services/notificationService';

function parseCreatedAt(val) {
  if (val == null) return null;
  if (typeof val === 'string') {
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (Array.isArray(val) && val.length >= 3) {
    const [y, m, d, h = 0, min = 0, s = 0, nano = 0] = val;
    return new Date(y, m - 1, d, h, min, s, Math.floor(nano / 1e6));
  }
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(d) {
  if (!d) return '';
  try {
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

const FILTERS = [
  { id: 'all', label: 'All', param: null },
  { id: 'unread', label: 'Unread', param: false },
  { id: 'read', label: 'Read', param: true },
];

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user, isTechnician, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async () => {
    const f = FILTERS.find((x) => x.id === filter);
    const isReadParam = f ? f.param : null;
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(
        isReadParam === null ? {} : { isRead: isReadParam }
      );
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load, user?.id]);

  const handleOpenNotification = async (n) => {
    if (!n?.id) return;
    try {
      if (!n.isRead) {
        await notificationService.markAsRead(n.id);
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
        );
      }
    } catch (e) {
      console.error(e);
    }
    if (n.relatedEntityType === 'TICKET' && n.relatedId) {
      if (isTechnician()) navigate('/technician/tickets');
      else if (!isAdmin()) navigate('/student/tickets');
      else navigate('/dashboard');
    } else if (n.relatedEntityType === 'BOOKING' && n.relatedId) {
      navigate('/bookings');
    }
  };

  const handleMarkAllRead = async () => {
    setActionBusy(true);
    try {
      await notificationService.markAllAsRead();
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionBusy(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <div className="dashboard-content" style={{ padding: '20px' }}>
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">Booking updates, ticket activity, and comments</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ alignSelf: 'center' }}
            disabled={
              actionBusy ||
              notifications.length === 0 ||
              notifications.every((n) => n.isRead)
            }
            onClick={handleMarkAllRead}
          >
            Mark all read
          </button>
        </div>

        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filter-tab ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner" style={{ marginTop: 24 }} />
        ) : notifications.length > 0 ? (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => handleOpenNotification(notification)}
              >
                <div className="notification-icon">{getTypeIcon(notification.type)}</div>
                <div className="notification-content">
                  {(notification.title || notification.type) && (
                    <p className="notification-title" style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 15 }}>
                      {notification.title ||
                        String(notification.type || '')
                          .replace(/_/g, ' ')
                          .toLowerCase()
                          .replace(/^\w/, (c) => c.toUpperCase())}
                    </p>
                  )}
                  <p className="notification-text">{notification.message}</p>
                  <span className="notification-date">
                    {formatDate(parseCreatedAt(notification.createdAt))}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center" style={{ color: '#666', padding: '40px' }}>
            No notifications in this view
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

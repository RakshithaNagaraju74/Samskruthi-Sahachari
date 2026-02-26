// components/NotificationCenter.tsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService, Notification } from '@/services/notificationService';
import { useTheme } from '@/context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  onClose?: () => void;
  onNotificationUpdate?: (count: number) => void;
}

export default function NotificationCenter({ onClose, onNotificationUpdate }: NotificationCenterProps) {
  const { isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    
    // Click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    const { notifications: notifs, unreadCount: unread } = await notificationService.getNotifications(50, filter === 'unread');
    setNotifications(notifs);
    setUnreadCount(unread);
    onNotificationUpdate?.(unread);
    setLoading(false);
  };

  const handleMarkAsRead = async (id: number) => {
    await notificationService.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    const newUnread = Math.max(0, unreadCount - 1);
    setUnreadCount(newUnread);
    onNotificationUpdate?.(newUnread);
  };

  const handleMarkAllAsRead = async () => {
    const success = await notificationService.markAllAsRead();
    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      onNotificationUpdate?.(0);
    }
  };

  const handleDelete = async (id: number) => {
    const success = await notificationService.deleteNotification(id);
    if (success) {
      const wasUnread = !notifications.find(n => n.id === id)?.is_read;
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) {
        const newUnread = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnread);
        onNotificationUpdate?.(newUnread);
      }
    }
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'expiring_soon':
        return {
          bg: isDarkMode ? 'bg-yellow-500/10' : 'bg-yellow-50',
          border: isDarkMode ? 'border-yellow-500/30' : 'border-yellow-200',
          text: 'text-yellow-500',
          icon: '⏰'
        };
      case 'expired':
        return {
          bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
          border: isDarkMode ? 'border-red-500/30' : 'border-red-200',
          text: 'text-red-500',
          icon: '❌'
        };
      case 'ticket_used':
        return {
          bg: isDarkMode ? 'bg-green-500/10' : 'bg-green-50',
          border: isDarkMode ? 'border-green-500/30' : 'border-green-200',
          text: 'text-green-500',
          icon: '✅'
        };
      case 'booking_confirmed':
        return {
          bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
          border: isDarkMode ? 'border-blue-500/30' : 'border-blue-200',
          text: 'text-blue-500',
          icon: '🎟️'
        };
      default:
        return {
          bg: isDarkMode ? 'bg-gray-500/10' : 'bg-gray-50',
          border: isDarkMode ? 'border-gray-500/30' : 'border-gray-200',
          text: 'text-gray-500',
          icon: '🔔'
        };
    }
  };

  return (
    <motion.div
      ref={modalRef}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`absolute right-0 mt-2 w-96 rounded-2xl shadow-2xl overflow-hidden z-50 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>🔔</span> Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {unreadCount} new
              </span>
            )}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter(f => f === 'all' ? 'unread' : 'all')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {filter === 'all' ? 'All' : 'Unread'}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔔</div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No notifications yet
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notification) => {
              const styles = getNotificationStyles(notification.type);
              const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${
                    !notification.is_read ? styles.bg : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`text-2xl ${styles.text}`}>{styles.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${!notification.is_read ? styles.text : ''}`}>
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className={`text-xs px-2 py-1 rounded ${
                              isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {timeAgo}
                        </span>
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className={`text-xs hover:text-red-500 transition-colors ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className={`p-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} text-center`}>
        <button
          onClick={fetchNotifications}
          className={`text-xs hover:text-emerald-500 transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          Refresh
        </button>
      </div>
    </motion.div>
  );
}
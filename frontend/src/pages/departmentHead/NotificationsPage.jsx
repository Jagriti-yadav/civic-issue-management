import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import { Bell, Check, CheckCheck, Trash2, Clock, FileText, ArrowRight } from 'lucide-react';

export function NotificationsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getUserNotifications(
        user?.id,
        { unreadOnly: filter === 'unread' }
      );
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setError(error.message || 'Failed to load notifications');
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await notificationService.getUnreadCount(user?.id);
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
      toast.success('Notification marked as read');
      // Trigger sidebar count refresh
      window.dispatchEvent(new CustomEvent('notification-refresh'));
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user?.id);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
      // Trigger sidebar count refresh
      window.dispatchEvent(new CustomEvent('notification-refresh'));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const wasUnread = !notifications.find(n => n._id === notificationId)?.isRead;
      setNotifications(notifications.filter(n => n._id !== notificationId));
      if (wasUnread) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
      toast.success('Notification deleted');
      // Trigger sidebar count refresh
      window.dispatchEvent(new CustomEvent('notification-refresh'));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now - notificationDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return notificationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'complaint_submitted':
        return <FileText size={20} className="text-green-500" />;
      case 'complaint_assigned':
        return <FileText size={20} className="text-blue-500" />;
      case 'complaint_reassigned':
        return <ArrowRight size={20} className="text-purple-500" />;
      case 'complaint_in_progress':
        return <Clock size={20} className="text-orange-500" />;
      case 'complaint_resolved':
        return <Check size={20} className="text-green-500" />;
      case 'complaint_rejected':
        return <FileText size={20} className="text-red-500" />;
      case 'complaint_priority_changed':
        return <FileText size={20} className="text-yellow-500" />;
      case 'complaint_update':
        return <FileText size={20} className="text-civic-blue" />;
      default:
        return <Bell size={20} className="text-civic-blue" />;
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Notifications"
          description="Stay updated with department activities"
          icon={Bell}
        />
        <div className="card-base p-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Notifications"
          description="Stay updated with department activities"
          icon={Bell}
        />
        <ErrorState
          message={error}
          onRetry={loadNotifications}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay updated with department activities"
        icon={Bell}
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={filter === 'unread' ? 'primary' : 'secondary'}
              onClick={() => setFilter(filter === 'unread' ? 'all' : 'unread')}
            >
              {filter === 'unread' ? 'All' : `Unread (${unreadCount})`}
            </Button>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<CheckCheck size={16} />}
                onClick={handleMarkAllAsRead}
              >
                Mark All Read
              </Button>
            )}
          </div>
        }
      />

      <div className="card-base">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            description={
              filter === 'unread'
                ? 'You have no unread notifications.'
                : 'Notifications about department activities will appear here.'
            }
          />
        ) : (
          <div className="divide-y divide-civic-border">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-civic-hover transition-colors ${
                  !notification.isRead ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-civic-blue" />
                          )}
                          <h4 className="font-medium text-civic-text-primary">
                            {notification.title}
                          </h4>
                        </div>
                        <p className="text-sm text-civic-text-secondary mb-2">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-civic-text-secondary whitespace-nowrap">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>

                    {notification.relatedComplaint && (
                      <Link
                        to={`/department-head/complaints`}
                        state={{ selectedComplaintId: notification.relatedComplaint._id }}
                        onClick={() => handleNotificationClick(notification)}
                        className="inline-flex items-center gap-1 text-sm text-civic-blue hover:text-civic-blue-hover transition-colors"
                      >
                        <FileText size={14} />
                        View Complaint
                      </Link>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<Check size={16} />}
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Mark as read"
                      />
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<Trash2 size={16} />}
                      onClick={() => handleDelete(notification._id)}
                      title="Delete"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

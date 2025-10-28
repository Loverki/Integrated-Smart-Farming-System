import { useState, useEffect } from 'react';
import api from '../api/axios';

const WeatherNotification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Fetch unread alerts on component mount
    fetchUnreadAlerts();

    // Poll for new alerts every 5 minutes
    const interval = setInterval(fetchUnreadAlerts, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadAlerts = async () => {
    try {
      const response = await api.get('/weather/alerts?unread_only=true&limit=5');
      const unreadAlerts = response.data;

      // Add new alerts to notifications
      unreadAlerts.forEach(alert => {
        if (!notifications.find(n => n.alertId === alert.alertId)) {
          showNotification(alert);
        }
      });
    } catch (error) {
      // Silently fail - user might not be logged in
      console.debug('Could not fetch weather alerts');
    }
  };

  const showNotification = (alert) => {
    setNotifications(prev => [...prev, { ...alert, id: Date.now() }]);

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      dismissNotification(alert.alertId);
    }, 10000);
  };

  const dismissNotification = async (alertId) => {
    setNotifications(prev => prev.filter(n => n.alertId !== alertId));

    // Mark as read in backend
    try {
      await api.put(`/weather/alerts/${alertId}/read`);
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500 border-red-600 text-white';
      case 'WARNING':
        return 'bg-yellow-500 border-yellow-600 text-gray-900';
      default:
        return 'bg-blue-500 border-blue-600 text-white';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return '🚨';
      case 'WARNING':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 max-w-md">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`${getSeverityStyles(notification.severity)} rounded-lg shadow-lg border-l-4 p-4 animate-slide-in`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-2xl">{getSeverityIcon(notification.severity)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">
                    {notification.alertType.replace(/_/g, ' ')}
                  </h3>
                  <span className="text-xs px-2 py-0.5 bg-white bg-opacity-30 rounded">
                    {notification.severity}
                  </span>
                </div>
                <p className="text-sm opacity-90">{notification.message}</p>
                {notification.farmName && (
                  <p className="text-xs mt-1 opacity-75">📍 {notification.farmName}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => dismissNotification(notification.alertId)}
              className="ml-2 text-white hover:opacity-75 text-xl leading-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WeatherNotification;


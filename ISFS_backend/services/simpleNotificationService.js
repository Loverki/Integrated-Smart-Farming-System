/**
 * Simple In-Memory Notification Service
 * Stores notifications temporarily (resets on server restart)
 * No database tables or external services required
 */

// In-memory storage for notifications
const notifications = new Map(); // farmerId -> array of notifications

// Structure: {
//   id: unique ID,
//   farmerId: farmer ID,
//   title: notification title,
//   message: notification message,
//   type: 'INFO' | 'WARNING' | 'CRITICAL' | 'WEATHER' | 'FERTILIZER' | 'ADVISORY',
//   severity: 'INFO' | 'WARNING' | 'CRITICAL',
//   createdAt: timestamp,
//   read: boolean
// }

let notificationIdCounter = 1;

/**
 * Send notification to a specific farmer
 */
export function sendNotification(farmerId, { title, message, type = 'INFO', severity = 'INFO' }) {
  const notification = {
    id: notificationIdCounter++,
    farmerId,
    title,
    message,
    type,
    severity,
    createdAt: new Date().toISOString(),
    read: false
  };

  if (!notifications.has(farmerId)) {
    notifications.set(farmerId, []);
  }

  notifications.get(farmerId).unshift(notification); // Add to beginning

  // Keep only last 50 notifications per farmer
  const farmerNotifications = notifications.get(farmerId);
  if (farmerNotifications.length > 50) {
    notifications.set(farmerId, farmerNotifications.slice(0, 50));
  }

  console.log(`📬 Notification sent to farmer ${farmerId}: ${title}`);
  return notification;
}

/**
 * Send notification to multiple farmers
 */
export function sendBulkNotification(farmerIds, { title, message, type = 'INFO', severity = 'INFO' }) {
  const results = [];

  for (const farmerId of farmerIds) {
    try {
      const notification = sendNotification(farmerId, { title, message, type, severity });
      results.push({
        farmerId,
        success: true,
        notificationId: notification.id
      });
    } catch (error) {
      results.push({
        farmerId,
        success: false,
        error: error.message
      });
    }
  }

  console.log(`📬 Bulk notification sent to ${results.filter(r => r.success).length}/${farmerIds.length} farmers`);
  return results;
}

/**
 * Get notifications for a specific farmer
 */
export function getNotifications(farmerId, { unreadOnly = false, limit = 50 } = {}) {
  const farmerNotifications = notifications.get(farmerId) || [];

  let filtered = farmerNotifications;
  
  if (unreadOnly) {
    filtered = filtered.filter(n => !n.read);
  }

  return filtered.slice(0, limit);
}

/**
 * Get unread notification count for a farmer
 */
export function getUnreadCount(farmerId) {
  const farmerNotifications = notifications.get(farmerId) || [];
  return farmerNotifications.filter(n => !n.read).length;
}

/**
 * Mark notification as read
 */
export function markAsRead(farmerId, notificationId) {
  const farmerNotifications = notifications.get(farmerId) || [];
  const notification = farmerNotifications.find(n => n.id === notificationId);

  if (notification) {
    notification.read = true;
    return true;
  }

  return false;
}

/**
 * Mark all notifications as read for a farmer
 */
export function markAllAsRead(farmerId) {
  const farmerNotifications = notifications.get(farmerId) || [];
  farmerNotifications.forEach(n => n.read = true);
  return farmerNotifications.length;
}

/**
 * Delete a specific notification
 */
export function deleteNotification(farmerId, notificationId) {
  const farmerNotifications = notifications.get(farmerId) || [];
  const index = farmerNotifications.findIndex(n => n.id === notificationId);

  if (index !== -1) {
    farmerNotifications.splice(index, 1);
    return true;
  }

  return false;
}

/**
 * Clear all notifications for a farmer
 */
export function clearAllNotifications(farmerId) {
  const count = (notifications.get(farmerId) || []).length;
  notifications.delete(farmerId);
  return count;
}

/**
 * Get system-wide notification statistics
 */
export function getStatistics() {
  let totalNotifications = 0;
  let totalUnread = 0;
  let totalFarmersWithNotifications = 0;

  const typeCounts = {};
  const severityCounts = {};

  for (const [farmerId, farmerNotifications] of notifications.entries()) {
    if (farmerNotifications.length > 0) {
      totalFarmersWithNotifications++;
      totalNotifications += farmerNotifications.length;
      totalUnread += farmerNotifications.filter(n => !n.read).length;

      farmerNotifications.forEach(n => {
        typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
        severityCounts[n.severity] = (severityCounts[n.severity] || 0) + 1;
      });
    }
  }

  return {
    totalNotifications,
    totalUnread,
    totalFarmersWithNotifications,
    typeCounts,
    severityCounts
  };
}

/**
 * Get all notifications (admin only)
 */
export function getAllNotifications(limit = 100) {
  const allNotifications = [];

  for (const [farmerId, farmerNotifications] of notifications.entries()) {
    allNotifications.push(...farmerNotifications.map(n => ({ ...n, farmerId })));
  }

  // Sort by creation date (newest first)
  allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return allNotifications.slice(0, limit);
}

export default {
  sendNotification,
  sendBulkNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getStatistics,
  getAllNotifications
};


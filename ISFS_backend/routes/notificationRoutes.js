import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} from "../services/simpleNotificationService.js";

const router = express.Router();

/**
 * GET /api/notifications
 * Get all notifications for the logged-in farmer
 */
router.get("/", async (req, res) => {
  try {
    const farmerId = parseInt(req.farmer.farmer_id);
    const { unreadOnly = 'false', limit = 50 } = req.query;

    const notifications = getNotifications(farmerId, {
      unreadOnly: unreadOnly === 'true',
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications"
    });
  }
});

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
router.get("/unread-count", async (req, res) => {
  try {
    const farmerId = parseInt(req.farmer.farmer_id);
    const count = getUnreadCount(farmerId);

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count"
    });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a specific notification as read
 */
router.put("/:id/read", async (req, res) => {
  try {
    const farmerId = parseInt(req.farmer.farmer_id);
    const notificationId = parseInt(req.params.id);

    const success = markAsRead(farmerId, notificationId);

    if (success) {
      res.json({
        success: true,
        message: "Notification marked as read"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read"
    });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put("/read-all", async (req, res) => {
  try {
    const farmerId = parseInt(req.farmer.farmer_id);
    const count = markAllAsRead(farmerId);

    res.json({
      success: true,
      message: `${count} notifications marked as read`,
      count
    });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read"
    });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
router.delete("/:id", async (req, res) => {
  try {
    const farmerId = parseInt(req.farmer.farmer_id);
    const notificationId = parseInt(req.params.id);

    const success = deleteNotification(farmerId, notificationId);

    if (success) {
      res.json({
        success: true,
        message: "Notification deleted"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification"
    });
  }
});

/**
 * DELETE /api/notifications
 * Clear all notifications for the farmer
 */
router.delete("/", async (req, res) => {
  try {
    const farmerId = parseInt(req.farmer.farmer_id);
    const count = clearAllNotifications(farmerId);

    res.json({
      success: true,
      message: `${count} notifications cleared`,
      count
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear notifications"
    });
  }
});

export default router;


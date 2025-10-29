# In-App Notification System

## Overview
This is a **simple, database-free notification system** that allows admins to send important alerts and messages to farmers. The system uses **in-memory storage** and does **NOT require any database tables or external services like Twilio**.

## Key Features

### ✅ What It Does
1. **Admin Can Send Notifications** - Admins can send targeted or broadcast messages to farmers
2. **Real-Time Notifications** - Farmers see notifications immediately when they log in
3. **In-App Only** - No SMS, no email, no external dependencies
4. **No Database Tables** - Uses in-memory storage (resets on server restart)
5. **Simple & Lightweight** - No complex setup required

### 📱 Notification Types
- **INFO** - General information
- **WEATHER** - Weather updates and forecasts
- **FERTILIZER** - Fertilizer usage advisories (e.g., excess usage warnings)
- **ADVISORY** - Farming tips and best practices
- **WARNING** - Important warnings
- **CRITICAL** - Critical alerts requiring immediate attention

## How It Works

### For Admins

#### Sending Notifications
1. Navigate to **Admin Dashboard** → **Alert Management** (`/admin/alerts`)
2. Fill in the notification form:
   - **Title**: Short heading for the notification
   - **Message**: Detailed message content
   - **Type**: Choose notification category (INFO, WEATHER, FERTILIZER, etc.)
   - **Severity**: INFO, WARNING, or CRITICAL
3. Select target farmers or click "Broadcast to All"
4. Click "Send" to deliver notifications instantly

#### Use Cases for Admin Notifications
- ✅ Alert about **excess fertilizer use** detected in farm analytics
- ✅ Send **weather warnings** (heavy rain, drought, etc.)
- ✅ Announce **government schemes** or subsidies
- ✅ Share **farming best practices** and seasonal tips
- ✅ Emergency alerts (pest outbreak, disease warnings)
- ✅ Market price updates and harvest timing recommendations

#### Admin API Endpoints
```javascript
// Send to specific farmers
POST /api/admin/alerts/send
Body: {
  farmerIds: [1, 2, 3],
  title: "Fertilizer Advisory",
  message: "Your farm is using excess fertilizer...",
  alertType: "FERTILIZER",
  severity: "WARNING"
}

// Broadcast to all farmers
POST /api/admin/alerts/broadcast
Body: {
  title: "Weather Alert",
  message: "Heavy rainfall expected tomorrow",
  alertType: "WEATHER",
  severity: "CRITICAL"
}

// View notification history
GET /api/admin/alerts/history?limit=100

// Get statistics
GET /api/admin/alerts/stats
```

### For Farmers

#### Viewing Notifications
1. **Bell Icon**: Shows unread notification count in dashboard header
2. **Click Bell**: See recent notifications in dropdown
3. **View All**: Navigate to `/notifications` for complete list

#### Managing Notifications
- **Mark as Read**: Click on individual notifications
- **Mark All as Read**: One-click to mark all as read
- **Delete**: Remove individual notifications
- **Clear All**: Remove all notifications

#### Farmer API Endpoints
```javascript
// Get all notifications
GET /api/notifications?unreadOnly=false&limit=50

// Get unread count
GET /api/notifications/unread-count

// Mark as read
PUT /api/notifications/:id/read

// Mark all as read
PUT /api/notifications/read-all

// Delete notification
DELETE /api/notifications/:id

// Clear all
DELETE /api/notifications
```

## Technical Implementation

### Backend Components

#### 1. Notification Service (`simpleNotificationService.js`)
```javascript
// In-memory storage - no database required
const notifications = new Map(); // farmerId -> notifications[]

// Send single notification
sendNotification(farmerId, { title, message, type, severity })

// Send to multiple farmers
sendBulkNotification(farmerIds, { title, message, type, severity })

// Get farmer's notifications
getNotifications(farmerId, { unreadOnly, limit })

// Get unread count
getUnreadCount(farmerId)

// Mark as read
markAsRead(farmerId, notificationId)
```

#### 2. Routes
- **Admin Routes**: `/routes/adminRoutes.js` - Endpoints for sending notifications
- **Notification Routes**: `/routes/notificationRoutes.js` - Endpoints for farmers

#### 3. Server Integration
Added to `server.js`:
```javascript
import notificationRoutes from "./routes/notificationRoutes.js";
app.use("/api/notifications", protect, notificationRoutes);
```

### Frontend Components

#### 1. NotificationBell Component
- Displays bell icon with unread count badge
- Dropdown showing recent notifications
- Auto-polls every 30 seconds for new notifications
- Click to mark as read or delete

#### 2. Notifications Page
- Full-page view of all notifications
- Filter by unread/all
- Bulk actions (mark all read, clear all)
- Delete individual notifications

#### 3. Admin Alert Management
- Send targeted or broadcast notifications
- Select specific farmers or all farmers
- Set notification type and severity
- View notification history and statistics

## Important Notes

### ⚠️ Limitations
1. **In-Memory Storage**: Notifications are **NOT persisted** - they reset when server restarts
2. **No SMS/Email**: This is purely an in-app notification system
3. **No Historical Persistence**: No long-term storage of notifications
4. **Server-Dependent**: Requires server to be running for notifications to exist

### 💡 Why This Approach?
- **No Database Tables**: Keeps your database schema clean
- **No External Services**: No Twilio, SendGrid, or other third-party services
- **Instant Setup**: Works immediately without configuration
- **Lightweight**: Minimal server resources required
- **Simple**: Easy to understand and maintain

### 🔄 When Server Restarts
All in-memory notifications are cleared. This is by design to keep the system simple. If you need persistent notifications, you would need to:
1. Create a database table for notifications
2. Update the service to use database instead of in-memory storage

## Usage Examples

### Example 1: Fertilizer Excess Warning
```javascript
// Admin sends warning about excess fertilizer use
{
  farmerIds: [123],
  title: "⚠️ Fertilizer Usage Alert",
  message: "Your farm (Farm A) has exceeded recommended fertilizer levels by 30%. This may lead to soil degradation. Please consult our fertilizer guidelines.",
  alertType: "FERTILIZER",
  severity: "WARNING"
}
```

### Example 2: Weather Update
```javascript
// Admin broadcasts weather warning
{
  title: "🌧️ Heavy Rainfall Alert",
  message: "Meteorological department forecasts 100mm rainfall in the next 24 hours. Ensure proper drainage and postpone harvesting activities.",
  alertType: "WEATHER",
  severity: "CRITICAL"
}
```

### Example 3: General Advisory
```javascript
// Admin shares farming tip
{
  title: "💡 Seasonal Tip",
  message: "It's the perfect time to plant winter vegetables. Recommended crops: Cabbage, Cauliflower, Peas.",
  alertType: "ADVISORY",
  severity: "INFO"
}
```

## File Structure

```
ISFS_backend/
├── services/
│   └── simpleNotificationService.js    # Core notification logic
├── routes/
│   ├── notificationRoutes.js           # Farmer notification endpoints
│   └── adminRoutes.js                  # Admin endpoints (updated)
└── server.js                           # Server setup (updated)

ISFS_frontend/
├── src/
│   ├── components/
│   │   └── NotificationBell.jsx        # Bell icon component
│   ├── pages/
│   │   ├── Notifications.jsx           # Full notifications page
│   │   ├── Dashboard.jsx               # Updated with bell
│   │   └── admin/
│   │       └── AlertManagement.jsx     # Updated for notifications
│   └── App.jsx                         # Added notifications route
```

## Route Configuration

### Protected Routes
All routes redirect to home page (`/`) if user is not logged in:

```javascript
// ProtectedRoute - For farmers
<ProtectedRoute>  // Redirects to "/" if not logged in
  <Component />
</ProtectedRoute>

// AdminProtectedRoute - For admins
<AdminProtectedRoute>  // Redirects to "/" if not logged in
  <Component />
</AdminProtectedRoute>
```

### Notification Routes
- `/notifications` - View all notifications (farmers)
- `/admin/alerts` - Send and manage notifications (admins)

## Testing the System

1. **Start the server**: `npm start` (in ISFS_backend)
2. **Start the frontend**: `npm run dev` (in ISFS_frontend)
3. **Login as Admin**: Navigate to admin dashboard
4. **Send a Notification**: Go to Alert Management, create notification
5. **Login as Farmer**: Check dashboard - bell icon should show new notification
6. **Click Bell**: View notification in dropdown
7. **View All**: Navigate to notifications page

## Future Enhancements (Optional)

If you want to make this permanent:
1. Create a `NOTIFICATIONS` table in your database
2. Update `simpleNotificationService.js` to use database queries
3. Add notification preferences for farmers
4. Add email/SMS integration (optional)
5. Add notification scheduling

## Support

For issues or questions:
1. Check the browser console for errors
2. Check the server logs for backend errors
3. Ensure authentication is working properly
4. Verify the server is running and accessible

---

**Created**: October 2025  
**Version**: 1.0  
**Type**: In-App Notification System (Database-Free)


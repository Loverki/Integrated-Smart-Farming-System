## Twilio SMS Integration (Backend)

This document summarizes how SMS is sent using Twilio in the backend and how the frontend triggers it.

### Core Service

File: `ISFS_backend/services/smsService.js`

Responsibilities:
- Lazily initializes the Twilio client using environment variables
- Normalizes Indian phone numbers to E.164 (`+91XXXXXXXXXX`)
- Exposes `sendSms(toPhone, body)` and `sendBulkSms(toPhones, body)`

Environment variables used:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER` (optional when using Messaging Service SID)
- `TWILIO_MESSAGING_SERVICE_SID` (optional alternative to FROM number)

Notes:
- If Twilio credentials or a sending identity are missing, SMS is treated as disabled and a non-throwing result is returned.
- The Twilio SDK is required lazily to avoid startup crashes if not installed.

Relevant code:

```1:63:ISFS_backend/services/smsService.js
import dotenv from "dotenv";
dotenv.config();

let twilioClient = null;
function getTwilioClient() {
  if (twilioClient) return twilioClient;
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
  try {
    // Lazy require to avoid crash if package not installed yet
    // eslint-disable-next-line global-require
    const twilio = require("twilio");
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    return twilioClient;
  } catch (err) {
    console.warn("Twilio SDK not installed. Run: npm install twilio", err?.message);
    return null;
  }
}

function normalizeIndianPhone(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 10) return null;
  // Always use Indian numbers: take last 10 digits and prefix +91
  const last10 = digits.slice(-10);
  return `+91${last10}`;
}

export async function sendSms(toPhone, body) {
  const client = getTwilioClient();
  const from = process.env.TWILIO_FROM_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (!client || (!from && !messagingServiceSid)) {
    console.warn("SMS disabled: Missing TWILIO config (FROM number or Messaging Service SID).");
    return { success: false, disabled: true, to: toPhone, error: "SMS not configured" };
  }

  const to = normalizeIndianPhone(toPhone);
  if (!to) return { success: false, to: toPhone, error: "Invalid phone" };

  try {
    const createParams = { to, body };
    if (messagingServiceSid) {
      createParams.messagingServiceSid = messagingServiceSid;
    } else {
      createParams.from = from;
    }
    const message = await client.messages.create(createParams);
    return { success: true, sid: message.sid, to };
  } catch (err) {
    console.error("Twilio send error:", err?.message || err);
    return { success: false, to, error: err?.message || "Send failed" };
  }
}

export async function sendBulkSms(toPhones, body) {
  if (!Array.isArray(toPhones) || toPhones.length === 0) return [];
  const results = await Promise.all(toPhones.map((p) => sendSms(p, body)));
  return results;
}
```

### Where SMS Is Triggered (Backend)

1) Admin Alerts (bulk send)
- File: `ISFS_backend/routes/adminRoutes.js`
- Endpoints:
  - `POST /admin/alerts/send` — sends to selected farmers
  - `POST /admin/alerts/broadcast` — sends to all active farmers
- Flow:
  - Fetch target farmer phone numbers from DB
  - Call `sendBulkSms(phones, message)` from `smsService.js`

Relevant code (send to specific farmers):

```803:870:ISFS_backend/routes/adminRoutes.js
router.post("/alerts/send", protectAdmin, async (req, res) => {
  const { farmerIds, message, title, alertType, severity } = req.body;
  // ... validation ...
  let connection;
  try {
    const { sendBulkNotification } = await import('../services/simpleNotificationService.js');
    const webResults = sendBulkNotification(farmerIds, { title: title || alertType || 'Important Alert', message, type: alertType || 'INFO', severity: severity || 'INFO' });

    const { getConnection } = await import('../database/connection.js');
    connection = await getConnection();
    const phones = [];
    for (const id of farmerIds) {
      try {
        const r = await connection.execute(`SELECT phone FROM FARMER WHERE farmer_id = :id`, { id });
        const phone = r.rows?.[0]?.[0];
        if (phone) phones.push(phone);
      } catch (_) {}
    }

    const { sendBulkSms } = await import('../services/smsService.js');
    const smsResults = await sendBulkSms(phones, message);

    res.json({
      message: "Notifications processed",
      web: { totalSent: webResults.filter(r => r.success).length, totalFailed: webResults.filter(r => !r.success).length },
      sms: { totalAttempted: phones.length, totalSent: smsResults.filter(r => r.success).length, totalFailed: smsResults.filter(r => !r.success && !r.disabled).length, disabled: smsResults.length > 0 ? smsResults.every(r => r.disabled) : false }
    });
  } finally {
    if (connection) await connection.close();
  }
});
```

Relevant code (broadcast):

```872:947:ISFS_backend/routes/adminRoutes.js
router.post("/alerts/broadcast", protectAdmin, async (req, res) => {
  const { message, title, alertType, severity } = req.body;
  // ... validation ...
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`SELECT farmer_id FROM FARMER WHERE status = 'ACTIVE'`);
    const farmerIds = result.rows.map(row => row[0]);
    if (farmerIds.length === 0) return res.json({ message: "No active farmers found" });

    const { sendBulkNotification } = await import('../services/simpleNotificationService.js');
    const webResults = sendBulkNotification(farmerIds, { title: title || 'Broadcast Message', message, type: alertType || 'BROADCAST', severity: severity || 'INFO' });

    const phones = [];
    for (const id of farmerIds) {
      try {
        const r = await connection.execute(`SELECT phone FROM FARMER WHERE farmer_id = :id`, { id });
        const phone = r.rows?.[0]?.[0];
        if (phone) phones.push(phone);
      } catch (_) {}
    }

    const { sendBulkSms } = await import('../services/smsService.js');
    const smsResults = await sendBulkSms(phones, message);

    res.json({
      message: "Broadcast processed",
      totalFarmers: farmerIds.length,
      web: { totalSent: webResults.filter(r => r.success).length, totalFailed: webResults.filter(r => !r.success).length },
      sms: { totalAttempted: phones.length, totalSent: smsResults.filter(r => r.success).length, totalFailed: smsResults.filter(r => !r.success && !r.disabled).length, disabled: smsResults.length > 0 ? smsResults.every(r => r.disabled) : false }
    });
  } finally {
    if (connection) await connection.close();
  }
});
```

2) Weather Alerts (single send per alert)
- File: `ISFS_backend/services/alertService.js`
- Flow:
  - Determine `sendVia` (e.g., `SMS`, `IN_APP`, `BOTH`)
  - If SMS is included, look up the farmer phone and call `sendSms(phone, message)`
  - Update alert status to `SENT` or `FAILED`

Relevant code:

```49:86:ISFS_backend/services/alertService.js
// If SMS should be sent, get farmer's phone number
if (sendVia === 'SMS' || sendVia === 'BOTH') {
  const farmerResult = await connection.execute(
    `SELECT phone FROM FARMER WHERE farmer_id = :farmer_id`,
    { farmer_id: farmerId }
  );

  if (farmerResult.rows.length > 0) {
    const phone = farmerResult.rows[0][0];
    const smsResult = await sendSms(phone, message);

    if (smsResult.success) {
      await connection.execute(
        `UPDATE WEATHER_ALERT SET status = 'SENT' WHERE alert_id = :alert_id`,
        { alert_id: alertId },
        { autoCommit: false }
      );
    } else {
      await connection.execute(
        `UPDATE WEATHER_ALERT SET status = 'FAILED' WHERE alert_id = :alert_id`,
        { alert_id: alertId },
        { autoCommit: false }
      );
    }
  }
} else {
  // For in-app only, mark as sent
  await connection.execute(
    `UPDATE WEATHER_ALERT SET status = 'SENT' WHERE alert_id = :alert_id`,
    { alert_id: alertId },
    { autoCommit: false }
  );
}
```

### Frontend Connection

File: `ISFS_frontend/src/pages/admin/AlertManagement.jsx`
- Calls the backend endpoints that trigger SMS:
  - `api.post('/admin/alerts/send', { farmerIds, title, message, alertType, severity })`
  - `api.post('/admin/alerts/broadcast', { title, message, alertType: 'BROADCAST', severity })`

These endpoints invoke the backend logic that gathers phone numbers and uses `smsService.js` to send SMS via Twilio.

### Dependency

`ISFS_backend/package.json` includes:
- `twilio`

Install if missing:
```bash
npm install twilio
```

### Quick Test Snippets

Node REPL or a small script after setting env vars:
```javascript
import { sendSms, sendBulkSms } from './services/smsService.js';

// Single SMS
await sendSms('9876543210', 'Hello from ISFS via Twilio');

// Bulk SMS
await sendBulkSms(['9876543210', '9123456780'], 'Bulk hello from ISFS');
```

Ensure your environment has the required Twilio variables set before testing.



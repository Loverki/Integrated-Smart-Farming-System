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

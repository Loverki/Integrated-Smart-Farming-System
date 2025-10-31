import dotenv from "dotenv";
dotenv.config();

let twilioClient = null;
async function getTwilioClient() {
  if (twilioClient) {
    console.log("[Twilio] Using existing client instance");
    return twilioClient;
  }
  
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  
  console.log("[Twilio] Initializing Twilio client...");
  console.log("[Twilio] Account SID:", TWILIO_ACCOUNT_SID ? `${TWILIO_ACCOUNT_SID.substring(0, 6)}...` : "NOT SET");
  console.log("[Twilio] Auth Token:", TWILIO_AUTH_TOKEN ? "SET (hidden)" : "NOT SET");
  
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn("[Twilio] Missing credentials - TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not found in environment");
    return null;
  }
  
  try {
    // Lazy import to avoid crash if package not installed yet (ES module syntax)
    // Twilio uses CommonJS - when dynamically imported in ES modules, Node.js
    // exposes the CommonJS exports via .default property
    const twilioModule = await import("twilio");
    // Twilio CommonJS module exports a function, accessible via .default
    const Twilio = twilioModule.default;
    if (typeof Twilio !== 'function') {
      throw new Error("Twilio constructor not found - check module export structure");
    }
    // Twilio is a function constructor, call it with credentials
    twilioClient = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    console.log("[Twilio] ✓ Client initialized successfully");
    return twilioClient;
  } catch (err) {
    console.error("[Twilio] ✗ Failed to initialize client:", err?.message || err);
    console.warn("[Twilio] SDK not installed. Run: npm install twilio", err?.message);
    return null;
  }
}

function normalizeIndianPhone(phone) {
  console.log("[Twilio] Normalizing phone number:", phone);
  if (!phone) {
    console.warn("[Twilio] Phone number is empty or null");
    return null;
  }
  const digits = String(phone).replace(/\D/g, "");
  console.log("[Twilio] Extracted digits:", digits);
  if (digits.length < 10) {
    console.warn("[Twilio] Invalid phone number - less than 10 digits:", digits);
    return null;
  }
  // Always use Indian numbers: take last 10 digits and prefix +91
  const last10 = digits.slice(-10);
  const normalized = `+91${last10}`;
  console.log("[Twilio] Normalized phone number:", normalized);
  return normalized;
}

export async function sendSms(toPhone, body) {
  const startTime = Date.now();
  console.log("[Twilio] ========== SMS Send Request ==========");
  console.log("[Twilio] Timestamp:", new Date().toISOString());
  console.log("[Twilio] To Phone:", toPhone);
  console.log("[Twilio] Message Body Length:", body?.length || 0);
  console.log("[Twilio] Message Preview:", body?.substring(0, 50) + (body?.length > 50 ? "..." : ""));
  
  const client = await getTwilioClient();
  // Accept both TWILIO_FROM_NUMBER and TWILIO_PHONE_NUMBER for flexibility
  const from = process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_PHONE_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

  console.log("[Twilio] Configuration check:");
  console.log("[Twilio] - Client initialized:", client ? "Yes" : "No");
  console.log("[Twilio] - FROM Number:", from ? `${from.substring(0, 4)}...` : "NOT SET");
  console.log("[Twilio] - Messaging Service SID:", messagingServiceSid ? `${messagingServiceSid.substring(0, 6)}...` : "NOT SET");

  if (!client || (!from && !messagingServiceSid)) {
    console.warn("[Twilio] ✗ SMS disabled: Missing TWILIO config (FROM number or Messaging Service SID)");
    console.log("[Twilio] =========================================");
    return { success: false, disabled: true, to: toPhone, error: "SMS not configured" };
  }

  const to = normalizeIndianPhone(toPhone);
  if (!to) {
    console.error("[Twilio] ✗ Invalid phone number - cannot normalize");
    console.log("[Twilio] =========================================");
    return { success: false, to: toPhone, error: "Invalid phone" };
  }

  try {
    const createParams = { to, body };
    if (messagingServiceSid) {
      createParams.messagingServiceSid = messagingServiceSid;
      console.log("[Twilio] Using Messaging Service SID for sending");
    } else {
      createParams.from = from;
      console.log("[Twilio] Using FROM number for sending");
    }
    
    console.log("[Twilio] Sending SMS via Twilio API...");
    console.log("[Twilio] Request params:", {
      to: createParams.to,
      from: createParams.from || "N/A (using Messaging Service)",
      messagingServiceSid: createParams.messagingServiceSid || "N/A",
      bodyLength: createParams.body?.length || 0
    });
    
    const message = await client.messages.create(createParams);
    const duration = Date.now() - startTime;
    
    console.log("[Twilio] ✓ SMS sent successfully!");
    console.log("[Twilio] Message SID:", message.sid);
    console.log("[Twilio] Status:", message.status);
    console.log("[Twilio] Response Time:", `${duration}ms`);
    console.log("[Twilio] =========================================");
    
    return { success: true, sid: message.sid, to };
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error("[Twilio] ✗ SMS send failed!");
    console.error("[Twilio] Error Type:", err?.constructor?.name || "Unknown");
    console.error("[Twilio] Error Message:", err?.message || err);
    console.error("[Twilio] Error Code:", err?.code || "N/A");
    console.error("[Twilio] Error Status:", err?.status || "N/A");
    console.error("[Twilio] Error More Info:", err?.moreInfo || "N/A");
    console.error("[Twilio] Duration:", `${duration}ms`);
    console.error("[Twilio] Stack:", err?.stack || "N/A");
    console.log("[Twilio] =========================================");
    return { success: false, to, error: err?.message || "Send failed" };
  }
}

export async function sendBulkSms(toPhones, body) {
  const startTime = Date.now();
  console.log("[Twilio] ========== Bulk SMS Send Request ==========");
  console.log("[Twilio] Timestamp:", new Date().toISOString());
  console.log("[Twilio] Recipient Count:", toPhones?.length || 0);
  console.log("[Twilio] Message Body Length:", body?.length || 0);
  
  if (!Array.isArray(toPhones) || toPhones.length === 0) {
    console.warn("[Twilio] ✗ Invalid phone numbers array - empty or not an array");
    console.log("[Twilio] ===============================================");
    return [];
  }
  
  console.log("[Twilio] Phone Numbers:", toPhones);
  console.log("[Twilio] Starting parallel SMS sends...");
  
  const results = await Promise.all(toPhones.map((p) => sendSms(p, body)));
  
  const duration = Date.now() - startTime;
  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success && !r.disabled).length;
  const disabledCount = results.filter(r => r.disabled).length;
  
  console.log("[Twilio] ========== Bulk SMS Summary ==========");
  console.log("[Twilio] Total Attempted:", toPhones.length);
  console.log("[Twilio] Successful:", successCount);
  console.log("[Twilio] Failed:", failedCount);
  console.log("[Twilio] Disabled (not configured):", disabledCount);
  console.log("[Twilio] Total Duration:", `${duration}ms`);
  console.log("[Twilio] Average per SMS:", `${Math.round(duration / toPhones.length)}ms`);
  
  // Log detailed results
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`[Twilio] ✓ [${index + 1}/${toPhones.length}] ${result.to} - SID: ${result.sid}`);
    } else if (result.disabled) {
      console.log(`[Twilio] ⚠ [${index + 1}/${toPhones.length}] ${result.to} - SMS disabled`);
    } else {
      console.log(`[Twilio] ✗ [${index + 1}/${toPhones.length}] ${result.to} - Error: ${result.error}`);
    }
  });
  
  console.log("[Twilio] ===============================================");
  return results;
}

import dotenv from "dotenv";
dotenv.config();

let emailTransporter = null;

async function getEmailTransporter() {
  if (emailTransporter) {
    console.log("[Email] Using existing transporter instance");
    return emailTransporter;
  }

  const {
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_USER,
    EMAIL_PASSWORD,
    EMAIL_FROM,
    EMAIL_SECURE = 'false'
  } = process.env;

  console.log("[Email] Initializing email transporter...");
  console.log("[Email] Host:", EMAIL_HOST || "NOT SET");
  console.log("[Email] Port:", EMAIL_PORT || "NOT SET");
  console.log("[Email] User:", EMAIL_USER ? `${EMAIL_USER.substring(0, 3)}...` : "NOT SET");
  console.log("[Email] Password:", EMAIL_PASSWORD ? "SET (hidden)" : "NOT SET");
  console.log("[Email] From:", EMAIL_FROM || "NOT SET");

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD || !EMAIL_FROM) {
    console.warn("[Email] Missing email configuration - EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, or EMAIL_FROM not found");
    return null;
  }

  try {
    // Lazy import to avoid crash if package not installed yet (ES module syntax)
    const nodemailerModule = await import("nodemailer");
    const nodemailer = nodemailerModule.default || nodemailerModule;

    const port = parseInt(EMAIL_PORT, 10);
    const secure = EMAIL_SECURE === 'true' || port === 465;

    emailTransporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: port,
      secure: secure,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
      },
      // Common configurations for Gmail, Outlook, etc.
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection
    await emailTransporter.verify();
    console.log("[Email] ✓ Transporter initialized and verified successfully");
    return emailTransporter;
  } catch (err) {
    console.error("[Email] ✗ Failed to initialize transporter:", err?.message || err);
    console.warn("[Email] Package not installed? Run: npm install nodemailer", err?.message);
    return null;
  }
}

function validateEmail(email) {
  if (!email) {
    return false;
  }
  const emailStr = String(email).trim();
  if (emailStr === '' || emailStr === 'undefined' || emailStr === 'null') {
    return false;
  }
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailStr);
}

export async function sendEmail(toEmail, subject, body, htmlBody = null) {
  const startTime = Date.now();
  console.log("[Email] ========== Email Send Request ==========");
  console.log("[Email] Timestamp:", new Date().toISOString());
  console.log("[Email] To Email:", toEmail);
  console.log("[Email] Subject:", subject);
  console.log("[Email] Body Length:", body?.length || 0);
  console.log("[Email] Body Preview:", body?.substring(0, 50) + (body?.length > 50 ? "..." : ""));

  const transporter = await getEmailTransporter();
  const from = process.env.EMAIL_FROM;

  console.log("[Email] Configuration check:");
  console.log("[Email] - Transporter initialized:", transporter ? "Yes" : "No");
  console.log("[Email] - FROM Email:", from || "NOT SET");

  if (!transporter || !from) {
    console.warn("[Email] ✗ Email disabled: Missing email configuration");
    console.log("[Email] =========================================");
    return { success: false, disabled: true, to: toEmail, error: "Email not configured" };
  }

  if (!validateEmail(toEmail)) {
    console.error("[Email] ✗ Invalid email address:", toEmail);
    console.log("[Email] =========================================");
    return { success: false, to: toEmail, error: "Invalid email" };
  }

  try {
    const mailOptions = {
      from: from,
      to: toEmail,
      subject: subject,
      text: body,
      ...(htmlBody && { html: htmlBody })
    };

    console.log("[Email] Sending email via SMTP...");
    console.log("[Email] Request options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      bodyLength: mailOptions.text?.length || 0
    });

    const info = await transporter.sendMail(mailOptions);
    const duration = Date.now() - startTime;

    console.log("[Email] ✓ Email sent successfully!");
    console.log("[Email] Message ID:", info.messageId);
    console.log("[Email] Response:", info.response || "N/A");
    console.log("[Email] Response Time:", `${duration}ms`);
    console.log("[Email] =========================================");

    return { success: true, messageId: info.messageId, to: toEmail };
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error("[Email] ✗ Email send failed!");
    console.error("[Email] Error Type:", err?.constructor?.name || "Unknown");
    console.error("[Email] Error Message:", err?.message || err);
    console.error("[Email] Error Code:", err?.code || "N/A");
    console.error("[Email] Duration:", `${duration}ms`);
    console.error("[Email] Stack:", err?.stack || "N/A");
    console.log("[Email] =========================================");
    return { success: false, to: toEmail, error: err?.message || "Send failed" };
  }
}

export async function sendBulkEmail(toEmails, subject, body, htmlBody = null) {
  const startTime = Date.now();
  console.log("[Email] ========== Bulk Email Send Request ==========");
  console.log("[Email] Timestamp:", new Date().toISOString());
  console.log("[Email] Recipient Count:", toEmails?.length || 0);
  console.log("[Email] Subject:", subject);
  console.log("[Email] Body Length:", body?.length || 0);

  if (!Array.isArray(toEmails) || toEmails.length === 0) {
    console.warn("[Email] ✗ Invalid email addresses array - empty or not an array");
    console.log("[Email] ===============================================");
    return [];
  }

  // Filter out invalid emails
  const validEmails = toEmails.filter(email => validateEmail(email));
  console.log("[Email] Valid Emails:", validEmails.length, "of", toEmails.length);

  if (validEmails.length === 0) {
    console.warn("[Email] ✗ No valid email addresses found");
    console.log("[Email] ===============================================");
    return [];
  }

  console.log("[Email] Starting parallel email sends...");

  const results = await Promise.all(validEmails.map((email) => sendEmail(email, subject, body, htmlBody)));

  const duration = Date.now() - startTime;
  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success && !r.disabled).length;
  const disabledCount = results.filter(r => r.disabled).length;

  console.log("[Email] ========== Bulk Email Summary ==========");
  console.log("[Email] Total Attempted:", validEmails.length);
  console.log("[Email] Successful:", successCount);
  console.log("[Email] Failed:", failedCount);
  console.log("[Email] Disabled (not configured):", disabledCount);
  console.log("[Email] Total Duration:", `${duration}ms`);
  console.log("[Email] Average per Email:", `${Math.round(duration / validEmails.length)}ms`);

  // Log detailed results
  results.forEach((result, index) => {
    if (result.success) {
      console.log(`[Email] ✓ [${index + 1}/${validEmails.length}] ${result.to} - Message ID: ${result.messageId}`);
    } else if (result.disabled) {
      console.log(`[Email] ⚠ [${index + 1}/${validEmails.length}] ${result.to} - Email disabled`);
    } else {
      console.log(`[Email] ✗ [${index + 1}/${validEmails.length}] ${result.to} - Error: ${result.error}`);
    }
  });

  console.log("[Email] ===============================================");
  return results;
}


import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

let twilioClient;

// Initialize Twilio client
try {
  if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
    console.log('✅ Twilio SMS service initialized');
  } else {
    console.warn('⚠️  Twilio credentials not configured - SMS will be simulated');
  }
} catch (error) {
  console.error('❌ Failed to initialize Twilio:', error.message);
}

/**
 * Send SMS message
 * @param {string} phoneNumber - Recipient phone number (with country code)
 * @param {string} message - Message text
 * @returns {Promise<Object>} Result of SMS sending
 */
export async function sendSMS(phoneNumber, message) {
  try {
    // If Twilio is not configured, simulate sending
    if (!twilioClient) {
      console.log(`📱 [SIMULATED SMS] To: ${phoneNumber}`);
      console.log(`📱 Message: ${message}`);
      return {
        success: true,
        simulated: true,
        message: 'SMS simulated (Twilio not configured)'
      };
    }

    // Format phone number to E.164 format (+[country code][number])
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Send SMS via Twilio
    const result = await twilioClient.messages.create({
      body: message,
      from: twilioPhone,
      to: formattedPhone
    });

    console.log(`✅ SMS sent to ${phoneNumber} - SID: ${result.sid}`);
    
    return {
      success: true,
      simulated: false,
      sid: result.sid,
      status: result.status
    };
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${phoneNumber}:`, error.message);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send bulk SMS to multiple recipients
 * @param {Array<Object>} recipients - Array of {phone, message} objects
 * @returns {Promise<Array>} Array of results
 */
export async function sendBulkSMS(recipients) {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendSMS(recipient.phone, recipient.message);
    results.push({
      phone: recipient.phone,
      ...result
    });
    
    // Add small delay to avoid rate limiting
    await sleep(100);
  }
  
  return results;
}

/**
 * Format phone number to E.164 format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber(phone) {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If doesn't start with +, assume India country code +91
  if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      cleaned = '+91' + cleaned;
    } else if (cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  
  return cleaned;
}

/**
 * Sleep utility function
 * @param {number} ms - Milliseconds to sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export function isValidPhoneNumber(phone) {
  // Check if phone number has at least 10 digits
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10;
}

/**
 * Get SMS delivery status
 * @param {string} messageSid - Twilio message SID
 * @returns {Promise<Object>} Message status
 */
export async function getSMSStatus(messageSid) {
  try {
    if (!twilioClient) {
      return { status: 'unknown', simulated: true };
    }

    const message = await twilioClient.messages(messageSid).fetch();
    
    return {
      status: message.status,
      dateSent: message.dateSent,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage
    };
  } catch (error) {
    console.error('Error fetching SMS status:', error.message);
    return { status: 'error', error: error.message };
  }
}


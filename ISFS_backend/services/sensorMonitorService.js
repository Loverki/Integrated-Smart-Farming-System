import { getConnection } from "../database/connection.js";
import { checkSensorThresholds, storeSensorReading } from "./sensorService.js";
import { sendBulkSms } from "./smsService.js";
import { sendBulkEmail } from "./emailService.js";
import { sendBulkNotification } from "./simpleNotificationService.js";

/**
 * Process sensor reading: store it, check thresholds, and trigger alerts if critical
 */
export async function processSensorReading(farmId, sensorType, value, unit, notes = null) {
  let connection;
  try {
    connection = await getConnection();
    
    // Step 1: Check thresholds before storing
    const thresholdCheck = await checkSensorThresholds(farmId, sensorType, value);
    
    // Step 2: Store sensor reading with appropriate status
    const sensorId = await storeSensorReading(farmId, sensorType, value, unit, notes);
    
    // Step 3: Update status if critical or warning
    if (thresholdCheck.status !== 'NORMAL') {
      await connection.execute(
        `UPDATE SENSOR_DATA SET status = :status WHERE sensor_id = :sensorId`,
        { status: thresholdCheck.status, sensorId },
        { autoCommit: true }
      );
    }
    
    // Step 4: If critical, trigger alerts
    let alertResult = null;
    if (thresholdCheck.isCritical) {
      alertResult = await triggerCriticalAlert(
        connection,
        farmId,
        sensorId,
        sensorType,
        value,
        unit,
        thresholdCheck.thresholdValue,
        thresholdCheck.status
      );
    }
    
    return {
      success: true,
      sensorId,
      status: thresholdCheck.status,
      isCritical: thresholdCheck.isCritical,
      isWarning: thresholdCheck.isWarning,
      alert: alertResult
    };
  } catch (error) {
    console.error(`[Sensor Monitor] Error processing sensor reading:`, error.message);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

/**
 * Trigger critical alert: send SMS, Email, and in-app notification
 */
async function triggerCriticalAlert(connection, farmId, sensorId, sensorType, value, unit, thresholdValue, status) {
  try {
    // Get farm and farmer information
    const farmResult = await connection.execute(
      `SELECT f.farm_name, f.farmer_id, fa.name as farmer_name, fa.phone, fa.email
       FROM FARM f
       JOIN FARMER fa ON f.farmer_id = fa.farmer_id
       WHERE f.farm_id = :farmId`,
      { farmId }
    );

    if (!farmResult.rows || farmResult.rows.length === 0) {
      throw new Error(`Farm ${farmId} not found`);
    }

    const row = farmResult.rows[0];
    
    // Handle Oracle result format (array or object)
    let farmName, farmerId, farmerName, phone, email;
    if (Array.isArray(row)) {
      farmName = row[0];
      farmerId = row[1];
      farmerName = row[2];
      phone = row[3];
      email = row[4];
    } else {
      // If object format (when outFormat is set)
      farmName = row.FARM_NAME || row.farm_name;
      farmerId = row.FARMER_ID || row.farmer_id;
      farmerName = row.FARMER_NAME || row.farmer_name || row.NAME || row.name;
      phone = row.PHONE || row.phone;
      email = row.EMAIL || row.email;
    }
    
    console.log(`[Sensor Monitor] Extracted farmer data: ID=${farmerId}, Name=${farmerName}, Phone=${phone}, Email=${email}`);

    // Format alert message
    const alertMessage = `🚨 CRITICAL ALERT: ${farmName} - ${sensorType} reading is ${value} ${unit || ''}. This exceeds the critical threshold (${thresholdValue} ${unit || ''}). Please take immediate action!`;
    
    const alertTitle = `Critical ${sensorType} Alert`;

    // Send alerts
    let smsResult = { success: false, disabled: true };
    let emailResult = { success: false, disabled: true };
    let notificationResult = { success: false };

    // Send SMS if phone available
    if (phone && String(phone).trim() !== '' && String(phone) !== 'null') {
      try {
        const phoneStr = String(phone).trim();
        smsResult = await sendBulkSms([phoneStr], alertMessage);
        console.log(`[Sensor Monitor] SMS sent to ${phoneStr}:`, smsResult.success ? '✓' : '✗');
      } catch (error) {
        console.error(`[Sensor Monitor] SMS send error:`, error.message);
        smsResult = { success: false, error: error.message };
      }
    } else {
      console.warn(`[Sensor Monitor] No phone number available for farmer ${farmerId}`);
    }

    // Send Email if email available
    if (email && String(email).trim() !== '' && String(email) !== 'null') {
      try {
        const emailStr = String(email).trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(emailStr)) {
          emailResult = await sendBulkEmail([emailStr], alertTitle, alertMessage);
          console.log(`[Sensor Monitor] Email sent to ${emailStr}:`, emailResult.success ? '✓' : '✗');
        }
      } catch (error) {
        console.error(`[Sensor Monitor] Email send error:`, error.message);
        emailResult = { success: false, error: error.message };
      }
    } else {
      console.warn(`[Sensor Monitor] No email available for farmer ${farmerId}`);
    }

    // Send in-app notification
    try {
      notificationResult = sendBulkNotification([farmerId], {
        title: alertTitle,
        message: alertMessage,
        type: 'SENSOR_ALERT',
        severity: 'CRITICAL'
      });
      console.log(`[Sensor Monitor] In-app notification sent: ✓`);
    } catch (error) {
      console.error(`[Sensor Monitor] Notification send error:`, error.message);
      notificationResult = { success: false, error: error.message };
    }

    // Store alert record in SENSOR_ALERTS table
    const smsSuccess = smsResult.success === true;
    const emailSuccess = emailResult.success === true;
    const notificationSuccess = Array.isArray(notificationResult) 
      ? notificationResult.some(r => r.success) 
      : notificationResult.success === true;

    const smsStatus = smsResult.success ? 'SUCCESS' : (smsResult.disabled ? 'DISABLED' : 'FAILED');
    const emailStatus = emailResult.success ? 'SUCCESS' : (emailResult.disabled ? 'DISABLED' : 'FAILED');

    await connection.execute(
      `INSERT INTO SENSOR_ALERTS (
        alert_id, sensor_id, farm_id, farmer_id, sensor_type, sensor_value,
        threshold_value, alert_message, sms_sent, email_sent, notification_sent,
        sms_status, email_status, created_date
      ) VALUES (
        SENSOR_ALERT_SEQ.NEXTVAL, :sensorId, :farmId, :farmerId, :sensorType, :value,
        :thresholdValue, :alertMessage, :smsSent, :emailSent, :notificationSent,
        :smsStatus, :emailStatus, SYSDATE
      )`,
      {
        sensorId,
        farmId,
        farmerId,
        sensorType,
        value,
        thresholdValue,
        alertMessage,
        smsSent: smsSuccess ? 1 : 0,
        emailSent: emailSuccess ? 1 : 0,
        notificationSent: notificationSuccess ? 1 : 0,
        smsStatus,
        emailStatus
      },
      { autoCommit: true }
    );

    console.log(`[Sensor Monitor] ✓ Critical alert triggered and logged for sensor ${sensorId}`);

    return {
      sms: {
        sent: smsSuccess,
        disabled: smsResult.disabled || false,
        status: smsStatus
      },
      email: {
        sent: emailSuccess,
        disabled: emailResult.disabled || false,
        status: emailStatus
      },
      notification: {
        sent: notificationSuccess
      }
    };
  } catch (error) {
    console.error(`[Sensor Monitor] Error triggering alert:`, error.message);
    throw error;
  }
}


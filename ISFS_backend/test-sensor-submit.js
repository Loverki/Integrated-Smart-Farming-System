/**
 * Test Script for Sensor Monitoring System
 * 
 * Usage:
 *   node test-sensor-submit.js
 * 
 * Make sure:
 *   1. Backend server is running (npm start)
 *   2. You have a valid admin token (login first)
 *   3. At least one farm exists in the database
 */

import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:5000/api';

// ⚠️ REPLACE THIS WITH YOUR ACTUAL ADMIN TOKEN
// Get it from: localStorage.getItem('adminToken') in browser console after admin login
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE';

// Replace with an actual farm_id from your database
const TEST_FARM_ID = 1;

async function submitSensorReading(farmId, sensorType, value, unit, notes = null) {
  try {
    const response = await fetch(`${API_BASE}/admin/sensors/reading`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify({
        farmId,
        sensorType,
        value,
        unit,
        notes
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${sensorType}: ${value} ${unit} - Status: ${data.status}${data.isCritical ? ' 🚨 CRITICAL ALERT!' : ''}`);
      return data;
    } else {
      console.error(`❌ Error: ${data.message || 'Unknown error'}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Network error:`, error.message);
    return null;
  }
}

async function testAllScenarios() {
  console.log('🧪 Testing Sensor Monitoring System\n');
  console.log('=' .repeat(50));
  
  if (ADMIN_TOKEN === 'YOUR_ADMIN_TOKEN_HERE') {
    console.error('❌ Please set ADMIN_TOKEN in the script!');
    console.log('   Get token from browser: localStorage.getItem("adminToken")');
    return;
  }

  console.log(`📊 Testing with Farm ID: ${TEST_FARM_ID}\n`);

  // Test 1: Normal Temperature (should be NORMAL)
  console.log('\n1️⃣  Testing NORMAL Temperature (25°C)...');
  await submitSensorReading(TEST_FARM_ID, 'TEMPERATURE', 25, '°C', 'Normal temperature - no alert expected');

  // Wait 1 second
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 2: Warning Temperature (should be WARNING)
  console.log('\n2️⃣  Testing WARNING Temperature (35°C)...');
  await submitSensorReading(TEST_FARM_ID, 'TEMPERATURE', 35, '°C', 'Warning temperature - warning status expected');

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 3: Critical Temperature (should trigger CRITICAL alert)
  console.log('\n3️⃣  Testing CRITICAL Temperature (50°C)...');
  await submitSensorReading(TEST_FARM_ID, 'TEMPERATURE', 50, '°C', 'Critical temperature - ALERT should be triggered!');

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 4: Critical Low Temperature
  console.log('\n4️⃣  Testing CRITICAL Low Temperature (3°C)...');
  await submitSensorReading(TEST_FARM_ID, 'TEMPERATURE', 3, '°C', 'Critical low temperature - ALERT should be triggered!');

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 5: Normal Soil Moisture
  console.log('\n5️⃣  Testing NORMAL Soil Moisture (50%)...');
  await submitSensorReading(TEST_FARM_ID, 'SOIL_MOISTURE', 50, '%', 'Normal soil moisture');

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 6: Critical Low Soil Moisture
  console.log('\n6️⃣  Testing CRITICAL Low Soil Moisture (15%)...');
  await submitSensorReading(TEST_FARM_ID, 'SOIL_MOISTURE', 15, '%', 'Critical low soil moisture - ALERT should be triggered!');

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 7: Critical High Soil Moisture
  console.log('\n7️⃣  Testing CRITICAL High Soil Moisture (85%)...');
  await submitSensorReading(TEST_FARM_ID, 'SOIL_MOISTURE', 85, '%', 'Critical high soil moisture - ALERT should be triggered!');

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 8: Critical Low Soil pH
  console.log('\n8️⃣  Testing CRITICAL Low Soil pH (4.5)...');
  await submitSensorReading(TEST_FARM_ID, 'SOIL_PH', 4.5, 'pH', 'Critical low pH - ALERT should be triggered!');

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 9: Normal Humidity
  console.log('\n9️⃣  Testing NORMAL Humidity (60%)...');
  await submitSensorReading(TEST_FARM_ID, 'HUMIDITY', 60, '%', 'Normal humidity');

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test 10: Critical Low Humidity
  console.log('\n🔟 Testing CRITICAL Low Humidity (25%)...');
  await submitSensorReading(TEST_FARM_ID, 'HUMIDITY', 25, '%', 'Critical low humidity - ALERT should be triggered!');

  console.log('\n' + '='.repeat(50));
  console.log('✅ Test sequence completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Check backend console for alert messages');
  console.log('   2. Check SENSOR_ALERTS table in database');
  console.log('   3. Verify SMS/Email were sent (if configured)');
  console.log('   4. View results in admin dashboard: /admin/sensors');
}

// Run tests
testAllScenarios().catch(console.error);


import { getConnection } from "./database/connection.js";

/**
 * Test script to debug crops query
 * Run this to identify why the /api/crops endpoint is failing
 */

(async () => {
  let connection;
  try {
    console.log("🔍 Testing crops query...\n");
    
    connection = await getConnection();
    console.log("✅ Database connection successful\n");
    
    // Test 1: Check if CROP table exists and has data
    console.log("📊 Test 1: Checking CROP table...");
    try {
      const cropCheck = await connection.execute("SELECT COUNT(*) as crop_count FROM CROP");
      const cropCount = cropCheck.rows[0].CROP_COUNT || cropCheck.rows[0][0];
      console.log(`✅ CROP table exists with ${cropCount} records\n`);
    } catch (err) {
      console.error("❌ CROP table check failed:", err.message);
      console.log("→ Make sure you've run the enhanced_schema.sql script\n");
      return;
    }
    
    // Test 2: Check if FARM table exists and has data
    console.log("📊 Test 2: Checking FARM table...");
    try {
      const farmCheck = await connection.execute("SELECT COUNT(*) as farm_count FROM FARM");
      const farmCount = farmCheck.rows[0].FARM_COUNT || farmCheck.rows[0][0];
      console.log(`✅ FARM table exists with ${farmCount} records\n`);
    } catch (err) {
      console.error("❌ FARM table check failed:", err.message);
      return;
    }
    
    // Test 3: Check if FARMER table exists
    console.log("📊 Test 3: Checking FARMER table...");
    try {
      const farmerCheck = await connection.execute("SELECT farmer_id, name FROM FARMER WHERE ROWNUM <= 5");
      console.log(`✅ FARMER table exists with ${farmerCheck.rows.length} sample records:`);
      farmerCheck.rows.forEach(farmer => {
        console.log(`   - ID: ${farmer.FARMER_ID}, Name: ${farmer.NAME}`);
      });
      console.log();
    } catch (err) {
      console.error("❌ FARMER table check failed:", err.message);
      return;
    }
    
    // Test 4: Test the actual crops query with a sample farmer_id
    console.log("📊 Test 4: Testing crops JOIN query...");
    
    // Get first farmer_id
    const firstFarmer = await connection.execute(
      "SELECT farmer_id FROM FARMER WHERE ROWNUM = 1"
    );
    
    if (firstFarmer.rows.length === 0) {
      console.log("⚠️  No farmers found in database. Please add a farmer first.\n");
      return;
    }
    
    const testFarmerId = firstFarmer.rows[0].FARMER_ID;
    console.log(`Using farmer_id: ${testFarmerId}\n`);
    
    try {
      const cropsQuery = await connection.execute(
        `
        SELECT 
          c.crop_id,
          c.farm_id,
          c.crop_name,
          c.variety,
          c.sowing_date,
          c.expected_harvest_date,
          c.actual_harvest_date,
          c.expected_yield,
          c.actual_yield,
          c.crop_status,
          c.seed_quantity,
          c.planting_density,
          c.growth_stage,
          c.notes,
          f.farm_name,
          f.location AS farm_location
        FROM CROP c
        JOIN FARM f ON c.farm_id = f.farm_id
        WHERE f.farmer_id = :farmer_id
        ORDER BY c.sowing_date DESC
        `,
        { farmer_id: testFarmerId }
      );
      
      console.log(`✅ Crops query successful! Found ${cropsQuery.rows.length} crops:\n`);
      
      if (cropsQuery.rows.length > 0) {
        cropsQuery.rows.forEach((crop, index) => {
          console.log(`   ${index + 1}. ${crop.CROP_NAME} at ${crop.FARM_NAME}`);
          console.log(`      Status: ${crop.CROP_STATUS}, Variety: ${crop.VARIETY || 'N/A'}`);
        });
      } else {
        console.log("   No crops found for this farmer.");
        console.log("   This is OK - it means the query works but there's no data yet.");
      }
      
      console.log("\n✅ ALL TESTS PASSED! The crops endpoint should work correctly.");
      console.log("\n📝 If you're still getting errors:");
      console.log("   1. Make sure the backend server is restarted");
      console.log("   2. Check that the JWT token contains the correct farmer_id");
      console.log("   3. Verify the .env file has correct database credentials");
      
    } catch (err) {
      console.error("❌ Crops query failed:", err.message);
      console.error("\nFull error:", err);
      console.log("\n🔧 Possible fixes:");
      console.log("   1. Make sure the enhanced_schema.sql has been run");
      console.log("   2. Check that the CROP and FARM tables have the correct columns");
      console.log("   3. Verify foreign key relationships are set up correctly");
    }
    
  } catch (err) {
    console.error("❌ Test failed:", err);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("\n✅ Connection closed");
      } catch (closeErr) {
        console.error("❌ Error closing connection:", closeErr);
      }
    }
  }
})();


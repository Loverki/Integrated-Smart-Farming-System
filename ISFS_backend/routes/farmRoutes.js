import express from "express";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// GET all farms for the logged-in farmer
router.get("/", async (req, res) => {
  const farmer_id = parseInt(req.farmer?.farmer_id);
  
  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    // Get farms for the specific farmer with additional details
    // Fixed query to avoid Cartesian product when joining crops and sales
    const result = await connection.execute(
      `
      SELECT 
        f.farm_id,
        f.farm_name,
        f.location,
        f.area,
        f.soil_type,
        f.soil_ph,
        f.irrigation_type,
        f.farm_type,
        f.created_date,
        f.status,
        NVL(crop_data.crop_count, 0) as crop_count,
        NVL(sales_data.total_revenue, 0) as total_revenue
      FROM FARM f
      LEFT JOIN (
        SELECT farm_id, COUNT(crop_id) as crop_count
        FROM CROP
        GROUP BY farm_id
      ) crop_data ON f.farm_id = crop_data.farm_id
      LEFT JOIN (
        SELECT farm_id, SUM(total_amount) as total_revenue
        FROM SALES
        GROUP BY farm_id
      ) sales_data ON f.farm_id = sales_data.farm_id
      WHERE f.farmer_id = :farmer_id AND f.status = 'ACTIVE'
      ORDER BY f.created_date DESC
      `,
      { farmer_id }
    );
    
    // Transform Oracle object format to camelCase
    const farms = result.rows.map(row => ({
      farmId: row.FARM_ID,
      farmName: row.FARM_NAME,
      location: row.LOCATION,
      area: row.AREA,
      soilType: row.SOIL_TYPE,
      soilPh: row.SOIL_PH,
      irrigationType: row.IRRIGATION_TYPE,
      farmType: row.FARM_TYPE,
      createdDate: row.CREATED_DATE,
      status: row.STATUS,
      cropCount: row.CROP_COUNT,
      totalRevenue: row.TOTAL_REVENUE
    }));
    
    console.log(`✅ Retrieved ${farms.length} farms for farmer ${farmer_id}`);
    res.json(farms);
  } catch (err) {
    console.error("Get farms error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST a new farm
router.post("/", async (req, res) => {
  const { farm_name, location, area, soil_type, soil_ph, irrigation_type, farm_type } = req.body;
  const farmer_id = parseInt(req.farmer?.farmer_id);
  
  console.log('🔍 Farm creation request:', { 
    farmer_id, 
    farmer_id_type: typeof farmer_id,
    farmer_id_raw: req.farmer?.farmer_id,
    farm_name 
  });
  
  if (!farmer_id || isNaN(farmer_id)) {
    console.error('❌ Invalid farmer_id:', req.farmer?.farmer_id);
    return res.status(401).json({ message: "Unauthorized - invalid farmer ID" });
  }
  
  // Validate required fields
  if (!farm_name || !location || !area) {
    return res.status(400).json({ message: "Missing required fields: farm_name, location, and area are required" });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    // Check if farmer exists
    const farmerCheck = await connection.execute(
      `SELECT farmer_id FROM FARMER WHERE farmer_id = :farmer_id`,
      { farmer_id }
    );
    
    if (farmerCheck.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ 
        message: "Your farmer account was not found. Please login again.",
        requiresLogin: true
      });
    }
    
    // Ensure FARM_SEQ exists and reset it
    try {
      const countResult = await connection.execute(
        `SELECT NVL(MAX(farm_id), 0) AS max_id FROM FARM`
      );
      const maxFarmId = countResult.rows[0][0];
      
      const seqCheckResult = await connection.execute(`
        SELECT COUNT(*) as seq_count 
        FROM user_sequences 
        WHERE sequence_name = 'FARM_SEQ'
      `);
      const sequenceExists = seqCheckResult.rows[0][0] > 0;
      
      if (!sequenceExists) {
        console.log(`⚠️  FARM_SEQ doesn't exist, creating it starting from ${maxFarmId + 1}`);
        await connection.execute(
          `CREATE SEQUENCE FARM_SEQ START WITH ${maxFarmId + 1} INCREMENT BY 1 NOCACHE`
        );
      }
    } catch (seqError) {
      console.log("⚠️  Sequence check warning:", seqError.message);
    }
    
    // Insert farm with proper error handling
    const result = await connection.execute(
      `INSERT INTO FARM(farm_id, farmer_id, farm_name, location, area, soil_type, soil_ph, irrigation_type, farm_type, created_date, status) 
       VALUES(FARM_SEQ.NEXTVAL, :farmer_id, :farm_name, :location, :area, :soil_type, :soil_ph, :irrigation_type, :farm_type, SYSDATE, 'ACTIVE')`,
      { 
        farmer_id, 
        farm_name: farm_name.trim(), 
        location: location.trim(), 
        area: parseFloat(area), 
        soil_type: soil_type || 'Unknown',
        soil_ph: soil_ph ? parseFloat(soil_ph) : null,
        irrigation_type: irrigation_type || 'MANUAL',
        farm_type: farm_type || 'CONVENTIONAL'
      },
      { autoCommit: true }
    );
    
    console.log(`✅ Farm added successfully for farmer ${farmer_id}: ${farm_name}`);
    res.json({ 
      message: "Farm added successfully",
      farm_name: farm_name,
      location: location,
      area: area
    });
  } catch (err) {
    console.error("Add farm error:", err);
    
    // Handle specific Oracle errors
    if (err.message.includes('ORA-04091')) {
      return res.status(500).json({ 
        error: "Database trigger error. Please try again.",
        message: "There was a temporary database issue. Please try adding the farm again."
      });
    } else if (err.message.includes('ORA-00001')) {
      return res.status(400).json({ 
        error: "Duplicate entry",
        message: "A farm with this name already exists for this farmer."
      });
    } else {
      return res.status(500).json({ 
        error: err.message,
        message: "Failed to add farm. Please check your input and try again."
      });
    }
  } finally {
    if (connection) await connection.close();
  }
});

// UPDATE farm details
router.put("/:farm_id", async (req, res) => {
  const { farm_id } = req.params;
  const { farm_name, location, area, soil_type, soil_ph, irrigation_type, farm_type } = req.body;
  const farmer_id = parseInt(req.farmer?.farmer_id);

  console.log('🔍 Farm update request:', {
    farm_id: parseInt(farm_id),
    farmer_id,
    farmer_id_type: typeof farmer_id,
    farm_name
  });

  if (!farmer_id || isNaN(farmer_id)) {
    return res.status(401).json({ message: "Unauthorized - invalid farmer ID" });
  }

  let connection;
  try {
    connection = await getConnection();

    console.log(`🔍 Checking if farm ${farm_id} belongs to farmer ${farmer_id}...`);
    
    // Verify farm belongs to farmer
    const farmCheck = await connection.execute(
      `SELECT farm_id FROM FARM WHERE farm_id = :farm_id AND farmer_id = :farmer_id`,
      { farm_id: parseInt(farm_id), farmer_id }
    );

    console.log(`📊 Farm check result:`, {
      found: farmCheck.rows.length > 0,
      rows: farmCheck.rows.length
    });

    if (farmCheck.rows.length === 0) {
      await connection.close();
      console.log(`❌ Farm ${farm_id} not found or doesn't belong to farmer ${farmer_id}`);
      return res.status(404).json({ message: "Farm not found or does not belong to you" });
    }

    console.log(`✅ Farm verified, proceeding with update...`);
    
    // Update farm
    const updateData = {
      farm_name,
      location,
      area: parseFloat(area),
      soil_type: soil_type || null,
      soil_ph: soil_ph ? parseFloat(soil_ph) : null,
      irrigation_type: irrigation_type || null,
      farm_type: farm_type || 'CONVENTIONAL',
      farm_id: parseInt(farm_id)
    };
    
    console.log(`📝 Update data:`, updateData);
    
    await connection.execute(
      `UPDATE FARM 
       SET farm_name = :farm_name,
           location = :location,
           area = :area,
           soil_type = :soil_type,
           soil_ph = :soil_ph,
           irrigation_type = :irrigation_type,
           farm_type = :farm_type
       WHERE farm_id = :farm_id`,
      updateData,
      { autoCommit: true }
    );

    console.log(`✅ Farm ${farm_id} updated successfully!`);

    await connection.close();
    
    res.json({
      message: "Farm updated successfully",
      farm_id: parseInt(farm_id),
      farm_name
    });

  } catch (err) {
    console.error("❌ Error updating farm:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.errorNum,
      stack: err.stack
    });
    
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr.message);
      }
    }
    
    res.status(500).json({ 
      message: "Failed to update farm", 
      error: err.message 
    });
  }
});

// GET single farm by ID (for edit form)
router.get("/:farm_id", async (req, res) => {
  const { farm_id } = req.params;
  const farmer_id = parseInt(req.farmer?.farmer_id);

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT * FROM FARM WHERE farm_id = :farm_id AND farmer_id = :farmer_id`,
      { farm_id: parseInt(farm_id), farmer_id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Farm not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("Error fetching farm:", err);
    res.status(500).json({ message: "Failed to fetch farm", error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;

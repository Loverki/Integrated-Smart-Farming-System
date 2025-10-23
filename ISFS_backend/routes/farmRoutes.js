import express from "express";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// GET all farms for the logged-in farmer
router.get("/", async (req, res) => {
  const farmer_id = req.farmer?.farmer_id;
  
  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    // Get farms for the specific farmer with additional details
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
        COUNT(c.crop_id) as crop_count,
        NVL(SUM(s.total_amount), 0) as total_revenue
      FROM FARM f
      LEFT JOIN CROP c ON f.farm_id = c.farm_id
      LEFT JOIN SALES s ON f.farm_id = s.farm_id
      WHERE f.farmer_id = :farmer_id
      GROUP BY f.farm_id, f.farm_name, f.location, f.area, f.soil_type, f.soil_ph, f.irrigation_type, f.farm_type, f.created_date, f.status
      ORDER BY f.created_date DESC
      `,
      { farmer_id }
    );
    
    console.log(`✅ Retrieved ${result.rows.length} farms for farmer ${farmer_id}`);
    res.json(result.rows || []);
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
  const farmer_id = req.farmer?.farmer_id;
  
  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }
  
  // Validate required fields
  if (!farm_name || !location || !area) {
    return res.status(400).json({ message: "Missing required fields: farm_name, location, and area are required" });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
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
  const farmer_id = req.farmer?.farmer_id;

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();

    // Verify farm belongs to farmer
    const farmCheck = await connection.execute(
      `SELECT farm_id FROM FARM WHERE farm_id = :farm_id AND farmer_id = :farmer_id`,
      { farm_id: parseInt(farm_id), farmer_id }
    );

    if (farmCheck.rows.length === 0) {
      return res.status(404).json({ message: "Farm not found or does not belong to you" });
    }

    // Update farm
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
      {
        farm_name,
        location,
        area: parseFloat(area),
        soil_type: soil_type || null,
        soil_ph: soil_ph ? parseFloat(soil_ph) : null,
        irrigation_type: irrigation_type || null,
        farm_type: farm_type || 'CONVENTIONAL',
        farm_id: parseInt(farm_id)
      },
      { autoCommit: true }
    );

    res.json({
      message: "Farm updated successfully",
      farm_id: parseInt(farm_id),
      farm_name
    });

  } catch (err) {
    console.error("Error updating farm:", err);
    res.status(500).json({ message: "Failed to update farm", error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET single farm by ID (for edit form)
router.get("/:farm_id", async (req, res) => {
  const { farm_id } = req.params;
  const farmer_id = req.farmer?.farmer_id;

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

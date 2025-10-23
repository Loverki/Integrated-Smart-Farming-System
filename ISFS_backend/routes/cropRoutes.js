import express from "express";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// GET all crops for the logged-in farmer
router.get("/", async (req, res) => {
  const farmer_id = req.farmer?.farmer_id;

  if (!farmer_id) {
    console.error("❌ Unauthorized access attempt - no farmer_id found");
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();

    console.log(`📊 Fetching crops for farmer ${farmer_id}`);

    const result = await connection.execute(
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
        f.farm_name,
        f.location AS farm_location
      FROM CROP c
      JOIN FARM f ON c.farm_id = f.farm_id
      WHERE f.farmer_id = :farmer_id
      ORDER BY c.sowing_date DESC
      `,
      { farmer_id }
    );

    console.log(`✅ Retrieved ${result.rows ? result.rows.length : 0} crops for farmer ${farmer_id}`);
    
    // Manually map to plain objects to avoid circular reference issues
    const crops = (result.rows || []).map(row => {
      const obj = {};
      for (const key in row) {
        if (row.hasOwnProperty(key)) {
          obj[key] = row[key];
        }
      }
      return obj;
    });
    
    res.json(crops);
  } catch (err) {
    console.error("❌ Get crops error:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ 
      error: err.message,
      message: "Failed to fetch crops. Please try again later."
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("❌ Error closing connection:", closeErr);
      }
    }
  }
});

// POST a new crop
router.post("/", async (req, res) => {
  const {
    farm_id,
    crop_name,
    variety,
    sowing_date,
    expected_harvest_date,
    expected_yield,
    actual_harvest_date,
    actual_yield,
    crop_status,
    seed_quantity,
    planting_density,
    growth_stage,
    notes,
  } = req.body;

  const farmer_id = req.farmer?.farmer_id;

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  if (!farm_id || !crop_name || !sowing_date) {
    return res.status(400).json({ message: "Missing required fields: farm_id, crop_name, sowing_date" });
  }

  let connection;
  try {
    connection = await getConnection();

    // Validate farm belongs to farmer
    const farmCheck = await connection.execute(
      `SELECT farm_id FROM FARM WHERE farm_id = :farm_id AND farmer_id = :farmer_id`,
      { farm_id: parseInt(farm_id), farmer_id }
    );

    if (farmCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid farm_id or does not belong to the farmer" });
    }

    // Insert crop in one query
    const insertQuery = `
      INSERT INTO CROP(
        crop_id, farm_id, crop_name, variety, sowing_date, expected_harvest_date,
        actual_harvest_date, expected_yield, actual_yield, crop_status,
        seed_quantity, planting_density, growth_stage, notes
      ) VALUES(
        CROP_SEQ.NEXTVAL, :farm_id, :crop_name, :variety, TO_DATE(:sowing_date, 'YYYY-MM-DD'),
        CASE WHEN :expected_harvest_date IS NOT NULL THEN TO_DATE(:expected_harvest_date, 'YYYY-MM-DD') ELSE NULL END,
        CASE WHEN :actual_harvest_date IS NOT NULL THEN TO_DATE(:actual_harvest_date, 'YYYY-MM-DD') ELSE NULL END,
        :expected_yield, :actual_yield,
        :crop_status, :seed_quantity, :planting_density, :growth_stage, :notes
      )
    `;

    const binds = {
      farm_id: parseInt(farm_id),
      crop_name: crop_name.trim(),
      variety: variety || null,
      sowing_date,
      expected_harvest_date: expected_harvest_date || null,
      actual_harvest_date: actual_harvest_date || null,
      expected_yield: expected_yield ? parseFloat(expected_yield) : null,
      actual_yield: actual_yield ? parseFloat(actual_yield) : null,
      crop_status: crop_status || "PLANTED",
      seed_quantity: seed_quantity ? parseFloat(seed_quantity) : null,
      planting_density: planting_density ? parseFloat(planting_density) : null,
      growth_stage: growth_stage || null,
      notes: notes || null,
    };

    await connection.execute(insertQuery, binds, { autoCommit: true });

    // Get the inserted crop_id
    const currValResult = await connection.execute(`SELECT CROP_SEQ.CURRVAL AS crop_id FROM DUAL`);
    const crop_id = currValResult.rows[0].CROP_ID;

    res.json({
      message: "Crop added successfully",
      crop_id,
      crop_name,
      farm_id,
    });

  } catch (err) {
    console.error("Add crop error:", err);
    res.status(500).json({
      message: "Failed to add crop. Please check input.",
      error: err.message,
    });
  } finally {
    if (connection) await connection.close();
  }
});

// DELETE a crop
router.delete("/:crop_id", async (req, res) => {
  const { crop_id } = req.params;
  const farmer_id = req.farmer?.farmer_id;

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();

    // Verify crop belongs to farmer
    const cropCheck = await connection.execute(
      `SELECT c.crop_id, c.crop_name, f.farmer_id
       FROM CROP c
       JOIN FARM f ON c.farm_id = f.farm_id
       WHERE c.crop_id = :crop_id AND f.farmer_id = :farmer_id`,
      { crop_id: parseInt(crop_id), farmer_id }
    );

    if (cropCheck.rows.length === 0) {
      return res.status(404).json({ message: "Crop not found or does not belong to you" });
    }

    const cropName = cropCheck.rows[0].CROP_NAME;

    // Delete the crop (CASCADE will handle related records)
    await connection.execute(
      `DELETE FROM CROP WHERE crop_id = :crop_id`,
      { crop_id: parseInt(crop_id) },
      { autoCommit: true }
    );

    res.json({
      message: "Crop deleted successfully",
      crop_id: parseInt(crop_id),
      crop_name: cropName
    });

  } catch (err) {
    console.error("Error deleting crop:", err);
    res.status(500).json({ message: "Failed to delete crop", error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;

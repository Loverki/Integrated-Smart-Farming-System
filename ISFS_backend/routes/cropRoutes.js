import express from "express";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// GET all crops for the logged-in farmer
router.get("/", async (req, res) => {
  const farmer_id = req.farmer?.farmer_id;

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();

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
        c.notes,
        f.farm_name,
        f.location AS farm_location
      FROM CROP c
      JOIN FARM f ON c.farm_id = f.farm_id
      WHERE f.farmer_id = :farmer_id
      ORDER BY c.sowing_date DESC
      `,
      { farmer_id }
    );

    res.json(result.rows || []);
  } catch (err) {
    console.error("Get crops error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
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

export default router;

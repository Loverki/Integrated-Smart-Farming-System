import express from "express";
import { getConnection } from "../database/connection.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET all fertilizers for the logged-in farmer
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
        fer.fertilizer_id,
        fer.farm_id,
        fer.fertilizer_name,
        fer.fertilizer_type,
        fer.quantity_used,
        fer.unit,
        fer.cost_per_unit,
        fer.total_cost,
        fer.applied_date,
        fer.applied_by,
        fer.crop_id,
        fer.application_method,
        fer.effectiveness_rating,
        f.farm_name,
        c.crop_name
      FROM FERTILIZER fer
      JOIN FARM f ON fer.farm_id = f.farm_id
      LEFT JOIN CROP c ON fer.crop_id = c.crop_id
      WHERE f.farmer_id = :farmer_id
      ORDER BY fer.applied_date DESC
      `,
      { farmer_id }
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error("Get fertilizers error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST a new fertilizer
router.post("/", async (req, res) => {
  const { 
    farm_id, 
    fertilizer_name, 
    fertilizer_type,
    quantity_used, 
    unit,
    cost_per_unit,
    total_cost,
    applied_date,
    applied_by,
    crop_id,
    application_method,
    effectiveness_rating
  } = req.body;

  const farmer_id = req.farmer?.farmer_id;

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  if (!farm_id || !fertilizer_name || !quantity_used || !applied_date) {
    return res.status(400).json({ message: "Missing required fields: farm, fertilizer name, quantity, and applied date are required" });
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

    const insertQuery = `
      INSERT INTO FERTILIZER(
        fertilizer_id, farm_id, fertilizer_name, fertilizer_type,
        quantity_used, unit, applied_date, cost_per_unit, total_cost,
        applied_by, crop_id, application_method, effectiveness_rating
      ) VALUES(
        FERTILIZER_SEQ.NEXTVAL, :farm_id, :fertilizer_name, :fertilizer_type,
        :quantity_used, :unit, TO_DATE(:applied_date, 'YYYY-MM-DD'), :cost_per_unit, :total_cost,
        :applied_by, :crop_id, :application_method, :effectiveness_rating
      )
    `;

    const binds = {
      farm_id: parseInt(farm_id),
      fertilizer_name: fertilizer_name?.trim() || null,
      fertilizer_type: fertilizer_type?.trim() || 'INORGANIC',
      quantity_used: parseFloat(quantity_used),
      unit: unit?.trim() || 'KG',
      applied_date,
      cost_per_unit: cost_per_unit ? parseFloat(cost_per_unit) : null,
      total_cost: total_cost ? parseFloat(total_cost) : null,
      applied_by: applied_by?.trim() || null,
      crop_id: crop_id ? parseInt(crop_id) : null,
      application_method: application_method?.trim() || null,
      effectiveness_rating: effectiveness_rating ? parseInt(effectiveness_rating) : null
    };

    await connection.execute(insertQuery, binds, { autoCommit: true });

    res.json({ message: "Fertilizer added successfully" });
  } catch (err) {
    console.error("Add fertilizer error:", err);
    res.status(500).json({ 
      message: "Failed to add fertilizer",
      error: err.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;

import express from "express";
import { getConnection } from "../database/connection.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET all equipment for the logged-in farmer
router.get("/", async (req, res) => {
  const farmer_id = parseInt(req.farmer?.farmer_id);

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `
      SELECT 
        equipment_id,
        farmer_id,
        equipment_name,
        equipment_type,
        brand,
        model,
        purchase_date,
        purchase_cost,
        current_value,
        status,
        last_maintenance_date,
        next_maintenance_date
      FROM EQUIPMENT
      WHERE farmer_id = :farmer_id
      ORDER BY purchase_date DESC
      `,
      { farmer_id }
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error("Get equipment error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST a new equipment
router.post("/", async (req, res) => {
  const { 
    equipment_name,
    equipment_type,
    brand,
    model,
    purchase_date,
    purchase_cost,
    current_value,
    status,
    last_maintenance_date,
    next_maintenance_date
  } = req.body;

  const farmer_id = parseInt(req.farmer?.farmer_id);

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  if (!equipment_name || !equipment_type) {
    return res.status(400).json({ message: "Equipment name and type are required" });
  }

  let connection;
  try {
    connection = await getConnection();

    const insertQuery = `
      INSERT INTO EQUIPMENT(
        equipment_id, farmer_id, equipment_name, equipment_type,
        brand, model, purchase_date, purchase_cost, current_value,
        status, last_maintenance_date, next_maintenance_date
      ) VALUES(
        EQUIPMENT_SEQ.NEXTVAL, :farmer_id, :equipment_name, :equipment_type,
        :brand, :model, 
        CASE WHEN :purchase_date IS NOT NULL THEN TO_DATE(:purchase_date, 'YYYY-MM-DD') ELSE NULL END,
        :purchase_cost, :current_value, :status,
        CASE WHEN :last_maintenance_date IS NOT NULL THEN TO_DATE(:last_maintenance_date, 'YYYY-MM-DD') ELSE NULL END,
        CASE WHEN :next_maintenance_date IS NOT NULL THEN TO_DATE(:next_maintenance_date, 'YYYY-MM-DD') ELSE NULL END
      )
    `;

    const binds = {
      farmer_id,
      equipment_name: equipment_name?.trim() || null,
      equipment_type: equipment_type?.trim() || null,
      brand: brand?.trim() || null,
      model: model?.trim() || null,
      purchase_date: purchase_date || null,
      purchase_cost: purchase_cost ? parseFloat(purchase_cost) : null,
      current_value: current_value ? parseFloat(current_value) : null,
      status: status?.trim() || 'OPERATIONAL',
      last_maintenance_date: last_maintenance_date || null,
      next_maintenance_date: next_maintenance_date || null
    };

    await connection.execute(insertQuery, binds, { autoCommit: true });

    res.json({ message: "Equipment added successfully" });
  } catch (err) {
    console.error("Add equipment error:", err);
    res.status(500).json({ 
      message: "Failed to add equipment",
      error: err.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

// PUT - Update equipment status
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { status, current_value, last_maintenance_date, next_maintenance_date } = req.body;
  const farmer_id = parseInt(req.farmer?.farmer_id);

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();

    // Verify equipment belongs to farmer
    const checkResult = await connection.execute(
      `SELECT equipment_id FROM EQUIPMENT WHERE equipment_id = :id AND farmer_id = :farmer_id`,
      { id: parseInt(id), farmer_id }
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Equipment not found or does not belong to you" });
    }

    const updateQuery = `
      UPDATE EQUIPMENT
      SET status = :status,
          current_value = :current_value,
          last_maintenance_date = CASE WHEN :last_maintenance_date IS NOT NULL THEN TO_DATE(:last_maintenance_date, 'YYYY-MM-DD') ELSE last_maintenance_date END,
          next_maintenance_date = CASE WHEN :next_maintenance_date IS NOT NULL THEN TO_DATE(:next_maintenance_date, 'YYYY-MM-DD') ELSE next_maintenance_date END
      WHERE equipment_id = :id
    `;

    await connection.execute(
      updateQuery,
      {
        id: parseInt(id),
        status: status || 'OPERATIONAL',
        current_value: current_value ? parseFloat(current_value) : null,
        last_maintenance_date: last_maintenance_date || null,
        next_maintenance_date: next_maintenance_date || null
      },
      { autoCommit: true }
    );

    res.json({ message: "Equipment updated successfully" });
  } catch (err) {
    console.error("Update equipment error:", err);
    res.status(500).json({ 
      message: "Failed to update equipment",
      error: err.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;


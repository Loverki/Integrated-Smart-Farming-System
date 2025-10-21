import express from "express";
import { getConnection } from "../database/connection.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET all labours
router.get("/", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT 
        labour_id,
        name,
        phone,
        email,
        skill,
        hourly_rate,
        address,
        hire_date,
        status
      FROM LABOUR
      ORDER BY hire_date DESC`
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error("Get labours error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST a new labour
router.post("/", async (req, res) => {
  const { name, phone, email, skill, hourly_rate, address } = req.body;
  
  if (!name || !skill) {
    return res.status(400).json({ message: "Name and skill are required" });
  }
  
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO LABOUR(
        labour_id, name, phone, email, skill, hourly_rate, address, hire_date, status
      ) VALUES(
        LABOUR_SEQ.NEXTVAL, :name, :phone, :email, :skill, :hourly_rate, :address, SYSDATE, 'AVAILABLE'
      )`,
      { 
        name: name?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        skill: skill?.trim() || null,
        hourly_rate: hourly_rate ? parseFloat(hourly_rate) : null,
        address: address?.trim() || null
      },
      { autoCommit: true }
    );
    res.json({ message: "Labour added successfully" });
  } catch (err) {
    console.error("Add labour error:", err);
    res.status(500).json({ 
      message: "Failed to add labour",
      error: err.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;

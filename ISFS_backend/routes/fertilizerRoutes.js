import express from "express";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// GET all fertilizers
router.get("/", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute("SELECT * FROM Fertilizer");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST a new fertilizer
router.post("/", async (req, res) => {
  const { farm_id, fertilizer_name, quantity_used, applied_date } = req.body;
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO Fertilizer(fertilizer_id, farm_id, fertilizer_name, quantity_used, applied_date)
       VALUES(FERTILIZER_SEQ.NEXTVAL, :farm_id, :fertilizer_name, :quantity_used, TO_DATE(:applied_date, 'YYYY-MM-DD'))`,
      { farm_id, fertilizer_name, quantity_used, applied_date },
      { autoCommit: true }
    );
    res.json({ message: "Fertilizer added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;

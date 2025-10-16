import express from "express";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// GET all crops
router.get("/", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute("SELECT * FROM Crop");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST a new crop
router.post("/", async (req, res) => {
  const { farm_id, crop_name, sowing_date, harvesting_date, expected_yield } = req.body;
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO Crop(crop_id, farm_id, crop_name, sowing_date, harvesting_date, expected_yield)
       VALUES(CROP_SEQ.NEXTVAL, :farm_id, :crop_name, TO_DATE(:sowing_date, 'YYYY-MM-DD'), TO_DATE(:harvesting_date, 'YYYY-MM-DD'), :expected_yield)`,
      { farm_id, crop_name, sowing_date, harvesting_date, expected_yield },
      { autoCommit: true }
    );
    res.json({ message: "Crop added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;

import express from "express";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// GET all farms
router.get("/", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute("SELECT * FROM Farm");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST a new farm
router.post("/", async (req, res) => {
  const { farmer_id, location, area, soil_type } = req.body;
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO Farm(farm_id, farmer_id, location, area, soil_type) 
       VALUES(FARM_SEQ.NEXTVAL, :farmer_id, :location, :area, :soil_type)`,
      { farmer_id, location, area, soil_type },
      { autoCommit: true }
    );
    res.json({ message: "Farm added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;

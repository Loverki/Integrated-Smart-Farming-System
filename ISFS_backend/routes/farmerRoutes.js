import express from "express";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// GET all farmers
router.get("/", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute("SELECT * FROM Farmer");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST a new farmer
router.post("/", async (req, res) => {
  const { name, phone, address } = req.body;
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO Farmer(farmer_id, name, phone, address, reg_date) 
       VALUES(FARMER_SEQ.NEXTVAL, :name, :phone, :address, SYSDATE)`,
      { name, phone, address },
      { autoCommit: true }
    );
    res.json({ message: "Farmer added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;

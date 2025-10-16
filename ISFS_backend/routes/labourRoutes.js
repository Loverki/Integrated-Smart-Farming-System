import express from "express";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// GET all labours
router.get("/", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute("SELECT * FROM Labour");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST a new labour
router.post("/", async (req, res) => {
  const { name, phone, skill } = req.body;
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO Labour(labour_id, name, phone, skill)
       VALUES(LABOUR_SEQ.NEXTVAL, :name, :phone, :skill)`,
      { name, phone, skill },
      { autoCommit: true }
    );
    res.json({ message: "Labour added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;

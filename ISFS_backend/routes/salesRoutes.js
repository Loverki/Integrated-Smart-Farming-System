import express from "express";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// GET all sales
router.get("/", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute("SELECT * FROM Sales");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST a new sale
router.post("/", async (req, res) => {
  const { farm_id, crop_id, quantity_sold, price_per_unit, sale_date } = req.body;
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO Sales(sale_id, farm_id, crop_id, quantity_sold, price_per_unit, sale_date)
       VALUES(SALES_SEQ.NEXTVAL, :farm_id, :crop_id, :quantity_sold, :price_per_unit, TO_DATE(:sale_date, 'YYYY-MM-DD'))`,
      { farm_id, crop_id, quantity_sold, price_per_unit, sale_date },
      { autoCommit: true }
    );
    res.json({ message: "Sale added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;

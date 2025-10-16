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

// GET farmer dashboard statistics
router.get("/dashboard-stats", async (req, res) => {
  let connection;
  try {
    const farmerId = req.farmer.farmer_id;
    connection = await getConnection();
    
    // Get total farms for this farmer
    const farmsResult = await connection.execute(
      `SELECT COUNT(*) as total_farms FROM FARM WHERE FARMER_ID = :farmer_id`,
      { farmer_id: farmerId }
    );
    
    // Get total crops across all farms
    const cropsResult = await connection.execute(
      `SELECT COUNT(*) as total_crops FROM CROP c 
       JOIN FARM f ON c.FARM_ID = f.FARM_ID 
       WHERE f.FARMER_ID = :farmer_id`,
      { farmer_id: farmerId }
    );
    
    // Get total revenue
    const revenueResult = await connection.execute(
      `SELECT NVL(SUM(s.TOTAL_AMOUNT), 0) as total_revenue 
       FROM SALES s 
       JOIN FARM f ON s.FARM_ID = f.FARM_ID 
       WHERE f.FARMER_ID = :farmer_id`,
      { farmer_id: farmerId }
    );
    
    // Get average yield
    const yieldResult = await connection.execute(
      `SELECT NVL(AVG(c.ACTUAL_YIELD), 0) as avg_yield 
       FROM CROP c 
       JOIN FARM f ON c.FARM_ID = f.FARM_ID 
       WHERE f.FARMER_ID = :farmer_id AND c.ACTUAL_YIELD IS NOT NULL`,
      { farmer_id: farmerId }
    );
    
    // Get total area
    const areaResult = await connection.execute(
      `SELECT NVL(SUM(f.AREA), 0) as total_area 
       FROM FARM f 
       WHERE f.FARMER_ID = :farmer_id`,
      { farmer_id: farmerId }
    );
    
    // Get active crops count
    const activeCropsResult = await connection.execute(
      `SELECT COUNT(*) as active_crops 
       FROM CROP c 
       JOIN FARM f ON c.FARM_ID = f.FARM_ID 
       WHERE f.FARMER_ID = :farmer_id AND c.CROP_STATUS IN ('PLANTED', 'GROWING', 'MATURE')`,
      { farmer_id: farmerId }
    );

    res.json({
      total_farms: farmsResult.rows[0].TOTAL_FARMS,
      total_crops: cropsResult.rows[0].TOTAL_CROPS,
      total_revenue: revenueResult.rows[0].TOTAL_REVENUE,
      avg_yield: Math.round(yieldResult.rows[0].AVG_YIELD || 0),
      total_area: areaResult.rows[0].TOTAL_AREA,
      active_crops: activeCropsResult.rows[0].ACTIVE_CROPS
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET farmer's farms with details
router.get("/farms", async (req, res) => {
  let connection;
  try {
    const farmerId = req.farmer.farmer_id;
    connection = await getConnection();
    
    const result = await connection.execute(
      `SELECT f.FARM_ID, f.FARM_NAME, f.LOCATION, f.AREA, f.SOIL_TYPE, f.SOIL_PH, 
              f.IRRIGATION_TYPE, f.FARM_TYPE, f.STATUS, f.CREATED_DATE,
              COUNT(c.CROP_ID) as CROP_COUNT,
              NVL(SUM(s.TOTAL_AMOUNT), 0) as TOTAL_REVENUE
       FROM FARM f
       LEFT JOIN CROP c ON f.FARM_ID = c.FARM_ID
       LEFT JOIN SALES s ON f.FARM_ID = s.FARM_ID
       WHERE f.FARMER_ID = :farmer_id
       GROUP BY f.FARM_ID, f.FARM_NAME, f.LOCATION, f.AREA, f.SOIL_TYPE, f.SOIL_PH, 
                f.IRRIGATION_TYPE, f.FARM_TYPE, f.STATUS, f.CREATED_DATE
       ORDER BY f.CREATED_DATE DESC`,
      { farmer_id: farmerId }
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error("Get farms error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET farmer's recent activity
router.get("/recent-activity", async (req, res) => {
  let connection;
  try {
    const farmerId = req.farmer.farmer_id;
    connection = await getConnection();
    
    // Get recent crop activities
    const cropActivity = await connection.execute(
      `SELECT 'CROP' as activity_type, c.CROP_NAME as description, 
              c.SOWING_DATE as activity_date, f.FARM_NAME as location
       FROM CROP c
       JOIN FARM f ON c.FARM_ID = f.FARM_ID
       WHERE f.FARMER_ID = :farmer_id AND c.SOWING_DATE >= SYSDATE - 30
       ORDER BY c.SOWING_DATE DESC
       FETCH FIRST 5 ROWS ONLY`,
      { farmer_id: farmerId }
    );
    
    // Get recent sales
    const salesActivity = await connection.execute(
      `SELECT 'SALE' as activity_type, 
              c.CROP_NAME || ' sold - ' || s.TOTAL_AMOUNT || '$' as description,
              s.SALE_DATE as activity_date, f.FARM_NAME as location
       FROM SALES s
       JOIN FARM f ON s.FARM_ID = f.FARM_ID
       LEFT JOIN CROP c ON s.CROP_ID = c.CROP_ID
       WHERE f.FARMER_ID = :farmer_id AND s.SALE_DATE >= SYSDATE - 30
       ORDER BY s.SALE_DATE DESC
       FETCH FIRST 5 ROWS ONLY`,
      { farmer_id: farmerId }
    );
    
    // Combine and sort activities
    const activities = [
      ...cropActivity.rows.map(row => ({ ...row, ACTIVITY_TYPE: 'CROP' })),
      ...salesActivity.rows.map(row => ({ ...row, ACTIVITY_TYPE: 'SALE' }))
    ].sort((a, b) => new Date(b.ACTIVITY_DATE) - new Date(a.ACTIVITY_DATE)).slice(0, 10);
    
    res.json(activities);
  } catch (err) {
    console.error("Get recent activity error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;

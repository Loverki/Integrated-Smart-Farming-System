import express from "express";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// Middleware check to safely read farmer_id
function safeFarmerId(req) {
  const farmerId = req.farmer?.farmer_id || null;
  console.log('safeFarmerId check:', { 
    hasFarmer: !!req.farmer, 
    farmer: req.farmer, 
    farmerId 
  });
  return farmerId;
}

// GET current farmer's profile
router.get("/profile", async (req, res) => {
  const farmer_id = parseInt(req.farmer?.farmer_id);
  
  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - No farmer ID" });
  }

  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT farmer_id, name, phone, email, address, reg_date, status, total_farms, total_area 
       FROM FARMER WHERE farmer_id = :farmer_id`,
      { farmer_id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Convert Oracle row to object
    const farmer = {
      farmer_id: result.rows[0][0],
      name: result.rows[0][1],
      phone: result.rows[0][2],
      email: result.rows[0][3],
      address: result.rows[0][4],
      reg_date: result.rows[0][5],
      status: result.rows[0][6],
      total_farms: result.rows[0][7],
      total_area: result.rows[0][8]
    };

    res.json(farmer);
  } catch (err) {
    console.error("Get farmer profile error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET all farmers
router.get("/", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      "SELECT * FROM Farmer"
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error("Get all farmers error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// UPDATE farmer email only
router.put("/profile", async (req, res) => {
  const farmer_id = parseInt(req.farmer?.farmer_id);
  
  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - No farmer ID" });
  }

  const { email } = req.body;

  let connection;
  try {
    connection = await getConnection();

    // Check if email is being changed and if it's already taken by another farmer
    if (email && email.trim()) {
      const emailCheckResult = await connection.execute(
        `SELECT farmer_id FROM FARMER WHERE email = :email AND farmer_id != :farmer_id`,
        { email: email.trim(), farmer_id }
      );
      
      if (emailCheckResult.rows.length > 0) {
        return res.status(400).json({ message: "Email is already registered to another farmer" });
      }
    }

    // Update only email field
    const updateQuery = `
      UPDATE FARMER 
      SET email = :email
      WHERE farmer_id = :farmer_id
    `;

    await connection.execute(updateQuery, {
      email: email ? email.trim() : null,
      farmer_id
    });

    await connection.commit();

    // Fetch updated profile
    const result = await connection.execute(
      `SELECT farmer_id, name, phone, email, address, reg_date, status, total_farms, total_area 
       FROM FARMER WHERE farmer_id = :farmer_id`,
      { farmer_id }
    );

    const updatedFarmer = {
      farmer_id: result.rows[0][0],
      name: result.rows[0][1],
      phone: result.rows[0][2],
      email: result.rows[0][3],
      address: result.rows[0][4],
      reg_date: result.rows[0][5],
      status: result.rows[0][6],
      total_farms: result.rows[0][7],
      total_area: result.rows[0][8]
    };

    res.json({
      message: "Email updated successfully",
      farmer: updatedFarmer
    });
  } catch (err) {
    console.error("Update farmer email error:", err);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback error:", rollbackErr);
      }
    }
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST a new farmer - DISABLED: Use /api/auth/register instead
router.post("/", async (req, res) => {
  // Farmers should only be created through registration endpoint
  res.status(400).json({ 
    error: "Direct farmer creation is disabled. Please use /api/auth/register endpoint instead." 
  });
});

// Example: GET dashboard stats
router.get("/dashboard-stats", async (req, res) => {
  console.log('Dashboard stats endpoint hit');
  console.log('Request headers:', req.headers.authorization ? 'Token present' : 'No token');
  console.log('req.farmer:', req.farmer);
  
  const farmerId = safeFarmerId(req);
  if (!farmerId) {
    console.error('Farmer ID not found in request');
    return res.status(401).json({ message: "Unauthorized - No farmer ID" });
  }

  let connection;
  try {
    connection = await getConnection();
    
    // Get total farms
    const farmsResult = await connection.execute(
      `SELECT COUNT(*) AS total_farms FROM FARM WHERE FARMER_ID = :farmer_id`,
      { farmer_id: farmerId }
    );

    // Get total crops
    const cropsResult = await connection.execute(
      `SELECT COUNT(*) AS total_crops 
       FROM CROP c 
       JOIN FARM f ON c.farm_id = f.farm_id 
       WHERE f.farmer_id = :farmer_id`,
      { farmer_id: farmerId }
    );

    // Get total revenue from sales
    const revenueResult = await connection.execute(
      `SELECT NVL(SUM(s.total_amount), 0) AS total_revenue 
       FROM SALES s 
       JOIN FARM f ON s.farm_id = f.farm_id 
       WHERE f.farmer_id = :farmer_id`,
      { farmer_id: farmerId }
    );

    // Get average yield from crops (use expected_yield if actual_yield is not available)
    const yieldResult = await connection.execute(
      `SELECT 
        NVL(AVG(CASE WHEN c.actual_yield IS NOT NULL THEN c.actual_yield ELSE c.expected_yield END), 0) AS avg_yield,
        NVL(AVG(c.actual_yield), 0) AS avg_actual_yield,
        NVL(AVG(c.expected_yield), 0) AS avg_expected_yield
       FROM CROP c 
       JOIN FARM f ON c.farm_id = f.farm_id 
       WHERE f.farmer_id = :farmer_id`,
      { farmer_id: farmerId }
    );

    res.json({
      total_farms: farmsResult.rows[0].TOTAL_FARMS || 0,
      total_crops: cropsResult.rows[0].TOTAL_CROPS || 0,
      total_revenue: revenueResult.rows[0].TOTAL_REVENUE || 0,
      avg_yield: Math.round(yieldResult.rows[0].AVG_YIELD || 0),
      avg_actual_yield: Math.round(yieldResult.rows[0].AVG_ACTUAL_YIELD || 0),
      avg_expected_yield: Math.round(yieldResult.rows[0].AVG_EXPECTED_YIELD || 0)
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET analytics data
router.get("/analytics", async (req, res) => {
  const farmerId = safeFarmerId(req);
  if (!farmerId) return res.status(401).json({ message: "Unauthorized" });

  let connection;
  try {
    connection = await getConnection();
    
    // Get total farms
    const farmsResult = await connection.execute(
      `SELECT COUNT(*) AS total_farms, NVL(SUM(area), 0) AS total_area 
       FROM FARM WHERE FARMER_ID = :farmer_id AND status = 'ACTIVE'`,
      { farmer_id: farmerId }
    );

    // Get total crops
    const cropsResult = await connection.execute(
      `SELECT COUNT(*) AS total_crops 
       FROM CROP c 
       JOIN FARM f ON c.farm_id = f.farm_id 
       WHERE f.farmer_id = :farmer_id AND f.status = 'ACTIVE'`,
      { farmer_id: farmerId }
    );

    // Get total revenue
    const revenueResult = await connection.execute(
      `SELECT NVL(SUM(s.total_amount), 0) AS total_revenue 
       FROM SALES s 
       JOIN FARM f ON s.farm_id = f.farm_id 
       WHERE f.farmer_id = :farmer_id AND f.status = 'ACTIVE'`,
      { farmer_id: farmerId }
    );

    // Get monthly revenue for last 6 months
    const monthlyRevenueResult = await connection.execute(
      `SELECT 
        TO_CHAR(s.sale_date, 'Mon') AS month_name,
        TO_CHAR(s.sale_date, 'MM') AS month_num,
        NVL(SUM(s.total_amount), 0) AS revenue
       FROM SALES s
       JOIN FARM f ON s.farm_id = f.farm_id
       WHERE f.farmer_id = :farmer_id 
         AND f.status = 'ACTIVE'
         AND s.sale_date >= ADD_MONTHS(TRUNC(SYSDATE, 'MM'), -5)
       GROUP BY TO_CHAR(s.sale_date, 'Mon'), TO_CHAR(s.sale_date, 'MM'), TO_CHAR(s.sale_date, 'YYYY-MM')
       ORDER BY TO_CHAR(s.sale_date, 'YYYY-MM')`,
      { farmer_id: farmerId }
    );

    // Get crop performance data (by crop name with yield efficiency)
    const cropPerformanceResult = await connection.execute(
      `SELECT 
        c.crop_name,
        COUNT(*) AS crop_count,
        NVL(AVG(c.expected_yield), 0) AS avg_expected_yield,
        NVL(AVG(c.actual_yield), 0) AS avg_actual_yield,
        CASE 
          WHEN NVL(AVG(c.expected_yield), 0) > 0 
          THEN ROUND((NVL(AVG(c.actual_yield), 0) / NVL(AVG(c.expected_yield), 1)) * 100, 0)
          ELSE 0
        END AS performance_percentage
       FROM CROP c
       JOIN FARM f ON c.farm_id = f.farm_id
       WHERE f.farmer_id = :farmer_id AND f.status = 'ACTIVE'
       GROUP BY c.crop_name
       ORDER BY crop_count DESC
       FETCH FIRST 4 ROWS ONLY`,
      { farmer_id: farmerId }
    );

    // Get recent activities - combine crops, sales, and fertilizers
    const recentActivitiesResult = await connection.execute(
      `SELECT * FROM (
        -- Recent crop plantings
        SELECT 
          'crop' AS activity_type,
          c.crop_id AS item_id,
          c.crop_name AS item_name,
          f.farm_name AS farm_name,
          c.sowing_date AS activity_date,
          c.variety AS details
        FROM CROP c
        JOIN FARM f ON c.farm_id = f.farm_id
        WHERE f.farmer_id = :farmer_id AND f.status = 'ACTIVE'
        
        UNION ALL
        
        -- Recent sales
        SELECT 
          'sale' AS activity_type,
          s.sale_id AS item_id,
          cr.crop_name AS item_name,
          s.buyer_name AS farm_name,
          s.sale_date AS activity_date,
          TO_CHAR(s.quantity_sold) || ' ' || s.unit || ' for ₹' || TO_CHAR(s.total_amount) AS details
        FROM SALES s
        JOIN FARM f ON s.farm_id = f.farm_id
        LEFT JOIN CROP cr ON s.crop_id = cr.crop_id
        WHERE f.farmer_id = :farmer_id AND f.status = 'ACTIVE'
        
        UNION ALL
        
        -- Recent fertilizer applications
        SELECT 
          'fertilizer' AS activity_type,
          fer.fertilizer_id AS item_id,
          fer.fertilizer_name AS item_name,
          fa.farm_name AS farm_name,
          fer.applied_date AS activity_date,
          TO_CHAR(fer.quantity_used) || ' ' || fer.unit || ' applied' AS details
        FROM FERTILIZER fer
        JOIN FARM fa ON fer.farm_id = fa.farm_id
        WHERE fa.farmer_id = :farmer_id AND fa.status = 'ACTIVE'
      )
      ORDER BY activity_date DESC
      FETCH FIRST 10 ROWS ONLY`,
      { farmer_id: farmerId }
    );

    res.json({
      total_farms: farmsResult.rows[0].TOTAL_FARMS || 0,
      total_area: farmsResult.rows[0].TOTAL_AREA || 0,
      total_crops: cropsResult.rows[0].TOTAL_CROPS || 0,
      total_revenue: revenueResult.rows[0].TOTAL_REVENUE || 0,
      monthly_revenue: monthlyRevenueResult.rows || [],
      crop_performance: cropPerformanceResult.rows || [],
      recent_activities: recentActivitiesResult.rows || []
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;

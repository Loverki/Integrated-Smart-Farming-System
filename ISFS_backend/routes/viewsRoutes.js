import express from "express";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// GET all views data
router.get("/all", async (req, res) => {
  const farmer_id = parseInt(req.farmer?.farmer_id);

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();

    const views = {
      farmer_dashboard: [],
      farm_performance: [],
      crop_analytics: [],
      monthly_revenue: []
    };

    // Fetch FARMER_DASHBOARD data
    const farmerDashboard = await connection.execute(
      `SELECT 
        f.farmer_id,
        f.name as farmer_name,
        f.phone,
        COUNT(fm.farm_id) as total_farms,
        SUM(fm.area) as total_area,
        COUNT(c.crop_id) as total_crops,
        SUM(CASE WHEN c.crop_status = 'HARVESTED' THEN c.actual_yield ELSE 0 END) as total_yield,
        SUM(s.total_amount) as total_revenue,
        AVG(s.price_per_unit) as avg_selling_price
      FROM FARMER f
      LEFT JOIN FARM fm ON f.farmer_id = fm.farmer_id
      LEFT JOIN CROP c ON fm.farm_id = c.farm_id
      LEFT JOIN SALES s ON fm.farm_id = s.farm_id
      WHERE f.farmer_id = :farmer_id
      GROUP BY f.farmer_id, f.name, f.phone`,
      { farmer_id }
    );
    views.farmer_dashboard = farmerDashboard.rows || [];

    // Fetch FARM_PERFORMANCE data
    const farmPerformance = await connection.execute(
      `SELECT 
        fm.farm_id,
        fm.farm_name,
        f.name AS farmer_name,
        fm.area,
        fm.soil_type,
        COUNT(DISTINCT c.crop_id) AS crops_count,
        SUM(c.expected_yield) AS expected_total_yield,
        SUM(c.actual_yield) AS actual_total_yield,
        ROUND(
          (SUM(c.actual_yield) / NULLIF(SUM(c.expected_yield), 0)) * 100,
          2
        ) AS yield_efficiency,
        SUM(s.total_amount) AS total_revenue,
        SUM(fer.total_cost) AS fertilizer_cost,
        SUM(lw.total_cost) AS labour_cost
      FROM FARM fm
      JOIN FARMER f ON fm.farmer_id = f.farmer_id
      LEFT JOIN CROP c ON fm.farm_id = c.farm_id
      LEFT JOIN SALES s ON fm.farm_id = s.farm_id
      LEFT JOIN FERTILIZER fer ON fm.farm_id = fer.farm_id
      LEFT JOIN LABOURWORK lw ON fm.farm_id = lw.farm_id
      WHERE f.farmer_id = :farmer_id
      GROUP BY fm.farm_id, fm.farm_name, f.name, fm.area, fm.soil_type`,
      { farmer_id }
    );
    views.farm_performance = farmPerformance.rows || [];

    // Fetch CROP_ANALYTICS data
    const cropAnalytics = await connection.execute(
      `SELECT 
        c.crop_name,
        COUNT(*) AS total_crops,
        AVG(c.actual_yield) AS avg_yield,
        MIN(c.actual_yield) AS min_yield,
        MAX(c.actual_yield) AS max_yield,
        AVG(s.price_per_unit) AS avg_price,
        SUM(s.total_amount) AS total_revenue,
        AVG(c.actual_harvest_date - c.sowing_date) AS avg_growth_days
      FROM CROP c
      JOIN FARM fm ON c.farm_id = fm.farm_id
      LEFT JOIN SALES s ON c.crop_id = s.crop_id
      WHERE c.crop_status = 'HARVESTED' AND fm.farmer_id = :farmer_id
      GROUP BY c.crop_name`,
      { farmer_id }
    );
    views.crop_analytics = cropAnalytics.rows || [];

    // Fetch MONTHLY_REVENUE data
    const monthlyRevenue = await connection.execute(
      `SELECT 
        TO_CHAR(s.sale_date, 'YYYY-MM') as month,
        f.name as farmer_name,
        SUM(s.total_amount) as monthly_revenue,
        COUNT(s.sale_id) as sales_count,
        AVG(s.price_per_unit) as avg_price
      FROM SALES s
      JOIN FARM fm ON s.farm_id = fm.farm_id
      JOIN FARMER f ON fm.farmer_id = f.farmer_id
      WHERE f.farmer_id = :farmer_id
      GROUP BY TO_CHAR(s.sale_date, 'YYYY-MM'), f.name
      ORDER BY month DESC`,
      { farmer_id }
    );
    views.monthly_revenue = monthlyRevenue.rows || [];

    res.json(views);
  } catch (err) {
    console.error("Error fetching views:", err);
    res.status(500).json({ message: "Failed to fetch view data", error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET FARMER_DASHBOARD view
router.get("/farmer-dashboard", async (req, res) => {
  const farmer_id = parseInt(req.farmer?.farmer_id);

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT 
        f.farmer_id,
        f.name as farmer_name,
        f.phone,
        COUNT(fm.farm_id) as total_farms,
        SUM(fm.area) as total_area,
        COUNT(c.crop_id) as total_crops,
        SUM(CASE WHEN c.crop_status = 'HARVESTED' THEN c.actual_yield ELSE 0 END) as total_yield,
        SUM(s.total_amount) as total_revenue,
        AVG(s.price_per_unit) as avg_selling_price
      FROM FARMER f
      LEFT JOIN FARM fm ON f.farmer_id = fm.farmer_id
      LEFT JOIN CROP c ON fm.farm_id = c.farm_id
      LEFT JOIN SALES s ON fm.farm_id = s.farm_id
      WHERE f.farmer_id = :farmer_id
      GROUP BY f.farmer_id, f.name, f.phone`,
      { farmer_id }
    );

    res.json(result.rows || []);
  } catch (err) {
    console.error("Error fetching farmer dashboard:", err);
    res.status(500).json({ message: "Failed to fetch farmer dashboard", error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET FARM_PERFORMANCE view
router.get("/farm-performance", async (req, res) => {
  const farmer_id = parseInt(req.farmer?.farmer_id);

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT 
        fm.farm_id,
        fm.farm_name,
        f.name AS farmer_name,
        fm.area,
        fm.soil_type,
        COUNT(DISTINCT c.crop_id) AS crops_count,
        SUM(c.expected_yield) AS expected_total_yield,
        SUM(c.actual_yield) AS actual_total_yield,
        ROUND(
          (SUM(c.actual_yield) / NULLIF(SUM(c.expected_yield), 0)) * 100,
          2
        ) AS yield_efficiency,
        SUM(s.total_amount) AS total_revenue,
        SUM(fer.total_cost) AS fertilizer_cost,
        SUM(lw.total_cost) AS labour_cost
      FROM FARM fm
      JOIN FARMER f ON fm.farmer_id = f.farmer_id
      LEFT JOIN CROP c ON fm.farm_id = c.farm_id
      LEFT JOIN SALES s ON fm.farm_id = s.farm_id
      LEFT JOIN FERTILIZER fer ON fm.farm_id = fer.farm_id
      LEFT JOIN LABOURWORK lw ON fm.farm_id = lw.farm_id
      WHERE f.farmer_id = :farmer_id
      GROUP BY fm.farm_id, fm.farm_name, f.name, fm.area, fm.soil_type`,
      { farmer_id }
    );

    res.json(result.rows || []);
  } catch (err) {
    console.error("Error fetching farm performance:", err);
    res.status(500).json({ message: "Failed to fetch farm performance", error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET CROP_ANALYTICS view
router.get("/crop-analytics", async (req, res) => {
  const farmer_id = parseInt(req.farmer?.farmer_id);

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT 
        c.crop_name,
        COUNT(*) AS total_crops,
        AVG(c.actual_yield) AS avg_yield,
        MIN(c.actual_yield) AS min_yield,
        MAX(c.actual_yield) AS max_yield,
        AVG(s.price_per_unit) AS avg_price,
        SUM(s.total_amount) AS total_revenue,
        AVG(c.actual_harvest_date - c.sowing_date) AS avg_growth_days
      FROM CROP c
      JOIN FARM fm ON c.farm_id = fm.farm_id
      LEFT JOIN SALES s ON c.crop_id = s.crop_id
      WHERE c.crop_status = 'HARVESTED' AND fm.farmer_id = :farmer_id
      GROUP BY c.crop_name`,
      { farmer_id }
    );

    res.json(result.rows || []);
  } catch (err) {
    console.error("Error fetching crop analytics:", err);
    res.status(500).json({ message: "Failed to fetch crop analytics", error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET MONTHLY_REVENUE view
router.get("/monthly-revenue", async (req, res) => {
  const farmer_id = parseInt(req.farmer?.farmer_id);

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT 
        TO_CHAR(s.sale_date, 'YYYY-MM') as month,
        f.name as farmer_name,
        SUM(s.total_amount) as monthly_revenue,
        COUNT(s.sale_id) as sales_count,
        AVG(s.price_per_unit) as avg_price
      FROM SALES s
      JOIN FARM fm ON s.farm_id = fm.farm_id
      JOIN FARMER f ON fm.farmer_id = f.farmer_id
      WHERE f.farmer_id = :farmer_id
      GROUP BY TO_CHAR(s.sale_date, 'YYYY-MM'), f.name
      ORDER BY month DESC`,
      { farmer_id }
    );

    res.json(result.rows || []);
  } catch (err) {
    console.error("Error fetching monthly revenue:", err);
    res.status(500).json({ message: "Failed to fetch monthly revenue", error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;


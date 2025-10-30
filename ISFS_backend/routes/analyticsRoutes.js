import express from "express";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// GET comprehensive financial analytics
router.get("/financial", async (req, res) => {
  const farmer_id = parseInt(req.farmer?.farmer_id);

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();

    // Get total revenue from sales
    const revenueResult = await connection.execute(
      `SELECT NVL(SUM(s.total_amount), 0) as total_revenue
       FROM SALES s
       JOIN FARM f ON s.farm_id = f.farm_id
       WHERE f.farmer_id = :farmer_id`,
      { farmer_id }
    );

    // Get fertilizer costs
    const fertilizerResult = await connection.execute(
      `SELECT NVL(SUM(fer.total_cost), 0) as fertilizer_cost
       FROM FERTILIZER fer
       JOIN FARM f ON fer.farm_id = f.farm_id
       WHERE f.farmer_id = :farmer_id`,
      { farmer_id }
    );

    // Get labour costs
    const labourResult = await connection.execute(
      `SELECT NVL(SUM(lw.total_cost), 0) as labour_cost
       FROM LABOURWORK lw
       JOIN FARM f ON lw.farm_id = f.farm_id
       WHERE f.farmer_id = :farmer_id`,
      { farmer_id }
    );

    // Get equipment investment
    const equipmentResult = await connection.execute(
      `SELECT NVL(SUM(e.purchase_cost), 0) as equipment_investment,
              NVL(SUM(e.current_value), 0) as equipment_current_value
       FROM EQUIPMENT e
       WHERE e.farmer_id = :farmer_id`,
      { farmer_id }
    );

    const totalRevenue = parseFloat(revenueResult.rows[0]?.TOTAL_REVENUE || 0);
    const fertilizerCost = parseFloat(fertilizerResult.rows[0]?.FERTILIZER_COST || 0);
    const labourCost = parseFloat(labourResult.rows[0]?.LABOUR_COST || 0);
    const equipmentInvestment = parseFloat(equipmentResult.rows[0]?.EQUIPMENT_INVESTMENT || 0);
    const equipmentCurrentValue = parseFloat(equipmentResult.rows[0]?.EQUIPMENT_CURRENT_VALUE || 0);

    const totalCosts = fertilizerCost + labourCost;
    const totalInvestment = totalCosts + equipmentInvestment;
    const netProfit = totalRevenue - totalCosts;
    const roi = totalRevenue > 0 ? ((netProfit / totalInvestment) * 100) : 0;

    res.json({
      revenue: {
        total: totalRevenue,
        currency: "USD"
      },
      costs: {
        fertilizer: fertilizerCost,
        labour: labourCost,
        total: totalCosts
      },
      investment: {
        equipment: equipmentInvestment,
        equipment_current_value: equipmentCurrentValue,
        total: totalInvestment
      },
      profit: {
        net: netProfit,
        margin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0,
        roi: roi.toFixed(2)
      }
    });

  } catch (err) {
    console.error("Error fetching financial analytics:", err);
    res.status(500).json({ message: "Failed to fetch financial data", error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET farm performance comparison
router.get("/farm-comparison", async (req, res) => {
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
        fm.area,
        fm.soil_type,
        COUNT(DISTINCT c.crop_id) AS total_crops,
        SUM(c.expected_yield) AS expected_yield,
        SUM(c.actual_yield) AS actual_yield,
        ROUND((SUM(c.actual_yield) / NULLIF(SUM(c.expected_yield), 0)) * 100, 2) AS yield_efficiency,
        SUM(s.total_amount) AS revenue,
        SUM(fer.total_cost) AS fertilizer_cost,
        SUM(lw.total_cost) AS labour_cost,
        (SUM(s.total_amount) - (NVL(SUM(fer.total_cost), 0) + NVL(SUM(lw.total_cost), 0))) AS profit,
        ROUND(SUM(s.total_amount) / NULLIF(fm.area, 0), 2) AS revenue_per_acre
      FROM FARM fm
      LEFT JOIN CROP c ON fm.farm_id = c.farm_id
      LEFT JOIN SALES s ON fm.farm_id = s.farm_id
      LEFT JOIN FERTILIZER fer ON fm.farm_id = fer.farm_id
      LEFT JOIN LABOURWORK lw ON fm.farm_id = lw.farm_id
      WHERE fm.farmer_id = :farmer_id
      GROUP BY fm.farm_id, fm.farm_name, fm.area, fm.soil_type
      ORDER BY profit DESC`,
      { farmer_id }
    );

    // Transform Oracle's uppercase column names to lowercase for frontend
    const farms = result.rows.map(row => ({
      farm_id: row.FARM_ID,
      farm_name: row.FARM_NAME,
      area: parseFloat(row.AREA) || 0,
      soil_type: row.SOIL_TYPE,
      total_crops: parseInt(row.TOTAL_CROPS) || 0,
      expected_yield: parseFloat(row.EXPECTED_YIELD) || 0,
      actual_yield: parseFloat(row.ACTUAL_YIELD) || 0,
      yield_efficiency: parseFloat(row.YIELD_EFFICIENCY) || 0,
      revenue: parseFloat(row.REVENUE) || 0,
      fertilizer_cost: parseFloat(row.FERTILIZER_COST) || 0,
      labour_cost: parseFloat(row.LABOUR_COST) || 0,
      profit: parseFloat(row.PROFIT) || 0,
      revenue_per_acre: parseFloat(row.REVENUE_PER_ACRE) || 0
    }));

    res.json(farms);

  } catch (err) {
    console.error("Error fetching farm comparison:", err);
    res.status(500).json({ message: "Failed to fetch farm comparison", error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;


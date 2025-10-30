import express from "express";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// GET farmer statistics using function logic
router.get("/farmer-stats/:farmerId", async (req, res) => {
  const paramFarmerId = req.params.farmerId;
  const farmer_id = paramFarmerId || req.farmer?.farmer_id;

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();

    // Get farm count
    const farmsResult = await connection.execute(
      `SELECT COUNT(*) as farm_count FROM FARM WHERE farmer_id = :farmer_id`,
      { farmer_id: parseInt(farmer_id) }
    );
    const farmCount = farmsResult.rows[0]?.FARM_COUNT || 0;

    // Get crop count
    const cropsResult = await connection.execute(
      `SELECT COUNT(*) as crop_count
       FROM CROP c
       JOIN FARM f ON c.farm_id = f.farm_id
       WHERE f.farmer_id = :farmer_id`,
      { farmer_id: parseInt(farmer_id) }
    );
    const cropCount = cropsResult.rows[0]?.CROP_COUNT || 0;

    // Get total revenue
    const revenueResult = await connection.execute(
      `SELECT NVL(SUM(s.total_amount), 0) as total_revenue
       FROM SALES s
       JOIN FARM f ON s.farm_id = f.farm_id
       WHERE f.farmer_id = :farmer_id`,
      { farmer_id: parseInt(farmer_id) }
    );
    const totalRevenue = revenueResult.rows[0]?.TOTAL_REVENUE || 0;

    // Get farmer name
    const farmerResult = await connection.execute(
      `SELECT name FROM FARMER WHERE farmer_id = :farmer_id`,
      { farmer_id: parseInt(farmer_id) }
    );
    const farmerName = farmerResult.rows[0]?.NAME || 'Unknown';

    // Format result as string (mimicking the function output)
    const statsString = `Farms: ${farmCount}, Crops: ${cropCount}, Revenue: ₹${parseFloat(totalRevenue).toLocaleString()}`;

    res.json({
      farmer_id: parseInt(farmer_id),
      farmer_name: farmerName,
      stats_string: statsString,
      details: {
        total_farms: parseInt(farmCount),
        total_crops: parseInt(cropCount),
        total_revenue: parseFloat(totalRevenue)
      }
    });

  } catch (err) {
    console.error("Error fetching farmer stats:", err);
    res.status(500).json({ message: "Failed to fetch farmer statistics", error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET farmer statistics for current logged-in farmer (no parameter needed)
router.get("/farmer-stats", async (req, res) => {
  const farmer_id = parseInt(req.farmer?.farmer_id);

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();

    // Get farm count
    const farmsResult = await connection.execute(
      `SELECT COUNT(*) as farm_count FROM FARM WHERE farmer_id = :farmer_id`,
      { farmer_id: parseInt(farmer_id) }
    );
    const farmCount = farmsResult.rows[0]?.FARM_COUNT || 0;

    // Get crop count
    const cropsResult = await connection.execute(
      `SELECT COUNT(*) as crop_count
       FROM CROP c
       JOIN FARM f ON c.farm_id = f.farm_id
       WHERE f.farmer_id = :farmer_id`,
      { farmer_id: parseInt(farmer_id) }
    );
    const cropCount = cropsResult.rows[0]?.CROP_COUNT || 0;

    // Get total revenue
    const revenueResult = await connection.execute(
      `SELECT NVL(SUM(s.total_amount), 0) as total_revenue
       FROM SALES s
       JOIN FARM f ON s.farm_id = f.farm_id
       WHERE f.farmer_id = :farmer_id`,
      { farmer_id: parseInt(farmer_id) }
    );
    const totalRevenue = revenueResult.rows[0]?.TOTAL_REVENUE || 0;

    // Get farmer name
    const farmerResult = await connection.execute(
      `SELECT name FROM FARMER WHERE farmer_id = :farmer_id`,
      { farmer_id: parseInt(farmer_id) }
    );
    const farmerName = farmerResult.rows[0]?.NAME || 'Unknown';

    // Format result as string (mimicking the function output)
    const statsString = `Farms: ${farmCount}, Crops: ${cropCount}, Revenue: ₹${parseFloat(totalRevenue).toLocaleString()}`;

    res.json({
      farmer_id: parseInt(farmer_id),
      farmer_name: farmerName,
      stats_string: statsString,
      details: {
        total_farms: parseInt(farmCount),
        total_crops: parseInt(cropCount),
        total_revenue: parseFloat(totalRevenue)
      }
    });

  } catch (err) {
    console.error("Error fetching farmer stats:", err);
    res.status(500).json({ message: "Failed to fetch farmer statistics", error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;


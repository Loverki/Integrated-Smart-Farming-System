import express from "express";
import { getConnection } from "../database/connection.js";
import oracledb from "oracledb";

const router = express.Router();

// POST - Calculate farm profitability
router.post("/calculate-profitability", async (req, res) => {
  const { farm_id } = req.body;
  const farmer_id = req.farmer?.farmer_id;

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  if (!farm_id) {
    return res.status(400).json({ message: "farm_id is required" });
  }

  let connection;
  try {
    connection = await getConnection();

    // Verify farm belongs to farmer
    const farmCheck = await connection.execute(
      `SELECT farm_id FROM FARM WHERE farm_id = :farm_id AND farmer_id = :farmer_id`,
      { farm_id: parseInt(farm_id), farmer_id }
    );

    if (farmCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid farm_id or does not belong to the farmer" });
    }

    // Calculate revenue
    const revenueResult = await connection.execute(
      `SELECT NVL(SUM(total_amount), 0) as revenue FROM SALES WHERE farm_id = :farm_id`,
      { farm_id: parseInt(farm_id) }
    );
    const revenue = revenueResult.rows[0]?.REVENUE || 0;

    // Calculate costs (fertilizer + labour)
    const costsResult = await connection.execute(
      `SELECT 
        NVL(SUM(f.total_cost), 0) as fertilizer_cost,
        NVL(SUM(l.total_cost), 0) as labour_cost
      FROM FARM fm
      LEFT JOIN FERTILIZER f ON fm.farm_id = f.farm_id
      LEFT JOIN LABOURWORK l ON fm.farm_id = l.farm_id
      WHERE fm.farm_id = :farm_id
      GROUP BY fm.farm_id`,
      { farm_id: parseInt(farm_id) }
    );

    const fertilizerCost = costsResult.rows[0]?.FERTILIZER_COST || 0;
    const labourCost = costsResult.rows[0]?.LABOUR_COST || 0;
    const totalCost = fertilizerCost + labourCost;
    const profit = revenue - totalCost;

    res.json({
      farm_id,
      revenue: parseFloat(revenue),
      costs: {
        fertilizer: parseFloat(fertilizerCost),
        labour: parseFloat(labourCost),
        total: parseFloat(totalCost)
      },
      profit: parseFloat(profit),
      profit_margin: revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0
    });

  } catch (err) {
    console.error("Error calculating profitability:", err);
    res.status(500).json({ message: "Failed to calculate profitability", error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST - Update crop status
router.post("/update-crop-status", async (req, res) => {
  const { crop_id, new_status, actual_yield, actual_harvest_date } = req.body;
  const farmer_id = req.farmer?.farmer_id;

  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  if (!crop_id || !new_status) {
    return res.status(400).json({ message: "crop_id and new_status are required" });
  }

  let connection;
  try {
    connection = await getConnection();

    // Verify crop belongs to farmer
    const cropCheck = await connection.execute(
      `SELECT c.crop_id, c.crop_name, c.crop_status as old_status, c.actual_yield as old_yield
       FROM CROP c
       JOIN FARM f ON c.farm_id = f.farm_id
       WHERE c.crop_id = :crop_id AND f.farmer_id = :farmer_id`,
      { crop_id: parseInt(crop_id), farmer_id }
    );

    if (cropCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid crop_id or does not belong to the farmer" });
    }

    const oldData = cropCheck.rows[0];

    // Build update query
    let updateQuery = `UPDATE CROP SET crop_status = :new_status`;
    const binds = {
      new_status,
      crop_id: parseInt(crop_id)
    };

    if (actual_yield !== undefined && actual_yield !== null && actual_yield !== '') {
      updateQuery += `, actual_yield = :actual_yield`;
      binds.actual_yield = parseFloat(actual_yield);
    }

    if (actual_harvest_date) {
      updateQuery += `, actual_harvest_date = TO_DATE(:actual_harvest_date, 'YYYY-MM-DD')`;
      binds.actual_harvest_date = actual_harvest_date;
    }

    updateQuery += ` WHERE crop_id = :crop_id`;

    await connection.execute(updateQuery, binds, { autoCommit: true });

    // Fetch updated data
    const updatedCrop = await connection.execute(
      `SELECT crop_id, crop_name, crop_status, actual_yield, actual_harvest_date
       FROM CROP WHERE crop_id = :crop_id`,
      { crop_id: parseInt(crop_id) }
    );

    res.json({
      message: "Crop status updated successfully",
      before: {
        status: oldData.OLD_STATUS,
        yield: oldData.OLD_YIELD
      },
      after: updatedCrop.rows[0]
    });

  } catch (err) {
    console.error("Error updating crop status:", err);
    res.status(500).json({ message: "Failed to update crop status", error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;


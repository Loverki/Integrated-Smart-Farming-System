import express from "express";
import { getConnection } from "../database/connection.js";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

/**
 * Reset a specific sequence based on current table data
 * POST /api/sequences/reset/:sequenceName
 */
router.post("/reset/:sequenceName", protectAdmin, async (req, res) => {
  const { sequenceName } = req.params;
  
  // Validate sequence name
  const validSequences = [
    'FARMER_SEQ', 'FARM_SEQ', 'CROP_SEQ', 'LABOUR_SEQ', 
    'SALES_SEQ', 'EQUIPMENT_SEQ', 'FERTILIZER_SEQ', 'LABOUR_WORK_SEQ'
  ];
  
  const upperSequenceName = sequenceName.toUpperCase();
  
  if (!validSequences.includes(upperSequenceName)) {
    return res.status(400).json({ 
      success: false,
      message: "Invalid sequence name",
      validSequences 
    });
  }

  let connection;
  try {
    connection = await getConnection();
    
    // Call the stored procedure
    await connection.execute(
      `BEGIN RESET_SEQUENCE(:seq_name); END;`,
      { seq_name: upperSequenceName }
    );
    
    await connection.commit();
    
    // Get the new sequence value
    const result = await connection.execute(
      `SELECT ${upperSequenceName}.NEXTVAL AS NEXT_VALUE FROM DUAL`
    );
    
    const nextValue = result.rows[0][0];
    
    // Reset it back by calling NEXTVAL - 1 times
    await connection.execute(
      `SELECT ${upperSequenceName}.NEXTVAL FROM DUAL`
    );

    res.json({
      success: true,
      message: `${upperSequenceName} reset successfully`,
      sequenceName: upperSequenceName,
      nextValue: nextValue
    });
    
  } catch (error) {
    console.error(`Error resetting sequence ${upperSequenceName}:`, error);
    res.status(500).json({ 
      success: false,
      message: "Failed to reset sequence",
      error: error.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

/**
 * Reset all sequences
 * POST /api/sequences/reset-all
 */
router.post("/reset-all", protectAdmin, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    
    console.log("🔄 Resetting all sequences...");
    
    // Call the stored procedure to reset all sequences
    await connection.execute(`BEGIN RESET_ALL_SEQUENCES; END;`);
    await connection.commit();
    
    // Get current sequence status
    const statusResult = await connection.execute(`
      SELECT 
        'FARMER' AS TABLE_NAME,
        NVL(MAX(farmer_id), 0) AS CURRENT_MAX_ID,
        NVL(MAX(farmer_id), 0) + 1 AS NEXT_SEQ_VALUE
      FROM FARMER
      UNION ALL
      SELECT 'FARM', NVL(MAX(farm_id), 0), NVL(MAX(farm_id), 0) + 1 FROM FARM
      UNION ALL
      SELECT 'CROP', NVL(MAX(crop_id), 0), NVL(MAX(crop_id), 0) + 1 FROM CROP
      UNION ALL
      SELECT 'LABOUR', NVL(MAX(labour_id), 0), NVL(MAX(labour_id), 0) + 1 FROM LABOUR
      UNION ALL
      SELECT 'SALES', NVL(MAX(sale_id), 0), NVL(MAX(sale_id), 0) + 1 FROM SALES
      UNION ALL
      SELECT 'EQUIPMENT', NVL(MAX(equipment_id), 0), NVL(MAX(equipment_id), 0) + 1 FROM EQUIPMENT
    `);
    
    const sequenceStatus = statusResult.rows.map(row => ({
      tableName: row[0],
      currentMaxId: row[1],
      nextSequenceValue: row[2]
    }));
    
    console.log("✅ All sequences reset successfully");
    
    res.json({
      success: true,
      message: "All sequences reset successfully",
      sequenceStatus
    });
    
  } catch (error) {
    console.error("Error resetting all sequences:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to reset sequences",
      error: error.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

/**
 * Get sequence status for all tables
 * GET /api/sequences/status
 */
router.get("/status", protectAdmin, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    
    const result = await connection.execute(`
      SELECT 
        'FARMER' AS TABLE_NAME,
        'FARMER_SEQ' AS SEQUENCE_NAME,
        (SELECT COUNT(*) FROM FARMER) AS RECORD_COUNT,
        NVL(MAX(farmer_id), 0) AS MAX_ID
      FROM FARMER
      UNION ALL
      SELECT 'FARM', 'FARM_SEQ', (SELECT COUNT(*) FROM FARM), NVL(MAX(farm_id), 0) FROM FARM
      UNION ALL
      SELECT 'CROP', 'CROP_SEQ', (SELECT COUNT(*) FROM CROP), NVL(MAX(crop_id), 0) FROM CROP
      UNION ALL
      SELECT 'LABOUR', 'LABOUR_SEQ', (SELECT COUNT(*) FROM LABOUR), NVL(MAX(labour_id), 0) FROM LABOUR
      UNION ALL
      SELECT 'SALES', 'SALES_SEQ', (SELECT COUNT(*) FROM SALES), NVL(MAX(sale_id), 0) FROM SALES
      UNION ALL
      SELECT 'EQUIPMENT', 'EQUIPMENT_SEQ', (SELECT COUNT(*) FROM EQUIPMENT), NVL(MAX(equipment_id), 0) FROM EQUIPMENT
    `);
    
    const status = result.rows.map(row => ({
      tableName: row[0],
      sequenceName: row[1],
      recordCount: row[2],
      maxId: row[3],
      nextShouldBe: row[3] + 1,
      needsReset: row[3] === 0 && row[2] === 0 // If no records, sequence should start at 1
    }));
    
    res.json({
      success: true,
      sequences: status,
      message: "Sequence status retrieved successfully"
    });
    
  } catch (error) {
    console.error("Error getting sequence status:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get sequence status",
      error: error.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

/**
 * Auto-reset farmer sequence before registration
 * This ensures the next farmer gets the correct ID
 * POST /api/sequences/auto-reset-farmer
 */
router.post("/auto-reset-farmer", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    
    // Get current farmer count and max ID
    const result = await connection.execute(`
      SELECT 
        COUNT(*) AS FARMER_COUNT,
        NVL(MAX(farmer_id), 0) AS MAX_FARMER_ID
      FROM FARMER
    `);
    
    const farmerCount = result.rows[0][0];
    const maxFarmerId = result.rows[0][1];
    
    // Reset the sequence
    await connection.execute(`BEGIN RESET_SEQUENCE('FARMER_SEQ'); END;`);
    await connection.commit();
    
    res.json({
      success: true,
      message: "Farmer sequence reset automatically",
      farmerCount,
      maxFarmerId,
      nextFarmerId: maxFarmerId + 1
    });
    
  } catch (error) {
    console.error("Error auto-resetting farmer sequence:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to auto-reset farmer sequence",
      error: error.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;


import express from "express";
import { getConnection } from "../database/connection.js";

const router = express.Router();

// GET all crops for the logged-in farmer
router.get("/", async (req, res) => {
  const farmer_id = req.farmer?.farmer_id;
  
  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  let connection;
  try {
    connection = await getConnection();
    
    // Get crops for the specific farmer
    const result = await connection.execute(`
      SELECT 
        c.crop_id,
        c.farm_id,
        c.crop_name,
        c.variety,
        c.sowing_date,
        c.expected_harvest_date,
        c.actual_harvest_date,
        c.expected_yield,
        c.actual_yield,
        c.crop_status,
        c.seed_quantity,
        c.planting_density,
        c.growth_stage,
        c.notes,
        f.farm_name,
        f.location as farm_location
      FROM CROP c
      JOIN FARM f ON c.farm_id = f.farm_id
      WHERE f.farmer_id = :farmer_id
      ORDER BY c.sowing_date DESC
    `, { farmer_id });
    
    console.log(`✅ Retrieved ${result.rows.length} crops for farmer ${farmer_id}`);
    res.json(result.rows);
  } catch (err) {
    console.error("Get crops error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST a new crop
router.post("/", async (req, res) => {
  const { 
    farm_id, 
    crop_name, 
    variety, 
    sowing_date, 
    expected_harvest_date, 
    expected_yield, 
    seed_quantity, 
    planting_density, 
    growth_stage, 
    notes 
  } = req.body;
  
  const farmer_id = req.farmer?.farmer_id;
  
  if (!farmer_id) {
    return res.status(401).json({ message: "Unauthorized - farmer not found" });
  }

  // Validate required fields
  if (!farm_id || !crop_name || !sowing_date) {
    return res.status(400).json({ message: "Missing required fields: farm_id, crop_name, and sowing_date are required" });
  }

  let connection;
  try {
    connection = await getConnection();
    
    console.log("=== CROP INSERTION DEBUG ===");
    console.log("Farmer ID:", farmer_id);
    console.log("Farm ID:", farm_id);
    console.log("Crop Name:", crop_name);
    console.log("Sowing Date:", sowing_date);
    
    // First, let's check if the farm exists and belongs to the farmer
    const farmCheck = await connection.execute(
      `SELECT farm_id FROM FARM WHERE farm_id = :farm_id AND farmer_id = :farmer_id`,
      { farm_id: parseInt(farm_id), farmer_id }
    );
    
    if (farmCheck.rows.length === 0) {
      throw new Error(`Farm ${farm_id} does not exist or does not belong to farmer ${farmer_id}`);
    }
    
    console.log("✅ Farm validation passed");
    
    // Check if CROP_SEQ exists
    try {
      const seqCheck = await connection.execute(`SELECT CROP_SEQ.NEXTVAL FROM DUAL`);
      console.log("✅ CROP_SEQ sequence exists");
    } catch (seqErr) {
      console.error("❌ CROP_SEQ sequence error:", seqErr.message);
      throw new Error("CROP_SEQ sequence does not exist. Please create it first.");
    }
    
    // Now try the simplest possible insert
    const result = await connection.execute(
      `INSERT INTO CROP(crop_id, farm_id, crop_name, sowing_date) 
       VALUES(CROP_SEQ.NEXTVAL, :farm_id, :crop_name, TO_DATE(:sowing_date, 'YYYY-MM-DD'))`,
      { 
        farm_id: parseInt(farm_id),
        crop_name: crop_name.trim(),
        sowing_date
      },
      { autoCommit: true }
    );
    
    console.log(`✅ Basic crop added successfully for farmer ${farmer_id}: ${crop_name}`);
    
    // Get the crop_id that was just inserted
    const cropIdResult = await connection.execute(`SELECT CROP_SEQ.CURRVAL FROM DUAL`);
    const cropId = cropIdResult.rows[0].CURRVAL;
    
    console.log("Inserted crop_id:", cropId);
    
    // Now try to update with additional fields one by one
    if (variety) {
      await connection.execute(
        `UPDATE CROP SET variety = :variety WHERE crop_id = :crop_id`,
        { variety, crop_id },
        { autoCommit: true }
      );
      console.log("✅ Variety updated");
    }
    
    if (expected_harvest_date) {
      await connection.execute(
        `UPDATE CROP SET expected_harvest_date = TO_DATE(:expected_harvest_date, 'YYYY-MM-DD') WHERE crop_id = :crop_id`,
        { expected_harvest_date, crop_id },
        { autoCommit: true }
      );
      console.log("✅ Expected harvest date updated");
    }
    
    if (expected_yield) {
      await connection.execute(
        `UPDATE CROP SET expected_yield = :expected_yield WHERE crop_id = :crop_id`,
        { expected_yield: parseFloat(expected_yield), crop_id },
        { autoCommit: true }
      );
      console.log("✅ Expected yield updated");
    }
    
    if (seed_quantity) {
      await connection.execute(
        `UPDATE CROP SET seed_quantity = :seed_quantity WHERE crop_id = :crop_id`,
        { seed_quantity: parseFloat(seed_quantity), crop_id },
        { autoCommit: true }
      );
      console.log("✅ Seed quantity updated");
    }
    
    if (planting_density) {
      await connection.execute(
        `UPDATE CROP SET planting_density = :planting_density WHERE crop_id = :crop_id`,
        { planting_density: parseFloat(planting_density), crop_id },
        { autoCommit: true }
      );
      console.log("✅ Planting density updated");
    }
    
    if (growth_stage) {
      await connection.execute(
        `UPDATE CROP SET growth_stage = :growth_stage WHERE crop_id = :crop_id`,
        { growth_stage, crop_id },
        { autoCommit: true }
      );
      console.log("✅ Growth stage updated");
    }
    
    if (notes) {
      await connection.execute(
        `UPDATE CROP SET notes = :notes WHERE crop_id = :crop_id`,
        { notes, crop_id },
        { autoCommit: true }
      );
      console.log("✅ Notes updated");
    }
    
    res.json({ 
      message: "Crop added successfully",
      crop_name: crop_name,
      farm_id: farm_id,
      crop_id: cropId
    });
  } catch (err) {
    console.error("=== CROP INSERTION ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Error number:", err.errorNum);
    console.error("Error offset:", err.offset);
    console.error("Stack trace:", err.stack);
    
    res.status(500).json({ 
      error: err.message,
      message: "Failed to add crop. Please check your input and try again.",
      details: err.message,
      code: err.code,
      errorNum: err.errorNum
    });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;

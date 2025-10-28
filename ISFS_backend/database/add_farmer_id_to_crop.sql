-- ============================================================================
-- MIGRATION SCRIPT: Add farmer_id to CROP table
-- ============================================================================
-- Purpose: Add farmer_id column to existing CROP table for better query performance
-- Date: October 28, 2025
-- ============================================================================

-- Step 1: Add the farmer_id column to CROP table
ALTER TABLE CROP ADD (farmer_id NUMBER);

-- Step 2: Populate farmer_id for existing crops (if any)
UPDATE CROP c
SET c.farmer_id = (
    SELECT f.farmer_id 
    FROM FARM f 
    WHERE f.farm_id = c.farm_id
)
WHERE c.farmer_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE CROP ADD CONSTRAINT fk_crop_farmer 
    FOREIGN KEY (farmer_id) REFERENCES FARMER(farmer_id) ON DELETE CASCADE;

-- Step 4: Create index for better query performance
CREATE INDEX idx_crop_farmer_id ON CROP(farmer_id);

-- Step 5: Create trigger to auto-populate farmer_id on new crop inserts
CREATE OR REPLACE TRIGGER TRG_CROP_FARMER_ID
BEFORE INSERT ON CROP
FOR EACH ROW
DECLARE
    v_farmer_id NUMBER;
BEGIN
    -- Only set farmer_id if not already provided
    IF :NEW.farmer_id IS NULL THEN
        -- Get farmer_id from the farm table
        SELECT farmer_id INTO v_farmer_id
        FROM FARM
        WHERE farm_id = :NEW.farm_id;
        
        -- Set the farmer_id in the new crop record
        :NEW.farmer_id := v_farmer_id;
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20001, 'Invalid farm_id: Farm does not exist');
END;
/

-- Step 6: Verify the changes
SELECT 'farmer_id column added successfully!' as STATUS FROM dual;

-- Show crops with farmer_id
SELECT 
    c.crop_id,
    c.crop_name,
    c.farmer_id,
    f.name as farmer_name,
    c.farm_id,
    fm.farm_name
FROM CROP c
LEFT JOIN FARMER f ON c.farmer_id = f.farmer_id
LEFT JOIN FARM fm ON c.farm_id = fm.farm_id
ORDER BY c.crop_id;

COMMIT;

-- ============================================================================
-- Migration complete!
-- ============================================================================


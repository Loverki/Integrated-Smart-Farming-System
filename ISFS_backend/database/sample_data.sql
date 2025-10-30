CREATE SEQUENCE FARMER_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE FARM_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE CROP_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE LABOUR_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SALES_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE FERTILIZER_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE ADMIN_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE WEATHER_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE EQUIPMENT_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE MAINTENANCE_SEQ START WITH 1 INCREMENT BY 1;



-- 1. FARMER TABLE (Enhanced)
CREATE TABLE FARMER (
    farmer_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    phone VARCHAR2(15) UNIQUE NOT NULL,
    email VARCHAR2(100) UNIQUE,
    address VARCHAR2(200),
    password VARCHAR2(255) NOT NULL,
    reg_date DATE DEFAULT SYSDATE,
    status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    total_farms NUMBER DEFAULT 0,
    total_area NUMBER DEFAULT 0
);

-- 2. ADMIN TABLE (New)
CREATE TABLE ADMIN (
    admin_id NUMBER PRIMARY KEY,
    username VARCHAR2(50) UNIQUE NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    password VARCHAR2(255) NOT NULL,
    full_name VARCHAR2(100) NOT NULL,
    role VARCHAR2(30) DEFAULT 'ADMIN' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')),
    created_date DATE DEFAULT SYSDATE,
    last_login DATE,
    status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 3. FARM TABLE (Enhanced)
CREATE TABLE FARM (
    farm_id NUMBER PRIMARY KEY,
    farmer_id NUMBER REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
    farm_name VARCHAR2(100) NOT NULL,
    location VARCHAR2(100),
    area NUMBER NOT NULL CHECK (area > 0),
    soil_type VARCHAR2(50),
    soil_ph NUMBER(3,1) CHECK (soil_ph BETWEEN 0 AND 14),
    irrigation_type VARCHAR2(50),
    farm_type VARCHAR2(30) CHECK (farm_type IN ('ORGANIC', 'CONVENTIONAL', 'HYBRID')),
    created_date DATE DEFAULT SYSDATE,
    status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE'))
);

-- 4. WEATHER DATA TABLE (New)
CREATE TABLE WEATHER_DATA (
    weather_id NUMBER PRIMARY KEY,
    farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    temperature NUMBER(5,2),
    humidity NUMBER(5,2),
    rainfall NUMBER(8,2),
    wind_speed NUMBER(5,2),
    pressure NUMBER(8,2),
    weather_condition VARCHAR2(50),
    recorded_by VARCHAR2(50)
);


-- 6. CROP TABLE (Enhanced)
CREATE TABLE CROP (
    crop_id NUMBER PRIMARY KEY,
    farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
    crop_name VARCHAR2(50) NOT NULL,
    variety VARCHAR2(50),
    sowing_date DATE,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    expected_yield NUMBER,
    actual_yield NUMBER,
    crop_status VARCHAR2(20) DEFAULT 'PLANTED' CHECK (crop_status IN ('PLANTED', 'GROWING', 'MATURE', 'HARVESTED', 'DAMAGED')),
    seed_quantity NUMBER,
    planting_density NUMBER,
    growth_stage VARCHAR2(30),
    notes CLOB
);

-- 7. LABOUR TABLE (Enhanced)
CREATE TABLE LABOUR (
    labour_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    phone VARCHAR2(15),
    email VARCHAR2(100),
    skill VARCHAR2(50),
    hourly_rate NUMBER(8,2),
    address VARCHAR2(200),
    hire_date DATE DEFAULT SYSDATE,
    status VARCHAR2(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BUSY', 'UNAVAILABLE'))
);

-- 8. LABOUR WORK TABLE (Enhanced)
CREATE TABLE LABOURWORK (
    work_id NUMBER PRIMARY KEY,
    labour_id NUMBER REFERENCES LABOUR(labour_id),
    farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
    work_type VARCHAR2(50),
    work_date DATE NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    hours_worked NUMBER(5,2),
    hourly_rate NUMBER(8,2),
    total_cost NUMBER(10,2),
    work_description CLOB,
    status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    created_date DATE DEFAULT SYSDATE
);

-- 9. EQUIPMENT TABLE (New)
CREATE TABLE EQUIPMENT (
    equipment_id NUMBER PRIMARY KEY,
    farmer_id NUMBER REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
    equipment_name VARCHAR2(100) NOT NULL,
    equipment_type VARCHAR2(50),
    brand VARCHAR2(50),
    model VARCHAR2(50),
    purchase_date DATE,
    purchase_cost NUMBER(10,2),
    current_value NUMBER(10,2),
    status VARCHAR2(20) DEFAULT 'OPERATIONAL' CHECK (status IN ('OPERATIONAL', 'MAINTENANCE', 'REPAIR', 'RETIRED')),
    last_maintenance_date DATE,
    next_maintenance_date DATE
);




-- 11. FERTILIZER TABLE (Enhanced)
CREATE TABLE FERTILIZER (
    fertilizer_id NUMBER PRIMARY KEY,
    farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
    fertilizer_name VARCHAR2(50) NOT NULL,
    fertilizer_type VARCHAR2(30) CHECK (fertilizer_type IN ('ORGANIC', 'INORGANIC', 'BIO_FERTILIZER')),
    quantity_used NUMBER(8,2),
    unit VARCHAR2(20) DEFAULT 'KG',
    applied_date DATE NOT NULL,
    cost_per_unit NUMBER(8,2),
    total_cost NUMBER(10,2),
    applied_by VARCHAR2(100),
    crop_id NUMBER REFERENCES CROP(crop_id),
    application_method VARCHAR2(50),
    effectiveness_rating NUMBER(1) CHECK (effectiveness_rating BETWEEN 1 AND 5)
);


CREATE TABLE SALES (
    sale_id NUMBER PRIMARY KEY,
    farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
    crop_id NUMBER REFERENCES CROP(crop_id),
    buyer_name VARCHAR2(100),
    buyer_contact VARCHAR2(50),
    quantity_sold NUMBER(8,2),
    unit VARCHAR2(20) DEFAULT 'KG',
    price_per_unit NUMBER(10,2),
    total_amount NUMBER(12,2),
    sale_date DATE NOT NULL,
    payment_method VARCHAR2(30) CHECK (payment_method IN ('CASH', 'CHEQUE', 'BANK_TRANSFER', 'CREDIT')),
    payment_status VARCHAR2(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'PARTIAL', 'OVERDUE')),
    invoice_number VARCHAR2(50),
    notes CLOB
);

-- Create Indexes for better performance
CREATE INDEX idx_farmer_phone ON FARMER(phone);
CREATE INDEX idx_farm_farmer_id ON FARM(farmer_id);
CREATE INDEX idx_crop_farm_id ON CROP(farm_id);
CREATE INDEX idx_sales_farm_id ON SALES(farm_id);
CREATE INDEX idx_weather_farm_date ON WEATHER_DATA(farm_id, recorded_date);


GRANT ALL PRIVILEGES ON FARMER TO PUBLIC;
GRANT ALL PRIVILEGES ON FARM TO PUBLIC;
GRANT ALL PRIVILEGES ON CROP TO PUBLIC;
GRANT ALL PRIVILEGES ON SALES TO PUBLIC;
GRANT ALL PRIVILEGES ON LABOUR TO PUBLIC;
GRANT ALL PRIVILEGES ON LABOURWORK TO PUBLIC;
GRANT ALL PRIVILEGES ON FERTILIZER TO PUBLIC;
GRANT ALL PRIVILEGES ON ADMIN TO PUBLIC;
GRANT ALL PRIVILEGES ON WEATHER_DATA TO PUBLIC;
GRANT ALL PRIVILEGES ON EQUIPMENT TO PUBLIC;
GRANT ALL PRIVILEGES ON EQUIPMENT_MAINTENANCE TO PUBLIC;






-- Create Views for Analytics

-- 1. Farmer Dashboard View
CREATE OR REPLACE VIEW FARMER_DASHBOARD AS
SELECT 
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
GROUP BY f.farmer_id, f.name, f.phone;

-- 2. Farm Performance View
CREATE OR REPLACE VIEW FARM_PERFORMANCE AS
SELECT 
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
JOIN FARMER f 
    ON fm.farmer_id = f.farmer_id
LEFT JOIN CROP c 
    ON fm.farm_id = c.farm_id
LEFT JOIN SALES s 
    ON fm.farm_id = s.farm_id
LEFT JOIN FERTILIZER fer 
    ON fm.farm_id = fer.farm_id
LEFT JOIN LABOURWORK lw 
    ON fm.farm_id = lw.farm_id
GROUP BY 
    fm.farm_id, 
    fm.farm_name, 
    f.name, 
    fm.area, 
    fm.soil_type;

-- 3. Crop Analytics View
CREATE OR REPLACE VIEW CROP_ANALYTICS AS
SELECT 
    c.crop_name,
    COUNT(*) AS total_crops,
    AVG(c.actual_yield) AS avg_yield,
    MIN(c.actual_yield) AS min_yield,
    MAX(c.actual_yield) AS max_yield,
    AVG(s.price_per_unit) AS avg_price,
    SUM(s.total_amount) AS total_revenue,
    AVG(c.actual_harvest_date - c.sowing_date) AS avg_growth_days
FROM CROP c
LEFT JOIN SALES s 
    ON c.crop_id = s.crop_id
WHERE c.crop_status = 'HARVESTED'
GROUP BY c.crop_name;

-- 4. Monthly Revenue View
CREATE OR REPLACE VIEW MONTHLY_REVENUE AS
SELECT 
    TO_CHAR(s.sale_date, 'YYYY-MM') as month,
    f.name as farmer_name,
    SUM(s.total_amount) as monthly_revenue,
    COUNT(s.sale_id) as sales_count,
    AVG(s.price_per_unit) as avg_price
FROM SALES s
JOIN FARM fm ON s.farm_id = fm.farm_id
JOIN FARMER f ON fm.farmer_id = f.farmer_id
GROUP BY TO_CHAR(s.sale_date, 'YYYY-MM'), f.name
ORDER BY month DESC;

-- 5. Cost Analysis View
CREATE OR REPLACE VIEW CROP_ANALYTICS AS
SELECT 
    c.crop_name,
    COUNT(*) AS total_crops,
    AVG(c.actual_yield) AS avg_yield,
    MIN(c.actual_yield) AS min_yield,
    MAX(c.actual_yield) AS max_yield,
    AVG(s.price_per_unit) AS avg_price,
    SUM(s.total_amount) AS total_revenue,
    AVG(c.actual_harvest_date - c.sowing_date) AS avg_growth_days
FROM CROP c
LEFT JOIN SALES s ON c.crop_id = s.crop_id
WHERE c.crop_status = 'HARVESTED'
GROUP BY c.crop_name;


-- Insert Sample Data

-- Insert Admi

-- Create Stored Procedures

-- 1. Procedure to calculate farm profitability
CREATE OR REPLACE PROCEDURE CALCULATE_FARM_PROFITABILITY(
    p_farm_id IN NUMBER,
    p_profit OUT NUMBER,
    p_revenue OUT NUMBER,
    p_cost OUT NUMBER
) AS
BEGIN
    -- Calculate total revenue
    SELECT NVL(SUM(total_amount), 0) 
    INTO p_revenue
    FROM SALES
    WHERE farm_id = p_farm_id;
    
    -- Calculate total costs
    SELECT NVL(SUM(total_cost), 0)
    INTO p_cost
    FROM (
        SELECT total_cost FROM FERTILIZER WHERE farm_id = p_farm_id
        UNION ALL
        SELECT total_cost FROM LABOURWORK WHERE farm_id = p_farm_id
    );
    
    -- Calculate profit
    p_profit := p_revenue - p_cost;
END;
/

    
    -- Calculate profit
    p_profit := p_revenue - p_cost;
END;
/

-- 2. Procedure to update crop status
CREATE OR REPLACE PROCEDURE UPDATE_CROP_STATUS(
    p_crop_id IN NUMBER,
    p_new_status IN VARCHAR2,
    p_actual_yield IN NUMBER DEFAULT NULL,
    p_actual_harvest_date IN DATE DEFAULT NULL
) AS
BEGIN
    UPDATE CROP
    SET crop_status = p_new_status,
        actual_yield = NVL(p_actual_yield, actual_yield),
        actual_harvest_date = NVL(p_actual_harvest_date, actual_harvest_date)
    WHERE crop_id = p_crop_id;
    
    COMMIT;
END;
/

-- 3. Function to get farmer statistics
CREATE OR REPLACE FUNCTION GET_FARMER_STATS(p_farmer_id IN NUMBER)
RETURN VARCHAR2 AS
    v_stats VARCHAR2(1000);
    v_farms NUMBER;
    v_crops NUMBER;
    v_revenue NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_farms FROM FARM WHERE farmer_id = p_farmer_id;
    
    SELECT COUNT(*) INTO v_crops 
    FROM CROP c 
    JOIN FARM f ON c.farm_id = f.farm_id 
    WHERE f.farmer_id = p_farmer_id;
    
    SELECT NVL(SUM(s.total_amount), 0) INTO v_revenue
    FROM SALES s
    JOIN FARM f ON s.farm_id = f.farm_id
    WHERE f.farmer_id = p_farmer_id;
    
    v_stats := 'Farms: ' || v_farms || ', Crops: ' || v_crops || ', Revenue: ₹' || v_revenue;
    
    RETURN v_stats;
END;
/

-- Create Triggers

-- 1. Trigger to update farmer statistics
CREATE OR REPLACE TRIGGER UPDATE_FARMER_STATS
AFTER INSERT OR UPDATE OR DELETE ON FARM
FOR EACH ROW
BEGIN
    IF INSERTING OR UPDATING THEN
        UPDATE FARMER
        SET total_farms = (
            SELECT COUNT(*) FROM FARM WHERE farmer_id = :NEW.farmer_id
        ),
        total_area = (
            SELECT NVL(SUM(area), 0) FROM FARM WHERE farmer_id = :NEW.farmer_id
        )
        WHERE farmer_id = :NEW.farmer_id;
    ELSIF DELETING THEN
        UPDATE FARMER
        SET total_farms = (
            SELECT COUNT(*) FROM FARM WHERE farmer_id = :OLD.farmer_id
        ),
        total_area = (
            SELECT NVL(SUM(area), 0) FROM FARM WHERE farmer_id = :OLD.farmer_id
        )
        WHERE farmer_id = :OLD.farmer_id;
    END IF;
END;
/

-- 2. Trigger to log farm activities
CREATE OR REPLACE TRIGGER LOG_FARM_ACTIVITY
AFTER INSERT OR UPDATE OR DELETE ON CROP
FOR EACH ROW
DECLARE
    v_farmer_id NUMBER;
BEGIN
    SELECT farmer_id INTO v_farmer_id
    FROM FARM
    WHERE farm_id = :NEW.farm_id OR farm_id = :OLD.farm_id;
    
    -- You can create an activity log table to store these activities
    -- For now, we'll just demonstrate the concept
    DBMS_OUTPUT.PUT_LINE('Farm activity logged for farmer: ' || v_farmer_id);
END;
/

-- Grant permissions
COMMIT;

SELECT * FROM FARM;






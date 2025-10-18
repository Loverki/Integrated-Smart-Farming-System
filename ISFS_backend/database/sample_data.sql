-- Comprehensive Sample Data for Smart Farming System
-- This script populates all tables with realistic sample data for testing

-- Clear existing data (optional - uncomment if you want to start fresh)
-- DELETE FROM SALES;
-- DELETE FROM PESTICIDE;
-- DELETE FROM IRRIGATION;
-- DELETE FROM CROP_DISEASES;
-- DELETE FROM EQUIPMENT_MAINTENANCE;
-- DELETE FROM EQUIPMENT;
-- DELETE FROM FERTILIZER;
-- DELETE FROM LABOURWORK;
-- DELETE FROM SOIL_ANALYSIS;
-- DELETE FROM WEATHER_DATA;
-- DELETE FROM CROP;
-- DELETE FROM FARM;
-- DELETE FROM LABOUR;
-- DELETE FROM FARMER;
-- DELETE FROM ADMIN;

-- Reset sequences to start from 1
-- ALTER SEQUENCE FARMER_SEQ RESTART START WITH 1;
-- ALTER SEQUENCE FARM_SEQ RESTART START WITH 1;
-- ALTER SEQUENCE CROP_SEQ RESTART START WITH 1;
-- ALTER SEQUENCE LABOUR_SEQ RESTART START WITH 1;
-- ALTER SEQUENCE SALES_SEQ RESTART START WITH 1;
-- ALTER SEQUENCE FERTILIZER_SEQ RESTART START WITH 1;
-- ALTER SEQUENCE ADMIN_SEQ RESTART START WITH 1;
-- ALTER SEQUENCE WEATHER_SEQ RESTART START WITH 1;
-- ALTER SEQUENCE SOIL_SEQ RESTART START WITH 1;
-- ALTER SEQUENCE EQUIPMENT_SEQ RESTART START WITH 1;
-- ALTER SEQUENCE MAINTENANCE_SEQ RESTART START WITH 1;
-- ALTER SEQUENCE PESTICIDE_SEQ RESTART START WITH 1;
-- ALTER SEQUENCE IRRIGATION_SEQ RESTART START WITH 1;
-- ALTER SEQUENCE DISEASE_SEQ RESTART START WITH 1;

-- Insert Admin Users
INSERT INTO ADMIN (admin_id, username, email, password, full_name, role, created_date, status) VALUES
(ADMIN_SEQ.NEXTVAL, 'admin', 'admin@smartfarming.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'SUPER_ADMIN', SYSDATE - 365, 'ACTIVE');

INSERT INTO ADMIN (admin_id, username, email, password, full_name, role, created_date, status) VALUES
(ADMIN_SEQ.NEXTVAL, 'manager1', 'manager@smartfarming.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Farm Manager', 'MANAGER', SYSDATE - 300, 'ACTIVE');

INSERT INTO ADMIN (admin_id, username, email, password, full_name, role, created_date, status) VALUES
(ADMIN_SEQ.NEXTVAL, 'admin2', 'admin2@smartfarming.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Assistant Administrator', 'ADMIN', SYSDATE - 200, 'ACTIVE');

-- Insert Farmers
INSERT INTO FARMER (farmer_id, name, phone, email, address, password, reg_date, status, total_farms, total_area) VALUES
(FARMER_SEQ.NEXTVAL, 'Rajesh Kumar', '9876543210', 'rajesh@example.com', 'Village Mahua, District Patna, Bihar', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', DATE '2024-01-15', 'ACTIVE', 0, 0);

INSERT INTO FARMER (farmer_id, name, phone, email, address, password, reg_date, status, total_farms, total_area) VALUES
(FARMER_SEQ.NEXTVAL, 'Priya Sharma', '8765432109', 'priya@example.com', 'Village Nalanda, District Nalanda, Bihar', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', DATE '2024-02-20', 'ACTIVE', 0, 0);

INSERT INTO FARMER (farmer_id, name, phone, email, address, password, reg_date, status, total_farms, total_area) VALUES
(FARMER_SEQ.NEXTVAL, 'Amit Singh', '7654321098', 'amit@example.com', 'Village Gaya, District Gaya, Bihar', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', DATE '2024-03-10', 'ACTIVE', 0, 0);

INSERT INTO FARMER (farmer_id, name, phone, email, address, password, reg_date, status, total_farms, total_area) VALUES
(FARMER_SEQ.NEXTVAL, 'Sunita Devi', '6543210987', 'sunita@example.com', 'Village Bhagalpur, District Bhagalpur, Bihar', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', DATE '2024-04-05', 'ACTIVE', 0, 0);

INSERT INTO FARMER (farmer_id, name, phone, email, address, password, reg_date, status, total_farms, total_area) VALUES
(FARMER_SEQ.NEXTVAL, 'Vikram Pandey', '5432109876', 'vikram@example.com', 'Village Muzaffarpur, District Muzaffarpur, Bihar', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', DATE '2024-05-12', 'ACTIVE', 0, 0);

INSERT INTO FARMER (farmer_id, name, phone, email, address, password, reg_date, status, total_farms, total_area) VALUES
(FARMER_SEQ.NEXTVAL, 'Meera Kumari', '4321098765', 'meera@example.com', 'Village Darbhanga, District Darbhanga, Bihar', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', DATE '2024-06-18', 'ACTIVE', 0, 0);

-- Insert Farms
INSERT INTO FARM (farm_id, farmer_id, farm_name, location, area, soil_type, soil_ph, irrigation_type, farm_type, created_date, status) VALUES
(FARM_SEQ.NEXTVAL, 1, 'Golden Wheat Fields', 'Mahua Village', 15.5, 'Loamy', 6.8, 'DRIP', 'CONVENTIONAL', DATE '2024-01-20', 'ACTIVE');

INSERT INTO FARM (farm_id, farmer_id, farm_name, location, area, soil_type, soil_ph, irrigation_type, farm_type, created_date, status) VALUES
(FARM_SEQ.NEXTVAL, 1, 'Rice Paradise', 'Mahua Village', 12.0, 'Clay', 7.2, 'FLOOD', 'CONVENTIONAL', DATE '2024-02-15', 'ACTIVE');

INSERT INTO FARM (farm_id, farmer_id, farm_name, location, area, soil_type, soil_ph, irrigation_type, farm_type, created_date, status) VALUES
(FARM_SEQ.NEXTVAL, 2, 'Organic Garden', 'Nalanda Village', 8.5, 'Sandy Loam', 6.5, 'SPRINKLER', 'ORGANIC', DATE '2024-02-25', 'ACTIVE');

INSERT INTO FARM (farm_id, farmer_id, farm_name, location, area, soil_type, soil_ph, irrigation_type, farm_type, created_date, status) VALUES
(FARM_SEQ.NEXTVAL, 2, 'Vegetable Haven', 'Nalanda Village', 5.0, 'Loamy', 7.0, 'DRIP', 'ORGANIC', DATE '2024-03-10', 'ACTIVE');

INSERT INTO FARM (farm_id, farmer_id, farm_name, location, area, soil_type, soil_ph, irrigation_type, farm_type, created_date, status) VALUES
(FARM_SEQ.NEXTVAL, 3, 'Corn Fields', 'Gaya Village', 20.0, 'Sandy', 6.2, 'SPRINKLER', 'CONVENTIONAL', DATE '2024-03-15', 'ACTIVE');

INSERT INTO FARM (farm_id, farmer_id, farm_name, location, area, soil_type, soil_ph, irrigation_type, farm_type, created_date, status) VALUES
(FARM_SEQ.NEXTVAL, 3, 'Sugarcane Estate', 'Gaya Village', 25.0, 'Clay Loam', 7.5, 'FLOOD', 'CONVENTIONAL', DATE '2024-04-01', 'ACTIVE');

INSERT INTO FARM (farm_id, farmer_id, farm_name, location, area, soil_type, soil_ph, irrigation_type, farm_type, created_date, status) VALUES
(FARM_SEQ.NEXTVAL, 4, 'Spice Garden', 'Bhagalpur Village', 10.0, 'Red Soil', 6.0, 'DRIP', 'HYBRID', DATE '2024-04-10', 'ACTIVE');

INSERT INTO FARM (farm_id, farmer_id, farm_name, location, area, soil_type, soil_ph, irrigation_type, farm_type, created_date, status) VALUES
(FARM_SEQ.NEXTVAL, 5, 'Potato Farm', 'Muzaffarpur Village', 18.0, 'Loamy', 6.8, 'SPRINKLER', 'CONVENTIONAL', DATE '2024-05-20', 'ACTIVE');

INSERT INTO FARM (farm_id, farmer_id, farm_name, location, area, soil_type, soil_ph, irrigation_type, farm_type, created_date, status) VALUES
(FARM_SEQ.NEXTVAL, 6, 'Mango Orchard', 'Darbhanga Village', 30.0, 'Clay', 7.8, 'DRIP', 'ORGANIC', DATE '2024-06-25', 'ACTIVE');

-- Insert Crops
INSERT INTO CROP (crop_id, farm_id, crop_name, variety, sowing_date, expected_harvest_date, actual_harvest_date, expected_yield, actual_yield, crop_status, seed_quantity, planting_density, growth_stage, notes) VALUES
(CROP_SEQ.NEXTVAL, 1, 'Wheat', 'HD-3086', DATE '2024-11-01', DATE '2025-03-15', NULL, 800, NULL, 'GROWING', 80, 120, 'Vegetative', 'Planted in rows with proper spacing');

INSERT INTO CROP (crop_id, farm_id, crop_name, variety, sowing_date, expected_harvest_date, actual_harvest_date, expected_yield, actual_yield, crop_status, seed_quantity, planting_density, growth_stage, notes) VALUES
(CROP_SEQ.NEXTVAL, 1, 'Mustard', 'Pusa Bold', DATE '2024-10-15', DATE '2025-02-20', DATE '2025-02-25', 300, 320, 'HARVESTED', 25, 90, 'Mature', 'Good yield achieved');

INSERT INTO CROP (crop_id, farm_id, crop_name, variety, sowing_date, expected_harvest_date, actual_harvest_date, expected_yield, actual_yield, crop_status, seed_quantity, planting_density, growth_stage, notes) VALUES
(CROP_SEQ.NEXTVAL, 2, 'Rice', 'Basmati 370', DATE '2024-06-15', DATE '2024-11-30', DATE '2024-12-05', 1200, 1350, 'HARVESTED', 60, 100, 'Mature', 'Excellent harvest season');

INSERT INTO CROP (crop_id, farm_id, crop_name, variety, sowing_date, expected_harvest_date, actual_harvest_date, expected_yield, actual_yield, crop_status, seed_quantity, planting_density, growth_stage, notes) VALUES
(CROP_SEQ.NEXTVAL, 2, 'Rice', 'Swarna', DATE '2024-07-01', DATE '2024-12-15', NULL, 1000, NULL, 'MATURE', 50, 95, 'Ripening', 'Ready for harvest soon');

INSERT INTO CROP (crop_id, farm_id, crop_name, variety, sowing_date, expected_harvest_date, actual_harvest_date, expected_yield, actual_yield, crop_status, seed_quantity, planting_density, growth_stage, notes) VALUES
(CROP_SEQ.NEXTVAL, 3, 'Tomato', 'Pusa Ruby', DATE '2024-09-01', DATE '2024-12-15', NULL, 500, NULL, 'GROWING', 15, 200, 'Flowering', 'Organic cultivation');

INSERT INTO CROP (crop_id, farm_id, crop_name, variety, sowing_date, expected_harvest_date, actual_harvest_date, expected_yield, actual_yield, crop_status, seed_quantity, planting_density, growth_stage, notes) VALUES
(CROP_SEQ.NEXTVAL, 3, 'Cabbage', 'Golden Acre', DATE '2024-10-01', DATE '2025-01-15', NULL, 400, NULL, 'GROWING', 20, 150, 'Vegetative', 'Organic pest control used');

INSERT INTO CROP (crop_id, farm_id, crop_name, variety, sowing_date, expected_harvest_date, actual_harvest_date, expected_yield, actual_yield, crop_status, seed_quantity, planting_density, growth_stage, notes) VALUES
(CROP_SEQ.NEXTVAL, 4, 'Cauliflower', 'Pusa Snowball', DATE '2024-10-15', DATE '2025-02-01', NULL, 350, NULL, 'GROWING', 18, 160, 'Vegetative', 'Organic fertilizers applied');

INSERT INTO CROP (crop_id, farm_id, crop_name, variety, sowing_date, expected_harvest_date, actual_harvest_date, expected_yield, actual_yield, crop_status, seed_quantity, planting_density, growth_stage, notes) VALUES
(CROP_SEQ.NEXTVAL, 5, 'Maize', 'Hybrid 900M', DATE '2024-06-01', DATE '2024-10-15', DATE '2024-10-20', 2000, 2200, 'HARVESTED', 40, 80, 'Mature', 'Record yield this season');

INSERT INTO CROP (crop_id, farm_id, crop_name, variety, sowing_date, expected_harvest_date, actual_harvest_date, expected_yield, actual_yield, crop_status, seed_quantity, planting_density, growth_stage, notes) VALUES
(CROP_SEQ.NEXTVAL, 5, 'Sunflower', 'KBSH-1', DATE '2024-08-01', DATE '2024-11-30', DATE '2024-12-05', 600, 650, 'HARVESTED', 30, 70, 'Mature', 'High oil content');

INSERT INTO CROP (crop_id, farm_id, crop_name, variety, sowing_date, expected_harvest_date, actual_harvest_date, expected_yield, actual_yield, crop_status, seed_quantity, planting_density, growth_stage, notes) VALUES
(CROP_SEQ.NEXTVAL, 6, 'Sugarcane', 'Co-86032', DATE '2024-02-15', DATE '2025-01-30', NULL, 80000, NULL, 'GROWING', 1000, 50, 'Vegetative', 'Long duration crop');

INSERT INTO CROP (crop_id, farm_id, crop_name, variety, sowing_date, expected_harvest_date, actual_harvest_date, expected_yield, actual_yield, crop_status, seed_quantity, planting_density, growth_stage, notes) VALUES
(CROP_SEQ.NEXTVAL, 7, 'Chili', 'Teja', DATE '2024-08-15', DATE '2024-12-31', NULL, 200, NULL, 'GROWING', 10, 300, 'Flowering', 'Spice cultivation');

INSERT INTO CROP (crop_id, farm_id, crop_name, variety, sowing_date, expected_harvest_date, actual_harvest_date, expected_yield, actual_yield, crop_status, seed_quantity, planting_density, growth_stage, notes) VALUES
(CROP_SEQ.NEXTVAL, 7, 'Turmeric', 'BSS-35', DATE '2024-04-01', DATE '2024-12-31', NULL, 800, NULL, 'GROWING', 200, 60, 'Vegetative', 'Rhizome development stage');

INSERT INTO CROP (crop_id, farm_id, crop_name, variety, sowing_date, expected_harvest_date, actual_harvest_date, expected_yield, actual_yield, crop_status, seed_quantity, planting_density, growth_stage, notes) VALUES
(CROP_SEQ.NEXTVAL, 8, 'Potato', 'Kufri Jyoti', DATE '2024-10-15', DATE '2025-02-15', NULL, 3000, NULL, 'GROWING', 500, 40, 'Vegetative', 'Tuber formation stage');

INSERT INTO CROP (crop_id, farm_id, crop_name, variety, sowing_date, expected_harvest_date, actual_harvest_date, expected_yield, actual_yield, crop_status, seed_quantity, planting_density, growth_stage, notes) VALUES
(CROP_SEQ.NEXTVAL, 9, 'Mango', 'Dasheri', DATE '2020-03-01', DATE '2025-06-15', NULL, 5000, NULL, 'GROWING', 100, 25, 'Flowering', 'Perennial fruit tree');

-- Insert Labour
INSERT INTO LABOUR (labour_id, name, phone, email, skill, hourly_rate, address, hire_date, status) VALUES
(LABOUR_SEQ.NEXTVAL, 'Ram Kumar', '9876543210', 'ram@example.com', 'Field Worker', 200.00, 'Worker Colony, Patna', DATE '2024-01-01', 'AVAILABLE');

INSERT INTO LABOUR (labour_id, name, phone, email, skill, hourly_rate, address, hire_date, status) VALUES
(LABOUR_SEQ.NEXTVAL, 'Sita Devi', '8765432109', 'sita@example.com', 'Plantation Specialist', 250.00, 'Village Nalanda', DATE '2024-01-15', 'AVAILABLE');

INSERT INTO LABOUR (labour_id, name, phone, email, skill, hourly_rate, address, hire_date, status) VALUES
(LABOUR_SEQ.NEXTVAL, 'Ganesh Yadav', '7654321098', 'ganesh@example.com', 'Tractor Operator', 300.00, 'Village Gaya', DATE '2024-02-01', 'BUSY');

INSERT INTO LABOUR (labour_id, name, phone, email, skill, hourly_rate, address, hire_date, status) VALUES
(LABOUR_SEQ.NEXTVAL, 'Lakshmi Kumari', '6543210987', 'lakshmi@example.com', 'Harvesting Expert', 220.00, 'Village Bhagalpur', DATE '2024-02-15', 'AVAILABLE');

INSERT INTO LABOUR (labour_id, name, phone, email, skill, hourly_rate, address, hire_date, status) VALUES
(LABOUR_SEQ.NEXTVAL, 'Bhola Singh', '5432109876', 'bhola@example.com', 'Irrigation Technician', 280.00, 'Village Muzaffarpur', DATE '2024-03-01', 'AVAILABLE');

INSERT INTO LABOUR (labour_id, name, phone, email, skill, hourly_rate, address, hire_date, status) VALUES
(LABOUR_SEQ.NEXTVAL, 'Rani Devi', '4321098765', 'rani@example.com', 'Organic Farming Expert', 350.00, 'Village Darbhanga', DATE '2024-03-15', 'AVAILABLE');

INSERT INTO LABOUR (labour_id, name, phone, email, skill, hourly_rate, address, hire_date, status) VALUES
(LABOUR_SEQ.NEXTVAL, 'Manoj Kumar', '3210987654', 'manoj@example.com', 'Pest Control Specialist', 320.00, 'Village Patna', DATE '2024-04-01', 'AVAILABLE');

INSERT INTO LABOUR (labour_id, name, phone, email, skill, hourly_rate, address, hire_date, status) VALUES
(LABOUR_SEQ.NEXTVAL, 'Sunita Singh', '2109876543', 'sunita@example.com', 'Equipment Operator', 300.00, 'Village Nalanda', DATE '2024-04-15', 'AVAILABLE');

-- Insert Labour Work
INSERT INTO LABOURWORK (work_id, labour_id, farm_id, work_type, work_date, start_time, end_time, hours_worked, hourly_rate, total_cost, work_description, status, created_date) VALUES
(LABOUR_SEQ.NEXTVAL, 1, 1, 'Plowing', DATE '2024-10-25', TIMESTAMP '2024-10-25 08:00:00', TIMESTAMP '2024-10-25 16:00:00', 8.0, 200.00, 1600.00, 'Deep plowing of wheat field', 'COMPLETED', DATE '2024-10-25');

INSERT INTO LABOURWORK (work_id, labour_id, farm_id, work_type, work_date, start_time, end_time, hours_worked, hourly_rate, total_cost, work_description, status, created_date) VALUES
(LABOUR_SEQ.NEXTVAL, 2, 3, 'Planting', DATE '2024-09-05', TIMESTAMP '2024-09-05 07:00:00', TIMESTAMP '2024-09-05 15:00:00', 8.0, 250.00, 2000.00, 'Tomato seedling transplantation', 'COMPLETED', DATE '2024-09-05');

INSERT INTO LABOURWORK (work_id, labour_id, farm_id, work_type, work_date, start_time, end_time, hours_worked, hourly_rate, total_cost, work_description, status, created_date) VALUES
(LABOUR_SEQ.NEXTVAL, 3, 5, 'Harvesting', DATE '2024-10-18', TIMESTAMP '2024-10-18 06:00:00', TIMESTAMP '2024-10-18 18:00:00', 12.0, 300.00, 3600.00, 'Maize harvesting with tractor', 'COMPLETED', DATE '2024-10-18');

INSERT INTO LABOURWORK (work_id, labour_id, farm_id, work_type, work_date, start_time, end_time, hours_worked, hourly_rate, total_cost, work_description, status, created_date) VALUES
(LABOUR_SEQ.NEXTVAL, 4, 2, 'Harvesting', DATE '2024-12-02', TIMESTAMP '2024-12-02 07:00:00', TIMESTAMP '2024-12-02 17:00:00', 10.0, 220.00, 2200.00, 'Rice harvesting and threshing', 'COMPLETED', DATE '2024-12-02');

INSERT INTO LABOURWORK (work_id, labour_id, farm_id, work_type, work_date, start_time, end_time, hours_worked, hourly_rate, total_cost, work_description, status, created_date) VALUES
(LABOUR_SEQ.NEXTVAL, 5, 6, 'Irrigation Setup', DATE '2024-02-20', TIMESTAMP '2024-02-20 09:00:00', TIMESTAMP '2024-02-20 17:00:00', 8.0, 280.00, 2240.00, 'Sugarcane field irrigation system installation', 'COMPLETED', DATE '2024-02-20');

INSERT INTO LABOURWORK (work_id, labour_id, farm_id, work_type, work_date, start_time, end_time, hours_worked, hourly_rate, total_cost, work_description, status, created_date) VALUES
(LABOUR_SEQ.NEXTVAL, 6, 3, 'Organic Treatment', DATE '2024-09-15', TIMESTAMP '2024-09-15 08:00:00', TIMESTAMP '2024-09-15 16:00:00', 8.0, 350.00, 2800.00, 'Organic fertilizer application and pest control', 'COMPLETED', DATE '2024-09-15');

INSERT INTO LABOURWORK (work_id, labour_id, farm_id, work_type, work_date, start_time, end_time, hours_worked, hourly_rate, total_cost, work_description, status, created_date) VALUES
(LABOUR_SEQ.NEXTVAL, 7, 7, 'Spraying', DATE '2024-11-10', TIMESTAMP '2024-11-10 06:00:00', TIMESTAMP '2024-11-10 14:00:00', 8.0, 320.00, 2560.00, 'Chili crop pesticide spraying', 'COMPLETED', DATE '2024-11-10');

INSERT INTO LABOURWORK (work_id, labour_id, farm_id, work_type, work_date, start_time, end_time, hours_worked, hourly_rate, total_cost, work_description, status, created_date) VALUES
(LABOUR_SEQ.NEXTVAL, 8, 8, 'Planting', DATE '2024-10-20', TIMESTAMP '2024-10-20 07:00:00', TIMESTAMP '2024-10-20 15:00:00', 8.0, 300.00, 2400.00, 'Potato seed planting with equipment', 'COMPLETED', DATE '2024-10-20');

-- Insert Equipment
INSERT INTO EQUIPMENT (equipment_id, farmer_id, equipment_name, equipment_type, brand, model, purchase_date, purchase_cost, current_value, status, last_maintenance_date, next_maintenance_date) VALUES
(EQUIPMENT_SEQ.NEXTVAL, 1, 'Tractor', 'Heavy Machinery', 'Mahindra', 'Arjun 555', DATE '2023-05-15', 850000.00, 750000.00, 'OPERATIONAL', DATE '2024-11-01', DATE '2025-02-01');

INSERT INTO EQUIPMENT (equipment_id, farmer_id, equipment_name, equipment_type, brand, model, purchase_date, purchase_cost, current_value, status, last_maintenance_date, next_maintenance_date) VALUES
(EQUIPMENT_SEQ.NEXTVAL, 1, 'Plow', 'Tillage Equipment', 'Kirloskar', 'Heavy Duty Plow', DATE '2023-05-20', 45000.00, 40000.00, 'OPERATIONAL', DATE '2024-10-15', DATE '2025-01-15');

INSERT INTO EQUIPMENT (equipment_id, farmer_id, equipment_name, equipment_type, brand, model, purchase_date, purchase_cost, current_value, status, last_maintenance_date, next_maintenance_date) VALUES
(EQUIPMENT_SEQ.NEXTVAL, 2, 'Sprinkler System', 'Irrigation Equipment', 'Jain Irrigation', 'Drip System 1000', DATE '2024-03-01', 120000.00, 110000.00, 'OPERATIONAL', DATE '2024-11-15', DATE '2025-02-15');

INSERT INTO EQUIPMENT (equipment_id, farmer_id, equipment_name, equipment_type, brand, model, purchase_date, purchase_cost, current_value, status, last_maintenance_date, next_maintenance_date) VALUES
(EQUIPMENT_SEQ.NEXTVAL, 3, 'Harvester', 'Harvesting Equipment', 'John Deere', 'Combine 9500', DATE '2022-08-10', 2500000.00, 2000000.00, 'MAINTENANCE', DATE '2024-10-01', DATE '2024-12-01');

INSERT INTO EQUIPMENT (equipment_id, farmer_id, equipment_name, equipment_type, brand, model, purchase_date, purchase_cost, current_value, status, last_maintenance_date, next_maintenance_date) VALUES
(EQUIPMENT_SEQ.NEXTVAL, 4, 'Sprayer', 'Application Equipment', 'Bayer', 'Backpack Sprayer Pro', DATE '2024-06-15', 25000.00, 22000.00, 'OPERATIONAL', DATE '2024-11-05', DATE '2025-02-05');

INSERT INTO EQUIPMENT (equipment_id, farmer_id, equipment_name, equipment_type, brand, model, purchase_date, purchase_cost, current_value, status, last_maintenance_date, next_maintenance_date) VALUES
(EQUIPMENT_SEQ.NEXTVAL, 5, 'Seeder', 'Planting Equipment', 'Mahindra', 'Precision Seeder', DATE '2024-01-20', 180000.00, 170000.00, 'OPERATIONAL', DATE '2024-10-20', DATE '2025-01-20');

INSERT INTO EQUIPMENT (equipment_id, farmer_id, equipment_name, equipment_type, brand, model, purchase_date, purchase_cost, current_value, status, last_maintenance_date, next_maintenance_date) VALUES
(EQUIPMENT_SEQ.NEXTVAL, 6, 'Pruning Tools', 'Hand Tools', 'Gardena', 'Professional Set', DATE '2024-04-10', 15000.00, 14000.00, 'OPERATIONAL', DATE '2024-11-10', DATE '2025-02-10');

-- Insert Equipment Maintenance
INSERT INTO EQUIPMENT_MAINTENANCE (maintenance_id, equipment_id, maintenance_date, maintenance_type, description, cost, performed_by, next_maintenance_date, status) VALUES
(MAINTENANCE_SEQ.NEXTVAL, 1, DATE '2024-11-01', 'Regular Service', 'Oil change, filter replacement, engine check', 5000.00, 'Mahindra Service Center', DATE '2025-02-01', 'COMPLETED');

INSERT INTO EQUIPMENT_MAINTENANCE (maintenance_id, equipment_id, maintenance_date, maintenance_type, description, cost, performed_by, next_maintenance_date, status) VALUES
(MAINTENANCE_SEQ.NEXTVAL, 2, DATE '2024-10-15', 'Cleaning & Sharpening', 'Blade sharpening and general cleaning', 2000.00, 'Local Mechanic', DATE '2025-01-15', 'COMPLETED');

INSERT INTO EQUIPMENT_MAINTENANCE (maintenance_id, equipment_id, maintenance_date, maintenance_type, description, cost, performed_by, next_maintenance_date, status) VALUES
(MAINTENANCE_SEQ.NEXTVAL, 3, DATE '2024-11-15', 'System Check', 'Drip line inspection and pressure testing', 3000.00, 'Jain Irrigation Technician', DATE '2025-02-15', 'COMPLETED');

INSERT INTO EQUIPMENT_MAINTENANCE (maintenance_id, equipment_id, maintenance_date, maintenance_type, description, cost, performed_by, next_maintenance_date, status) VALUES
(MAINTENANCE_SEQ.NEXTVAL, 4, DATE '2024-10-01', 'Major Overhaul', 'Engine overhaul and transmission repair', 150000.00, 'John Deere Service', DATE '2024-12-01', 'IN_PROGRESS');

INSERT INTO EQUIPMENT_MAINTENANCE (maintenance_id, equipment_id, maintenance_date, maintenance_type, description, cost, performed_by, next_maintenance_date, status) VALUES
(MAINTENANCE_SEQ.NEXTVAL, 5, DATE '2024-11-05', 'Cleaning', 'Tank cleaning and nozzle replacement', 1500.00, 'Local Service', DATE '2025-02-05', 'COMPLETED');

INSERT INTO EQUIPMENT_MAINTENANCE (maintenance_id, equipment_id, maintenance_date, maintenance_type, description, cost, performed_by, next_maintenance_date, status) VALUES
(MAINTENANCE_SEQ.NEXTVAL, 6, DATE '2024-10-20', 'Calibration', 'Seeder calibration and adjustment', 4000.00, 'Mahindra Technician', DATE '2025-01-20', 'COMPLETED');

INSERT INTO EQUIPMENT_MAINTENANCE (maintenance_id, equipment_id, maintenance_date, maintenance_type, description, cost, performed_by, next_maintenance_date, status) VALUES
(MAINTENANCE_SEQ.NEXTVAL, 7, DATE '2024-11-10', 'Sharpening', 'Tool sharpening and handle replacement', 800.00, 'Local Blacksmith', DATE '2025-02-10', 'COMPLETED');

-- Insert Fertilizers
INSERT INTO FERTILIZER (fertilizer_id, farm_id, fertilizer_name, fertilizer_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, application_method, effectiveness_rating) VALUES
(FERTILIZER_SEQ.NEXTVAL, 1, 'Urea', 'INORGANIC', 50.0, 'KG', DATE '2024-11-15', 25.00, 1250.00, 'Rajesh Kumar', 1, 'Broadcast', 4);

INSERT INTO FERTILIZER (fertilizer_id, farm_id, fertilizer_name, fertilizer_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, application_method, effectiveness_rating) VALUES
(FERTILIZER_SEQ.NEXTVAL, 1, 'DAP', 'INORGANIC', 25.0, 'KG', DATE '2024-11-20', 45.00, 1125.00, 'Rajesh Kumar', 1, 'Band Placement', 5);

INSERT INTO FERTILIZER (fertilizer_id, farm_id, fertilizer_name, fertilizer_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, application_method, effectiveness_rating) VALUES
(FERTILIZER_SEQ.NEXTVAL, 2, 'NPK 20-20-20', 'INORGANIC', 40.0, 'KG', DATE '2024-07-20', 60.00, 2400.00, 'Priya Sharma', 3, 'Side Dressing', 4);

INSERT INTO FERTILIZER (fertilizer_id, farm_id, fertilizer_name, fertilizer_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, application_method, effectiveness_rating) VALUES
(FERTILIZER_SEQ.NEXTVAL, 3, 'Vermicompost', 'ORGANIC', 100.0, 'KG', DATE '2024-09-10', 15.00, 1500.00, 'Organic Farm Worker', 5, 'Top Dressing', 5);

INSERT INTO FERTILIZER (fertilizer_id, farm_id, fertilizer_name, fertilizer_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, application_method, effectiveness_rating) VALUES
(FERTILIZER_SEQ.NEXTVAL, 3, 'Neem Cake', 'ORGANIC', 30.0, 'KG', DATE '2024-09-15', 20.00, 600.00, 'Organic Farm Worker', 6, 'Soil Incorporation', 4);

INSERT INTO FERTILIZER (fertilizer_id, farm_id, fertilizer_name, fertilizer_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, application_method, effectiveness_rating) VALUES
(FERTILIZER_SEQ.NEXTVAL, 5, 'Ammonium Sulphate', 'INORGANIC', 60.0, 'KG', DATE '2024-07-05', 30.00, 1800.00, 'Amit Singh', 8, 'Broadcast', 4);

INSERT INTO FERTILIZER (fertilizer_id, farm_id, fertilizer_name, fertilizer_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, application_method, effectiveness_rating) VALUES
(FERTILIZER_SEQ.NEXTVAL, 6, 'Single Super Phosphate', 'INORGANIC', 80.0, 'KG', DATE '2024-03-15', 35.00, 2800.00, 'Amit Singh', 10, 'Basal Application', 5);

INSERT INTO FERTILIZER (fertilizer_id, farm_id, fertilizer_name, fertilizer_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, application_method, effectiveness_rating) VALUES
(FERTILIZER_SEQ.NEXTVAL, 7, 'Farm Yard Manure', 'ORGANIC', 200.0, 'KG', DATE '2024-08-20', 8.00, 1600.00, 'Sunita Devi', 11, 'Broadcast', 4);

INSERT INTO FERTILIZER (fertilizer_id, farm_id, fertilizer_name, fertilizer_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, application_method, effectiveness_rating) VALUES
(FERTILIZER_SEQ.NEXTVAL, 8, 'Potash', 'INORGANIC', 45.0, 'KG', DATE '2024-11-10', 40.00, 1800.00, 'Vikram Pandey', 13, 'Side Dressing', 4);

INSERT INTO FERTILIZER (fertilizer_id, farm_id, fertilizer_name, fertilizer_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, application_method, effectiveness_rating) VALUES
(FERTILIZER_SEQ.NEXTVAL, 9, 'Compost', 'ORGANIC', 150.0, 'KG', DATE '2024-06-01', 12.00, 1800.00, 'Meera Kumari', 14, 'Ring Application', 5);

-- Insert Pesticides
INSERT INTO PESTICIDE (pesticide_id, farm_id, pesticide_name, pesticide_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, target_pest, effectiveness_rating) VALUES
(PESTICIDE_SEQ.NEXTVAL, 1, 'Chlorpyrifos', 'INSECTICIDE', 2.0, 'LITERS', DATE '2024-12-01', 800.00, 1600.00, 'Rajesh Kumar', 1, 'Aphids and Thrips', 4);

INSERT INTO PESTICIDE (pesticide_id, farm_id, pesticide_name, pesticide_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, target_pest, effectiveness_rating) VALUES
(PESTICIDE_SEQ.NEXTVAL, 2, 'Bavistin', 'FUNGICIDE', 1.5, 'LITERS', DATE '2024-08-15', 600.00, 900.00, 'Priya Sharma', 3, 'Blast Disease', 5);

INSERT INTO PESTICIDE (pesticide_id, farm_id, pesticide_name, pesticide_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, target_pest, effectiveness_rating) VALUES
(PESTICIDE_SEQ.NEXTVAL, 3, 'Neem Oil', 'BIOLOGICAL', 5.0, 'LITERS', DATE '2024-09-20', 200.00, 1000.00, 'Organic Farm Worker', 5, 'Whiteflies', 4);

INSERT INTO PESTICIDE (pesticide_id, farm_id, pesticide_name, pesticide_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, target_pest, effectiveness_rating) VALUES
(PESTICIDE_SEQ.NEXTVAL, 3, 'Garlic Extract', 'BIOLOGICAL', 3.0, 'LITERS', DATE '2024-10-05', 150.00, 450.00, 'Organic Farm Worker', 6, 'Caterpillars', 3);

INSERT INTO PESTICIDE (pesticide_id, farm_id, pesticide_name, pesticide_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, target_pest, effectiveness_rating) VALUES
(PESTICIDE_SEQ.NEXTVAL, 5, 'Cypermethrin', 'INSECTICIDE', 1.0, 'LITERS', DATE '2024-08-01', 500.00, 500.00, 'Amit Singh', 8, 'Armyworm', 5);

INSERT INTO PESTICIDE (pesticide_id, farm_id, pesticide_name, pesticide_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, target_pest, effectiveness_rating) VALUES
(PESTICIDE_SEQ.NEXTVAL, 6, 'Glyphosate', 'HERBICIDE', 4.0, 'LITERS', DATE '2024-03-20', 300.00, 1200.00, 'Amit Singh', 10, 'Weeds', 5);

INSERT INTO PESTICIDE (pesticide_id, farm_id, pesticide_name, pesticide_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, target_pest, effectiveness_rating) VALUES
(PESTICIDE_SEQ.NEXTVAL, 7, 'Chili Extract', 'BIOLOGICAL', 2.0, 'LITERS', DATE '2024-11-15', 100.00, 200.00, 'Sunita Devi', 11, 'Fruit Borer', 4);

INSERT INTO PESTICIDE (pesticide_id, farm_id, pesticide_name, pesticide_type, quantity_used, unit, applied_date, cost_per_unit, total_cost, applied_by, crop_id, target_pest, effectiveness_rating) VALUES
(PESTICIDE_SEQ.NEXTVAL, 8, 'Mancozeb', 'FUNGICIDE', 2.5, 'LITERS', DATE '2024-11-20', 400.00, 1000.00, 'Vikram Pandey', 13, 'Late Blight', 4);

-- Insert Irrigation Records
INSERT INTO IRRIGATION (irrigation_id, farm_id, irrigation_date, irrigation_type, water_used, unit, duration_hours, cost_per_liter, total_cost, performed_by, crop_id, weather_condition, notes) VALUES
(IRRIGATION_SEQ.NEXTVAL, 1, DATE '2024-11-25', 'DRIP', 5000.0, 'LITERS', 4.0, 0.05, 250.00, 'Bhola Singh', 1, 'SUNNY', 'Scheduled irrigation for wheat crop');

INSERT INTO IRRIGATION (irrigation_id, farm_id, irrigation_date, irrigation_type, water_used, unit, duration_hours, cost_per_liter, total_cost, performed_by, crop_id, weather_condition, notes) VALUES
(IRRIGATION_SEQ.NEXTVAL, 2, DATE '2024-08-20', 'FLOOD', 15000.0, 'LITERS', 8.0, 0.03, 450.00, 'Irrigation Worker', 3, 'CLOUDY', 'Flood irrigation for rice field');

INSERT INTO IRRIGATION (irrigation_id, farm_id, irrigation_date, irrigation_type, water_used, unit, duration_hours, cost_per_liter, total_cost, performed_by, crop_id, weather_condition, notes) VALUES
(IRRIGATION_SEQ.NEXTVAL, 3, DATE '2024-09-25', 'SPRINKLER', 3000.0, 'LITERS', 2.0, 0.04, 120.00, 'Organic Farm Worker', 5, 'SUNNY', 'Organic farm irrigation');

INSERT INTO IRRIGATION (irrigation_id, farm_id, irrigation_date, irrigation_type, water_used, unit, duration_hours, cost_per_liter, total_cost, performed_by, crop_id, weather_condition, notes) VALUES
(IRRIGATION_SEQ.NEXTVAL, 3, DATE '2024-10-30', 'SPRINKLER', 2500.0, 'LITERS', 1.5, 0.04, 100.00, 'Organic Farm Worker', 6, 'PARTLY_CLOUDY', 'Cabbage field irrigation');

INSERT INTO IRRIGATION (irrigation_id, farm_id, irrigation_date, irrigation_type, water_used, unit, duration_hours, cost_per_liter, total_cost, performed_by, crop_id, weather_condition, notes) VALUES
(IRRIGATION_SEQ.NEXTVAL, 5, DATE '2024-07-15', 'SPRINKLER', 8000.0, 'LITERS', 6.0, 0.03, 240.00, 'Amit Singh', 8, 'SUNNY', 'Maize field irrigation');

INSERT INTO IRRIGATION (irrigation_id, farm_id, irrigation_date, irrigation_type, water_used, unit, duration_hours, cost_per_liter, total_cost, performed_by, crop_id, weather_condition, notes) VALUES
(IRRIGATION_SEQ.NEXTVAL, 6, DATE '2024-04-10', 'FLOOD', 20000.0, 'LITERS', 12.0, 0.03, 600.00, 'Amit Singh', 10, 'RAINY', 'Sugarcane field irrigation');

INSERT INTO IRRIGATION (irrigation_id, farm_id, irrigation_date, irrigation_type, water_used, unit, duration_hours, cost_per_liter, total_cost, performed_by, crop_id, weather_condition, notes) VALUES
(IRRIGATION_SEQ.NEXTVAL, 7, DATE '2024-11-25', 'DRIP', 1500.0, 'LITERS', 2.0, 0.05, 75.00, 'Sunita Devi', 11, 'SUNNY', 'Chili field drip irrigation');

INSERT INTO IRRIGATION (irrigation_id, farm_id, irrigation_date, irrigation_type, water_used, unit, duration_hours, cost_per_liter, total_cost, performed_by, crop_id, weather_condition, notes) VALUES
(IRRIGATION_SEQ.NEXTVAL, 8, DATE '2024-11-15', 'SPRINKLER', 6000.0, 'LITERS', 4.0, 0.03, 180.00, 'Vikram Pandey', 13, 'SUNNY', 'Potato field irrigation');

-- Insert Weather Data
INSERT INTO WEATHER_DATA (weather_id, farm_id, recorded_date, temperature, humidity, rainfall, wind_speed, pressure, weather_condition, recorded_by) VALUES
(WEATHER_SEQ.NEXTVAL, 1, DATE '2024-11-25', 28.5, 65.0, 0.0, 8.5, 1015.2, 'SUNNY', 'AUTOMATIC_SENSOR');

INSERT INTO WEATHER_DATA (weather_id, farm_id, recorded_date, temperature, humidity, rainfall, wind_speed, pressure, weather_condition, recorded_by) VALUES
(WEATHER_SEQ.NEXTVAL, 1, DATE '2024-11-26', 26.0, 72.0, 5.2, 12.0, 1010.5, 'RAINY', 'AUTOMATIC_SENSOR');

INSERT INTO WEATHER_DATA (weather_id, farm_id, recorded_date, temperature, humidity, rainfall, wind_speed, pressure, weather_condition, recorded_by) VALUES
(WEATHER_SEQ.NEXTVAL, 2, DATE '2024-11-25', 29.0, 68.0, 0.0, 10.0, 1014.8, 'SUNNY', 'AUTOMATIC_SENSOR');

INSERT INTO WEATHER_DATA (weather_id, farm_id, recorded_date, temperature, humidity, rainfall, wind_speed, pressure, weather_condition, recorded_by) VALUES
(WEATHER_SEQ.NEXTVAL, 3, DATE '2024-11-25', 27.5, 70.0, 0.0, 9.0, 1013.5, 'PARTLY_CLOUDY', 'AUTOMATIC_SENSOR');

INSERT INTO WEATHER_DATA (weather_id, farm_id, recorded_date, temperature, humidity, rainfall, wind_speed, pressure, weather_condition, recorded_by) VALUES
(WEATHER_SEQ.NEXTVAL, 4, DATE '2024-11-25', 28.0, 67.0, 0.0, 11.5, 1014.0, 'SUNNY', 'AUTOMATIC_SENSOR');

INSERT INTO WEATHER_DATA (weather_id, farm_id, recorded_date, temperature, humidity, rainfall, wind_speed, pressure, weather_condition, recorded_by) VALUES
(WEATHER_SEQ.NEXTVAL, 5, DATE '2024-11-25', 30.0, 63.0, 0.0, 7.0, 1016.2, 'SUNNY', 'AUTOMATIC_SENSOR');

INSERT INTO WEATHER_DATA (weather_id, farm_id, recorded_date, temperature, humidity, rainfall, wind_speed, pressure, weather_condition, recorded_by) VALUES
(WEATHER_SEQ.NEXTVAL, 6, DATE '2024-11-25', 29.5, 65.0, 0.0, 8.0, 1015.5, 'SUNNY', 'AUTOMATIC_SENSOR');

INSERT INTO WEATHER_DATA (weather_id, farm_id, recorded_date, temperature, humidity, rainfall, wind_speed, pressure, weather_condition, recorded_by) VALUES
(WEATHER_SEQ.NEXTVAL, 7, DATE '2024-11-25', 28.8, 69.0, 0.0, 9.5, 1014.3, 'PARTLY_CLOUDY', 'AUTOMATIC_SENSOR');

INSERT INTO WEATHER_DATA (weather_id, farm_id, recorded_date, temperature, humidity, rainfall, wind_speed, pressure, weather_condition, recorded_by) VALUES
(WEATHER_SEQ.NEXTVAL, 8, DATE '2024-11-25', 27.0, 71.0, 0.0, 6.5, 1013.8, 'CLOUDY', 'AUTOMATIC_SENSOR');

INSERT INTO WEATHER_DATA (weather_id, farm_id, recorded_date, temperature, humidity, rainfall, wind_speed, pressure, weather_condition, recorded_by) VALUES
(WEATHER_SEQ.NEXTVAL, 9, DATE '2024-11-25', 26.5, 73.0, 0.0, 5.0, 1013.2, 'CLOUDY', 'AUTOMATIC_SENSOR');

-- Insert Soil Analysis
INSERT INTO SOIL_ANALYSIS (analysis_id, farm_id, analysis_date, nitrogen_level, phosphorus_level, potassium_level, organic_matter, ph_level, moisture_content, analyzed_by, recommendations) VALUES
(SOIL_SEQ.NEXTVAL, 1, DATE '2024-11-01', 125.5, 48.2, 185.3, 2.8, 6.8, 15.2, 'Soil Testing Lab Patna', 'Add nitrogen fertilizer for better wheat growth');

INSERT INTO SOIL_ANALYSIS (analysis_id, farm_id, analysis_date, nitrogen_level, phosphorus_level, potassium_level, organic_matter, ph_level, moisture_content, analyzed_by, recommendations) VALUES
(SOIL_SEQ.NEXTVAL, 2, DATE '2024-11-01', 118.0, 52.5, 175.8, 3.2, 7.2, 18.5, 'Soil Testing Lab Patna', 'Good soil for rice cultivation, maintain water level');

INSERT INTO SOIL_ANALYSIS (analysis_id, farm_id, analysis_date, nitrogen_level, phosphorus_level, potassium_level, organic_matter, ph_level, moisture_content, analyzed_by, recommendations) VALUES
(SOIL_SEQ.NEXTVAL, 3, DATE '2024-11-01', 95.5, 35.8, 165.2, 4.5, 6.5, 12.8, 'Organic Soil Lab', 'Excellent organic matter content, suitable for vegetables');

INSERT INTO SOIL_ANALYSIS (analysis_id, farm_id, analysis_date, nitrogen_level, phosphorus_level, potassium_level, organic_matter, ph_level, moisture_content, analyzed_by, recommendations) VALUES
(SOIL_SEQ.NEXTVAL, 4, DATE '2024-11-01', 105.0, 42.3, 170.5, 3.8, 7.0, 14.2, 'Organic Soil Lab', 'Good soil health, continue organic practices');

INSERT INTO SOIL_ANALYSIS (analysis_id, farm_id, analysis_date, nitrogen_level, phosphorus_level, potassium_level, organic_matter, ph_level, moisture_content, analyzed_by, recommendations) VALUES
(SOIL_SEQ.NEXTVAL, 5, DATE '2024-11-01', 135.2, 38.5, 195.8, 2.5, 6.2, 16.8, 'Soil Testing Lab Gaya', 'Add phosphorus for better corn yield');

INSERT INTO SOIL_ANALYSIS (analysis_id, farm_id, analysis_date, nitrogen_level, phosphorus_level, potassium_level, organic_matter, ph_level, moisture_content, analyzed_by, recommendations) VALUES
(SOIL_SEQ.NEXTVAL, 6, DATE '2024-11-01', 145.8, 55.2, 210.5, 2.2, 7.5, 20.5, 'Soil Testing Lab Gaya', 'Rich soil for sugarcane, monitor pH level');

INSERT INTO SOIL_ANALYSIS (analysis_id, farm_id, analysis_date, nitrogen_level, phosphorus_level, potassium_level, organic_matter, ph_level, moisture_content, analyzed_by, recommendations) VALUES
(SOIL_SEQ.NEXTVAL, 7, DATE '2024-11-01', 88.5, 28.5, 145.2, 3.5, 6.0, 11.5, 'Soil Testing Lab Bhagalpur', 'Add organic matter for spice cultivation');

INSERT INTO SOIL_ANALYSIS (analysis_id, farm_id, analysis_date, nitrogen_level, phosphorus_level, potassium_level, organic_matter, ph_level, moisture_content, analyzed_by, recommendations) VALUES
(SOIL_SEQ.NEXTVAL, 8, DATE '2024-11-01', 115.2, 45.8, 180.5, 3.0, 6.8, 17.2, 'Soil Testing Lab Muzaffarpur', 'Good soil for potato cultivation');

INSERT INTO SOIL_ANALYSIS (analysis_id, farm_id, analysis_date, nitrogen_level, phosphorus_level, potassium_level, organic_matter, ph_level, moisture_content, analyzed_by, recommendations) VALUES
(SOIL_SEQ.NEXTVAL, 9, DATE '2024-11-01', 98.5, 32.8, 155.8, 4.2, 7.8, 13.5, 'Organic Soil Lab', 'Excellent soil for mango orchard');

-- Insert Crop Diseases
INSERT INTO CROP_DISEASES (disease_id, crop_id, disease_name, detected_date, severity, affected_area, treatment_applied, treatment_cost, status, notes) VALUES
(DISEASE_SEQ.NEXTVAL, 5, 'Tomato Blight', DATE '2024-10-15', 'MEDIUM', 0.5, 'Copper fungicide spray', 800.00, 'RESOLVED', 'Early detection prevented major damage');

INSERT INTO CROP_DISEASES (disease_id, crop_id, disease_name, detected_date, severity, affected_area, treatment_applied, treatment_cost, status, notes) VALUES
(DISEASE_SEQ.NEXTVAL, 8, 'Corn Rust', DATE '2024-08-20', 'LOW', 1.0, 'Fungicide treatment', 600.00, 'RESOLVED', 'Controlled with timely intervention');

INSERT INTO CROP_DISEASES (disease_id, crop_id, disease_name, detected_date, severity, affected_area, treatment_applied, treatment_cost, status, notes) VALUES
(DISEASE_SEQ.NEXTVAL, 11, 'Chili Anthracnose', DATE '2024-11-10', 'HIGH', 0.3, 'Bordeaux mixture application', 1200.00, 'TREATING', 'Severe infection, ongoing treatment');

INSERT INTO CROP_DISEASES (disease_id, crop_id, disease_name, detected_date, severity, affected_area, treatment_applied, treatment_cost, status, notes) VALUES
(DISEASE_SEQ.NEXTVAL, 13, 'Potato Late Blight', DATE '2024-11-20', 'MEDIUM', 2.0, 'Systemic fungicide spray', 1500.00, 'TREATING', 'Preventive measures being applied');

INSERT INTO CROP_DISEASES (disease_id, crop_id, disease_name, detected_date, severity, affected_area, treatment_applied, treatment_cost, status, notes) VALUES
(DISEASE_SEQ.NEXTVAL, 14, 'Mango Anthracnose', DATE '2024-06-15', 'LOW', 1.5, 'Copper oxychloride spray', 900.00, 'RESOLVED', 'Seasonal disease, controlled successfully');

-- Insert Sales Records
INSERT INTO SALES (sale_id, farm_id, crop_id, buyer_name, buyer_contact, quantity_sold, unit, price_per_unit, total_amount, sale_date, payment_method, payment_status, invoice_number, notes) VALUES
(SALES_SEQ.NEXTVAL, 1, 2, 'Local Grain Market', '9876543210', 320.0, 'KG', 45.00, 14400.00, DATE '2025-02-25', 'CASH', 'PAID', 'INV-001', 'Mustard crop sold to local market');

INSERT INTO SALES (sale_id, farm_id, crop_id, buyer_name, buyer_contact, quantity_sold, unit, price_per_unit, total_amount, sale_date, payment_method, payment_status, invoice_number, notes) VALUES
(SALES_SEQ.NEXTVAL, 2, 3, 'Rice Mill Company', '8765432109', 1350.0, 'KG', 25.00, 33750.00, DATE '2024-12-05', 'BANK_TRANSFER', 'PAID', 'INV-002', 'Basmati rice sold to mill');

INSERT INTO SALES (sale_id, farm_id, crop_id, buyer_name, buyer_contact, quantity_sold, unit, price_per_unit, total_amount, sale_date, payment_method, payment_status, invoice_number, notes) VALUES
(SALES_SEQ.NEXTVAL, 2, 4, 'Rice Wholesaler', '7654321098', 1000.0, 'KG', 22.00, 22000.00, DATE '2024-12-15', 'BANK_TRANSFER', 'PENDING', 'INV-003', 'Swarna rice pending payment');

INSERT INTO SALES (sale_id, farm_id, crop_id, buyer_name, buyer_contact, quantity_sold, unit, price_per_unit, total_amount, sale_date, payment_method, payment_status, invoice_number, notes) VALUES
(SALES_SEQ.NEXTVAL, 5, 8, 'Cattle Feed Company', '6543210987', 2200.0, 'KG', 12.00, 26400.00, DATE '2024-10-20', 'BANK_TRANSFER', 'PAID', 'INV-004', 'Maize sold for cattle feed');

INSERT INTO SALES (sale_id, farm_id, crop_id, buyer_name, buyer_contact, quantity_sold, unit, price_per_unit, total_amount, sale_date, payment_method, payment_status, invoice_number, notes) VALUES
(SALES_SEQ.NEXTVAL, 5, 9, 'Oil Mill', '5432109876', 650.0, 'KG', 35.00, 22750.00, DATE '2024-12-05', 'BANK_TRANSFER', 'PAID', 'INV-005', 'Sunflower seeds for oil extraction');

INSERT INTO SALES (sale_id, farm_id, crop_id, buyer_name, buyer_contact, quantity_sold, unit, price_per_unit, total_amount, sale_date, payment_method, payment_status, invoice_number, notes) VALUES
(SALES_SEQ.NEXTVAL, 6, 10, 'Sugar Mill', '4321098765', 80000.0, 'KG', 2.50, 200000.00, DATE '2025-01-30', 'CHEQUE', 'PENDING', 'INV-006', 'Sugarcane delivery to sugar mill');

INSERT INTO SALES (sale_id, farm_id, crop_id, buyer_name, buyer_contact, quantity_sold, unit, price_per_unit, total_amount, sale_date, payment_method, payment_status, invoice_number, notes) VALUES
(SALES_SEQ.NEXTVAL, 7, 11, 'Spice Trader', '3210987654', 180.0, 'KG', 120.00, 21600.00, DATE '2024-12-31', 'CASH', 'PAID', 'INV-007', 'Red chili sold to spice trader');

INSERT INTO SALES (sale_id, farm_id, crop_id, buyer_name, buyer_contact, quantity_sold, unit, price_per_unit, total_amount, sale_date, payment_method, payment_status, invoice_number, notes) VALUES
(SALES_SEQ.NEXTVAL, 7, 12, 'Turmeric Processor', '2109876543', 750.0, 'KG', 85.00, 63750.00, DATE '2024-12-31', 'BANK_TRANSFER', 'PAID', 'INV-008', 'Turmeric rhizomes for processing');

INSERT INTO SALES (sale_id, farm_id, crop_id, buyer_name, buyer_contact, quantity_sold, unit, price_per_unit, total_amount, sale_date, payment_method, payment_status, invoice_number, notes) VALUES
(SALES_SEQ.NEXTVAL, 8, 13, 'Vegetable Market', '1098765432', 2800.0, 'KG', 15.00, 42000.00, DATE '2025-02-15', 'CASH', 'PENDING', 'INV-009', 'Potatoes to local vegetable market');

INSERT INTO SALES (sale_id, farm_id, crop_id, buyer_name, buyer_contact, quantity_sold, unit, price_per_unit, total_amount, sale_date, payment_method, payment_status, invoice_number, notes) VALUES
(SALES_SEQ.NEXTVAL, 9, 14, 'Fruit Wholesaler', '0987654321', 4500.0, 'KG', 35.00, 157500.00, DATE '2025-06-15', 'BANK_TRANSFER', 'PENDING', 'INV-010', 'Mangoes for export market');

-- Update farmer statistics (this will be handled by triggers, but we can manually update for initial data)
UPDATE FARMER SET total_farms = (SELECT COUNT(*) FROM FARM WHERE farmer_id = FARMER.farmer_id),
                  total_area = (SELECT NVL(SUM(area), 0) FROM FARM WHERE farmer_id = FARMER.farmer_id);

COMMIT;

-- Display success message
SELECT 'Sample data inserted successfully! Database is ready for testing.' as STATUS FROM DUAL;

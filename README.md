# Integrated Smart Farming System (ISFS)

A full-stack Oracle + Node.js + React app to manage farms, crops, sensors, alerts, labour, sales and analytics.

## 1) Quick Start
- Prereqs: Oracle DB, Node 18+, npm
- Backend
  1. Create DB objects (one time):
     - Run `ISFS_backend/database/final_setup.sql` in SQL*Plus/SQL Developer
  2. Configure env: copy `.env.example` → `.env` and set DB and JWT values
  3. Install & run:
     - `cd ISFS_backend`
     - `npm i`
     - `npm run dev`
- Frontend
  - `cd ISFS_frontend`
  - `npm i`
  - `npm start`

Backend base URL: `http://localhost:5000/api`

## 2) Essential API Endpoints
- Auth
  - `POST /auth/login` → { token, farmerId, name }
  - `POST /admin/login` → { token }
- Sensors (farmer)
  - `POST /sensors/reading` { farmId, sensorType, value, unit?, notes? }
  - `GET /sensors/readings?farmId?&sensorType?&startDate?&endDate?&status?`
  - `GET /sensors/thresholds` (all) or `?sensorType=...`
  - `PUT /sensors/thresholds` { sensorType, criticalMin?, criticalMax?, useDefaults? }
- Sensors (admin)
  - `POST /admin/sensors/reading`
  - `GET /admin/sensors/alerts`
  - `GET /admin/sensors/stats`

Supported sensorType: SOIL_MOISTURE, SOIL_PH, TEMPERATURE, HUMIDITY, LIGHT

## 3) How IDs and Sequences Work
- Farmer ID at registration uses `FARMER_SEQ.NEXTVAL`
- Registration ensures `FARMER_SEQ` starts at `MAX(farmer_id)+1` (auto realign)

## 4) Add Sensors from UI
- Route: `/add-sensor` (farmer)
- Adds/updates `SENSOR_THRESHOLDS` using defaults or custom critical limits

## 5) Postman Quick Test
1) Login as farmer → set header `Authorization: Bearer <token>`
2) Push a critical temperature reading:
{
  "farmId": 1,
  "sensorType": "TEMPERATURE",
  "value": 45,
  "unit": "°C",
  "notes": "critical test"
}
3) Verify alerts (admin): `GET /admin/sensors/alerts?sensorType=TEMPERATURE`

## 6) SQL Files
- `ISFS_backend/database/final_setup.sql` — single script to create all tables, sequences, triggers, views, procedures, functions + default thresholds
- `ISFS_backend/database/all.sql` — commented catalog of SQL used by the app
- `ISFS_backend/database/backend_frontend_sql_reference.sql` — concise list of statements called by code

## 7) Tokens (browser console)
- Farmer: `localStorage.getItem('token')`
- Admin: `localStorage.getItem('adminToken')`

## 8) Notes
- If admin sensor routes return 404, ensure server logged: "Sensor routes registered at /api/sensors and /api/admin/sensors" and use admin token.
- SMS/Email delivery may be disabled in dev; alerts are still recorded and in-app notifications are sent.

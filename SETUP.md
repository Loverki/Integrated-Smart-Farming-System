# ISFS Setup Guide

This guide explains what the Integrated Smart Farming System does and how to set it up quickly.

## What the project does
- Centralizes farmer data: farms, crops, labour, equipment, sales.
- Monitors sensors (temperature, humidity, soil moisture, soil pH, light) and triggers alerts (in‑app, SMS/Email optional).
- Provides analytics via views and stats (farm performance, monthly revenue, crop analytics).
- Uses Oracle sequences for IDs; registration auto-aligns `FARMER_SEQ` to avoid gaps.

## Architecture
- Backend: Node.js (Express) + Oracle DB (oracledb driver)
- Frontend: React (Vite/CRA) served separately during development
- Auth: JWT

## 1) Database setup (one time)
1. Open SQL*Plus or SQL Developer and run:
   - `@ISFS_backend/database/final_setup.sql`
   This creates all tables, sequences, triggers, procedures, functions, views, and default sensor thresholds.
2. Optional: inspect statements used by the app
   - `ISFS_backend/database/all.sql` (annotated catalog)
   - `ISFS_backend/database/backend_frontend_sql_reference.sql` (concise list)

## 2) Backend
1. `cd ISFS_backend`
2. Copy `.env.example` to `.env` and set:
   - `DB_USER`, `DB_PASSWORD`, `DB_CONNECT_STRING`
   - `JWT_SECRET`
3. Install and run:
   - `npm i`
   - `npm run dev`
Backend base URL: `http://localhost:5000/api`

## 3) Frontend
1. `cd ISFS_frontend`
2. `npm i`
3. `npm start`

## 4) Quick Test (Sensors)
1. Login (farmer): `POST /api/auth/login` → get `token`
2. Add sensor thresholds (or rely on defaults):
   - `PUT /api/sensors/thresholds` `{ "sensorType": "TEMPERATURE", "useDefaults": true }`
3. Submit a critical reading:
   - `POST /api/sensors/reading` `{ "farmId": 1, "sensorType": "TEMPERATURE", "value": 45 }`
4. Check alerts (admin): `GET /api/admin/sensors/alerts?sensorType=TEMPERATURE`

## 5) Tokens
- Farmer token: `localStorage.getItem('token')`
- Admin token: `localStorage.getItem('adminToken')`

## 6) Notes & tips
- If admin routes 404, ensure server mounted `/api/admin/sensors` and use admin token.
- SMS/Email may be disabled in dev; alerts still log and send in‑app notifications.
- If you previously deleted rows, registration realigns `FARMER_SEQ` to `MAX(farmer_id)+1`.

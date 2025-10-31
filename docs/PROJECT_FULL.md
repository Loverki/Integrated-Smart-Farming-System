# Integrated Smart Farming System (ISFS)

A full‑stack Oracle + Node.js + React platform for farm operations, sensor telemetry, automated alerts, and admin analytics.

- Authors: Rohan, Gaurav Singh
- Department: Computer Science
- Date: October 29, 2025

---

## 1) Executive Summary
ISFS unifies farmer operations (farms, crops, labour, equipment, fertilizers, sales) with telemetry ingestion (temperature, humidity, soil moisture/pH, light). It provides per‑farmer thresholds, automated alerts with delivery audit, and administrator analytics/exports. The backend is powered by Oracle (sequences, constraints, triggers, views) and the frontend is a React application with protected routes and dashboards.

---

## 2) Goals and Scope
- Replace fragmented, manual tools with a single platform.
- Reduce risk through threshold‑driven alerts.
- Improve visibility using curated KPIs and CSV exports.
- Scope includes auth, CRUD modules, telemetry ingestion, thresholds/alerts, analytics, and deployment.

---

## 3) Architecture
### 3.1 Component View
- Frontend: React (protected routes, dashboards, thresholds editor, submit readings)
- Backend: Node.js (Express), modular routes/services, optional cron (weather)
- Database: Oracle (sequences, triggers, constraints, analytics views)

### 3.2 Deployment View
- Dev: React dev server; Node server; Oracle (local/remote)
- Prod: Node behind reverse proxy; Oracle DB managed; env‑based config

### 3.3 Data Flow (High‑Level)
```
User → Frontend (React) → Backend (Express) → Oracle (SQL DDL/DML)
                                  ↑                     ↓
                            JSON Responses        Views/Aggregates
```

---

## 4) Security Model
- Authentication: JWT tokens
- Authorization: role claims (`farmer`, `admin`)
- Ownership checks: Farmer endpoints verify `farmId` belongs to the token farmer
- Secret handling: environment variables; never commit secrets to VCS

---

## 5) Features
### 5.1 Operations Modules
- Farms, Crops, Labour, Labour Work, Equipment, Equipment Maintenance, Fertilizers, Sales
- Data validation and referential integrity across modules

### 5.2 Telemetry and Alerts
- Sensors: TEMPERATURE, HUMIDITY, SOIL_MOISTURE, SOIL_PH, LIGHT
- Thresholds per farmer/sensorType; system defaults when missing
- Status computation: NORMAL, WARNING, CRITICAL
- Alerts: `SENSOR_ALERTS` records on CRITICAL; delivery audit (in‑app; optional SMS/Email)

### 5.3 Analytics and Export
- Admin stats: total readings, critical/warning counts, distribution by type
- CSV export endpoint for sensor readings

---

## 6) API Surface
> Base URL: `http://localhost:5000/api`

### 6.1 Auth
- `POST /auth/login` → `{ token, farmerId, name }`
- `POST /admin/login` → `{ token }`

### 6.2 Sensors (Farmer)
- `POST /sensors/reading`
- `GET /sensors/readings?farmId?&sensorType?&startDate?&endDate?&status?`
- `GET /sensors/thresholds[?sensorType]`
- `PUT /sensors/thresholds` (body: `sensorType`, `criticalMin?`, `criticalMax?`, `useDefaults?`)

### 6.3 Sensors (Admin)
- `POST /admin/sensors/reading`
- `GET /admin/sensors/alerts?farmId?&sensorType?&startDate?&endDate?`
- `GET /admin/sensors/stats`
- `GET /admin/sensors/export` (returns CSV)

### 6.4 Operations (examples)
- `/farms`, `/crops`, `/labours`, `/labour-work`, `/equipment`, `/fertilizers`, `/sales`

---

## 7) Telemetry Flow
1. Farmer submits reading → insert into `SENSOR_DATA` (`SENSOR_DATA_SEQ.NEXTVAL`)
2. System loads thresholds (custom per farmer/sensorType, else defaults)
3. Status computed (NORMAL/WARNING/CRITICAL)
4. If CRITICAL → insert `SENSOR_ALERTS` with delivery flags; send in‑app notification (optional: SMS/Email)
5. Admin reviews alerts and stats; exports CSV when required

**Defaults**
- SOIL_MOISTURE: 20–80%  
- SOIL_PH: 5.0–8.5  
- TEMPERATURE: 5–40°C  
- HUMIDITY: 30–95%  
- LIGHT: 1000–100000 lux

---

## 8) Database Design (Oracle)
### 8.1 Core Tables
- `FARMER`, `ADMIN`, `FARM`, `CROP`, `LABOUR`, `LABOURWORK`, `EQUIPMENT`, `EQUIPMENT_MAINTENANCE`, `FERTILIZER`, `SALES`
- `WEATHER_DATA`, `WEATHER_ALERT`, `ALERT_PREFERENCES`

### 8.2 Telemetry Tables
- `SENSOR_DATA` (readings)
- `SENSOR_THRESHOLDS` (per farmer/sensorType)
- `SENSOR_ALERTS` (critical events + delivery audit)

### 8.3 Sequences
`FARMER_SEQ`, `FARM_SEQ`, `CROP_SEQ`, `LABOUR_SEQ`, `SALES_SEQ`, `FERTILIZER_SEQ`, `ADMIN_SEQ`, `WEATHER_SEQ`, `EQUIPMENT_SEQ`, `MAINTENANCE_SEQ`, `WEATHER_ALERT_SEQ`, `ALERT_PREF_SEQ`, `SENSOR_DATA_SEQ`, `SENSOR_THRESHOLD_SEQ`, `SENSOR_ALERT_SEQ`

### 8.4 Triggers
- `TRG_FARM_INSERT`, `TRG_FARM_UPDATE`, `TRG_FARM_DELETE`  
Maintain `FARMER.TOTAL_FARMS` and `FARMER.TOTAL_AREA` automatically.

### 8.5 Views
- `FARMER_DASHBOARD`, `FARM_PERFORMANCE`, `CROP_ANALYTICS`, `MONTHLY_REVENUE`

### 8.6 Data Dictionary (Selected)
| Table | Column | Description |
|---|---|---|
| FARMER | farmer_id (PK) | sequence‑backed ID |
| FARMER | phone (UNQ) | unique contact |
| FARM | farm_id (PK), farmer_id (FK) | farm + owner |
| CROP | crop_id (PK), farm_id (FK) | crop + parent farm |
| SENSOR_DATA | sensor_id (PK) | unique reading ID |
| SENSOR_THRESHOLDS | threshold_id (PK) | per farmer/sensorType |
| SENSOR_ALERTS | alert_id (PK) | alert audit with delivery flags |

---

## 9) Example Requests
### 9.1 Submit Reading (Farmer)
```http
POST /api/sensors/reading
Authorization: Bearer <token>
Content-Type: application/json

{
  "farmId": 1,
  "sensorType": "TEMPERATURE",
  "value": 45,
  "unit": "°C",
  "notes": "critical test"
}
```

### 9.2 Set Thresholds (Farmer)
```http
PUT /api/sensors/thresholds
Authorization: Bearer <token>
Content-Type: application/json

{
  "sensorType": "SOIL_MOISTURE",
  "criticalMin": 25,
  "criticalMax": 60
}
```

### 9.3 Admin Alerts Query
```http
GET /api/admin/sensors/alerts?sensorType=TEMPERATURE&startDate=2025-10-01
Authorization: Bearer <adminToken>
```

---

## 10) Deployment
### 10.1 Database Initialization
Run once:
```sql
@ISFS_backend/database/final_setup.sql
```

### 10.2 Backend
```bash
cd ISFS_backend
cp .env.example .env   # set Oracle credentials + JWT_SECRET
npm i
npm run dev
```

### 10.3 Frontend
```bash
cd ISFS_frontend
npm i
npm start
```

---

## 11) Testing
### 11.1 Positive Cases
- Auth success → token issued
- CRUD modules operate with valid input
- Thresholds upsert works (insert/update)
- Critical alert creation on out‑of‑range readings
- CSV export downloaded and opens in spreadsheet tools

### 11.2 Negative Cases
- 403 when farmer uses `farmId` not owned
- 400 for invalid `sensorType`
- 400 for `criticalMin > criticalMax`
- 409 when unique constraints (e.g., phone) are violated

---

## 12) Performance Engineering
- Indexes: FK columns (`farm_id`, `farmer_id`), compound (`farm_id`, `recorded_date`), filters on (`sensor_type`, `status`)
- Views: offload aggregation from client
- Logging: key events (ingest, alerts, deliveries) to trace bottlenecks

---

## 13) Governance and Compliance
- Data ownership: farmer data is farmer‑owned; admins view aggregates and alerts for oversight
- Minimal retention of sensitive fields (contact info)
- Secrets in environment only; rotate on suspicion/leak

---

## 14) Cost–Benefit (Illustrative)
| Item | Annual | Notes |
|---|---|---|
| Hosting | Moderate | Oracle + Node sized to load |
| Alerts | Variable | In‑app free; optional SMS/Email costs |
| Labour Savings | Significant | Less manual collation |
| Yield Protection | Significant | Earlier action on stress events |

---

## 15) Maintenance and Upgrades
- Prefer additive schema changes
- Versioned APIs; staged rollout (dev → staging → prod)
- Scheduled backups; quarterly restore drills

---

## 16) Future Work
- Multi‑DB dialects (PostgreSQL/MySQL)
- Rule‑based anomaly detection and seasonal profiles
- Real‑time dashboards (streams) and map overlays
- Multi‑tenant hierarchy for cooperatives/agribusiness

---

## 17) Quick Reference
- Base URL: `http://localhost:5000/api`
- Auth: `POST /auth/login`, `POST /admin/login`
- Farmer sensors: `POST /sensors/reading`, `GET /sensors/readings`, `GET/PUT /sensors/thresholds`
- Admin sensors: `POST /admin/sensors/reading`, `GET /admin/sensors/alerts|stats|export`
- Ops: `/farms`, `/crops`, `/labours`, `/labour-work`, `/equipment`, `/fertilizers`, `/sales`

---

## 18) Changelog (high‑level)
- v1.0: Initial consolidated schema; telemetry + thresholds + alerts; admin stats + CSV

---

## 19) License / Credits
- Educational project (DBMS course). Consult data privacy regulations for production use.

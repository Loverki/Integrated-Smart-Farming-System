# ⚡ Quick Start Guide - ISFS

## 🚀 Get Started in 5 Minutes

### Step 1: Database Setup (2 minutes)
```bash
# Connect to Oracle
sqlplus username/password@database

# Run these in order:
@ISFS_backend/database/enhanced_schema.sql
@ISFS_backend/database/farmer_farm_triggers.sql
@ISFS_backend/database/sample_data.sql
```

### Step 2: Backend Setup (1 minute)
```bash
cd ISFS_backend
npm install
```

Create `.env`:
```env
DB_USER=your_username
DB_PASSWORD=your_password
DB_CONNECT_STRING=localhost:1521/XEPDB1
JWT_SECRET=your_secret_key_here
PORT=5000
```

Start server:
```bash
npm start
```

### Step 3: Frontend Setup (1 minute)
```bash
cd ISFS_frontend
npm install
npm run dev
```

### Step 4: Login (1 minute)
Open http://localhost:5173

**Default Admin:**
- Username: `admin`
- Password: `admin123`

**Create Farmer Account:**
- Click Register
- Fill in details
- Login

---

## 📋 Common Tasks

### Add a Farm
1. Login as Farmer
2. Go to Farms → Add Farm
3. Fill details
4. Submit
5. ✅ `total_farms` and `total_area` update automatically!

### Add a Crop
1. Go to Crops → Add Crop
2. Select farm
3. Enter crop details
4. ⚠️ Ensure harvest date > sowing date
5. Submit

### Update Crop After Harvest
1. Go to Crops
2. Click Edit on crop
3. Fill Actual Harvest Date
4. Enter Actual Yield
5. Change status to "HARVESTED"
6. Save

### View Analytics
1. Dashboard → Analytics
2. Select date range
3. View reports

---

## 🛠️ Quick Fixes

### Farmer Totals Wrong?
```bash
cd ISFS_backend
node database/setup-triggers-simple.js
```

### Can't Edit Crops?
```bash
# Restart backend
cd ISFS_backend
npm start
```

### Date Validation Not Working?
```bash
# Server restart required
cd ISFS_backend
npm start
```

---

## 📊 Test Everything Works

### Test 1: Farmer Totals Auto-Update
```sql
-- Check current totals
SELECT farmer_id, total_farms, total_area FROM FARMER WHERE farmer_id = 1;

-- Add a test farm
INSERT INTO FARM (farm_id, farmer_id, farm_name, area, location)
VALUES (999, 1, 'Test Farm', 100, 'Test Location');

-- Check totals updated
SELECT farmer_id, total_farms, total_area FROM FARMER WHERE farmer_id = 1;
-- Should see +1 farm and +100 area

-- Clean up
DELETE FROM FARM WHERE farm_id = 999;
```

### Test 2: Date Validation
1. Go to Add Crop
2. Set Sowing Date: Today
3. Try Expected Harvest: Yesterday
4. Should show error ✅

### Test 3: Crop Editing
1. Go to Crops
2. Click Edit on any crop
3. Should open edit form ✅

---

## 🔑 Important Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/register` | POST | Register farmer |
| `/api/auth/login` | POST | Login |
| `/api/farms` | GET/POST | Manage farms |
| `/api/crops` | GET/POST | Manage crops |
| `/api/crops/:id` | GET/PUT | Edit single crop |
| `/api/admin/login` | POST | Admin login |

---

## 💡 Pro Tips

1. **Always restart backend** after database changes
2. **Use admin panel** for quick data fixes
3. **Check browser console** for frontend errors
4. **Check terminal** for backend errors
5. **Triggers run automatically** - no manual updates needed

---

## 🆘 Emergency Commands

**Reset Database:**
```bash
sqlplus username/password@database
@ISFS_backend/database/enhanced_schema.sql
@ISFS_backend/database/farmer_farm_triggers.sql
```

**Fix Farmer Totals:**
```bash
cd ISFS_backend
node database/setup-triggers-simple.js
```

**Fresh Start Backend:**
```bash
cd ISFS_backend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

**Need more help?** See [README.md](./README.md) for full documentation


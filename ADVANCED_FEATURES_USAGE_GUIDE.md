# Advanced DBMS Features - Usage Guide

## Quick Start Guide

This guide will help you navigate and use the newly implemented advanced DBMS features in the Smart Farming System.

---

## 1. Farm Overview SQL Visualization

### How to Access
1. Log in to your farmer dashboard
2. You'll see the "Farm Overview" section at the top
3. Click the **"View SQL Queries"** button

### What You'll See
- **Total Farms Query** - Shows how we count your farms
- **Total Crops Query** - Displays the JOIN operation to count crops
- **Total Revenue Query** - Demonstrates revenue aggregation
- **Average Yield Query** - Shows yield calculation logic

### Educational Value
- Learn how JOINs work in practice
- Understand aggregate functions (COUNT, SUM, AVG)
- See how data is filtered by your farmer_id for security

---

## 2. Database Views Analytics

### How to Access
1. From Dashboard → Click **"Database Views"** card
2. Or navigate to: `/database-views`

### Available Views

#### 🧑‍🌾 FARMER_DASHBOARD
- **Purpose**: Complete farmer statistics overview
- **What it shows**:
  - Total farms and area
  - Total crops and yield
  - Revenue and selling prices
- **How to use**: Click "Execute View →" button
- **Watch**: SQL query execution in real-time on the right panel

#### 🏡 FARM_PERFORMANCE
- **Purpose**: Analyze individual farm profitability
- **What it shows**:
  - Farm area and soil type
  - Crop counts and yield efficiency
  - Revenue vs costs breakdown
- **Best for**: Comparing farm performance

#### 🌾 CROP_ANALYTICS
- **Purpose**: Crop-wise performance metrics
- **What it shows**:
  - Average, min, max yields per crop type
  - Revenue by crop type
  - Average growth duration
- **Best for**: Deciding which crops to plant

#### 💰 MONTHLY_REVENUE
- **Purpose**: Track revenue trends over time
- **What it shows**:
  - Monthly sales totals
  - Number of sales per month
  - Average prices
- **Best for**: Financial planning and analysis

### Using the Views
1. Click on any view card
2. Watch the query execution steps:
   - ⏸️ Preparation
   - ⏳ Execution
   - ✅ Results fetched
3. View results in the table below
4. Check execution time in the top-right corner

---

## 3. Stored Procedures Execution

### How to Access
1. From Dashboard → Click **"Stored Procedures"** card
2. Or navigate to: `/stored-procedures`

### Procedure 1: Calculate Farm Profitability

#### Purpose
Automatically calculate revenue, costs, and profit for any farm

#### How to Use
1. Select a farm from the dropdown
2. Click **"Execute Procedure"**
3. Watch the SQL visualization:
   - Procedure call
   - Revenue calculation from SALES
   - Cost calculation (fertilizer + labour)
   - Final profit computation

#### Results Display
- **Revenue** (green): Total income from sales
- **Costs** (red): Total expenses
- **Profit** (blue): Revenue minus costs
- **Profit Margin**: Percentage profitability

#### When to Use
- Monthly financial reviews
- Farm performance comparison
- Investment decision-making

### Procedure 2: Update Crop Status

#### Purpose
Change crop status with automatic data validation

#### How to Use
1. Select a crop from dropdown
2. Choose new status:
   - PLANTED
   - GROWING
   - MATURE
   - HARVESTED
   - DAMAGED
3. (Optional) Enter actual yield in kg
4. (Optional) Enter harvest date
5. Click **"Execute Procedure"**

#### Before/After Comparison
- See old status vs new status
- Compare expected vs actual yield
- Track harvest dates

#### When to Use
- When crop reaches new growth stage
- After harvesting
- When recording actual yields

---

## 4. Database Functions

### How to Access
1. From Dashboard → Click **"Database Functions"** card (Triggers or Security Info buttons)
2. Or navigate to: `/functions`

### GET_FARMER_STATS Function

#### Purpose
Get formatted statistics string about your farming operation

#### How to Use
1. Click **"Execute Function"**
2. Watch the function execution:
   - Farm count query
   - Crop count query
   - Revenue sum query
   - String formatting

#### Results
- **Return Value**: Formatted string like "Farms: 3, Crops: 12, Revenue: $45,200"
- **Detailed Breakdown**: Visual cards showing each metric
- **Performance Info**: Why functions are faster than multiple queries

#### Function vs Procedure
Learn the differences:
| Feature | Function | Procedure |
|---------|----------|-----------|
| Return Value | ✓ Required | Optional |
| Use in SELECT | ✓ Yes | ✗ No |
| Transaction Control | Limited | ✓ Full |
| DML Operations | Limited | ✓ Full |

---

## SQL Query Visualization Guide

### Understanding the Visualizer

#### Status Indicators
- ⏸️ **Pending** - Waiting to execute
- ⏳ **Executing** - Currently running (with progress bar)
- ✅ **Success** - Completed successfully
- ❌ **Error** - Failed (with error message)

#### Query Information
Each query block shows:
1. **Type** - What kind of query (VALIDATION, EXECUTION, etc.)
2. **Description** - Plain English explanation
3. **SQL Code** - Actual query with syntax highlighting
4. **Execution Time** - How long it took (in milliseconds)

#### Reading the SQL Code
- **Green text on black background** - Easy to read syntax
- **Comments** - Explain what's happening
- **Formatted** - Indented for clarity

---

## Best Practices

### For Learning
1. **Read the SQL before executing** - Understand what will happen
2. **Watch execution steps** - See how queries run in sequence
3. **Check execution times** - Learn about performance
4. **Read DBMS concepts sections** - Educational content at bottom of each page

### For Production Use
1. **Execute views regularly** - Keep track of your farm performance
2. **Use profitability procedure** - Monthly financial reviews
3. **Update crop status** - Keep data current
4. **Compare results** - Make data-driven decisions

### Performance Tips
1. Views are pre-computed - Fast execution
2. Procedures reduce network calls - More efficient
3. Functions cache results - Reusable
4. All queries use indexes - Optimized

---

## Navigation Tips

### From Dashboard
- **Quick Actions** section for common tasks
- **Advanced DBMS Features** section for analytics
- **Farm Overview** with SQL query button

### Breadcrumb Navigation
- Every page has "← Back to Dashboard" button
- Modal windows can be closed with X button
- Click outside modals to close

### Keyboard Shortcuts
- **Esc** - Close modals (if implemented)
- **Tab** - Navigate between form fields
- **Enter** - Submit forms

---

## Troubleshooting

### "No data available"
- **Cause**: No records in database for that view
- **Solution**: Add data (farms, crops, sales) first

### "Unauthorized" Error
- **Cause**: Not logged in or session expired
- **Solution**: Log out and log back in

### "Failed to fetch" Error
- **Cause**: Backend server not running
- **Solution**: Check if backend is started on port 5000

### Slow Execution
- **Cause**: Large dataset or network delay
- **Normal**: Views might take 1-3 seconds with lots of data
- **If > 5 seconds**: Check database connection

---

## Learning Resources

### Understanding Database Views
- **What**: Saved SQL queries that act like virtual tables
- **Why**: Simplify complex queries, improve security
- **How**: Pre-defined JOINs and aggregations

### Understanding Stored Procedures
- **What**: Saved programs that execute on database server
- **Why**: Encapsulate business logic, improve performance
- **How**: Execute complex operations with one call

### Understanding Functions
- **What**: Programs that return a single value
- **Why**: Reusable calculations, use in SELECT statements
- **How**: Take inputs, process, return output

### SQL Concepts Demonstrated
1. **JOINs** - Combine data from multiple tables
2. **Aggregations** - COUNT, SUM, AVG calculations
3. **Filtering** - WHERE clauses for security
4. **Null Handling** - NVL for default values
5. **Date Functions** - Date calculations and formatting

---

## Advanced Usage

### Exporting Data
- Copy results from tables
- Take screenshots of visualizations
- Use browser dev tools to export JSON

### Comparing Farms
1. Execute FARM_PERFORMANCE view
2. Look at yield_efficiency column
3. Compare revenue per area
4. Identify best-performing farms

### Financial Analysis
1. Run MONTHLY_REVENUE view
2. Track trends over months
3. Use profitability procedure per farm
4. Calculate ROI

### Crop Planning
1. Check CROP_ANALYTICS view
2. See which crops have best yields
3. Compare average prices
4. Plan next season plantings

---

## Support

### If You Need Help
1. Check this guide first
2. Look at DBMS concepts sections on each page
3. Read error messages carefully
4. Check console for technical details

### Reporting Issues
When reporting problems, include:
- Which page/feature
- What you were trying to do
- Error message (if any)
- Screenshot of SQL visualizer

---

## Summary

### Key Features
✓ Real-time SQL query visualization  
✓ Interactive database views  
✓ Automated procedures for calculations  
✓ Reusable functions  
✓ Educational DBMS content  
✓ Professional UI/UX  

### What You Can Do
- Analyze farm performance
- Calculate profitability automatically
- Track crop yields and revenue
- Update crop status with validation
- Learn SQL and DBMS concepts
- Make data-driven farming decisions

### Navigation Flow
```
Dashboard
  ├─ Farm Overview (with SQL modal)
  ├─ Database Views (/database-views)
  │   ├─ Farmer Dashboard View
  │   ├─ Farm Performance View
  │   ├─ Crop Analytics View
  │   └─ Monthly Revenue View
  ├─ Stored Procedures (/stored-procedures)
  │   ├─ Calculate Profitability
  │   └─ Update Crop Status
  └─ Functions (/functions)
      └─ GET_FARMER_STATS
```

---

**Happy Farming! 🌾**

For technical documentation, see `ADVANCED_DBMS_IMPLEMENTATION_SUMMARY.md`


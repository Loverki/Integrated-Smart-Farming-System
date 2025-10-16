# 🌾 Integrated Smart Farming System - Complete DBMS Project

## 📋 Project Overview

This is a comprehensive **Frontend + Backend + Database Management System (DBMS)** project that demonstrates advanced database concepts including **DDL, DML, TCL, Views, Joins, Stored Procedures, and Triggers**. The system provides a complete smart farming management solution with both farmer and admin interfaces.

## 🎯 Key Features Implemented

### 1. **Enhanced Database Schema**
- **15+ Tables** with comprehensive relationships
- **Advanced DBMS Concepts**: DDL, DML, TCL, Views, Joins, Stored Procedures, Triggers
- **Data Integrity**: Foreign keys, constraints, indexes
- **Scalable Design**: Sequences, triggers for automation

### 2. **Authentication System**
- **Farmer Authentication**: Phone-based login with JWT tokens
- **Admin Authentication**: Username-based admin login
- **Role-based Access**: Different permissions for farmers and admins
- **Secure Password Handling**: bcrypt hashing

### 3. **Farmer Dashboard**
- **Comprehensive Farm Management**: Multi-farm tracking
- **Crop Lifecycle Management**: Planting to harvesting
- **Financial Analytics**: Revenue, cost tracking, profit calculations
- **Labour Management**: Work hours, skills, wage calculations
- **Equipment Tracking**: Inventory, maintenance schedules
- **Real-time Statistics**: Live dashboard with key metrics

### 4. **Admin Dashboard**
- **System-wide Analytics**: Complete platform overview
- **Database Administration**: Query execution, view management
- **User Management**: Farmer and admin user oversight
- **System Monitoring**: Health checks, performance metrics
- **Advanced Reporting**: Comprehensive business insights

## 🗄️ Database Structure

### Core Tables
1. **FARMER** - Enhanced farmer information with authentication
2. **ADMIN** - Admin user management
3. **FARM** - Detailed farm information with soil analysis
4. **CROP** - Comprehensive crop tracking
5. **LABOUR** - Labour management with skills and rates
6. **LABOURWORK** - Work logs and time tracking
7. **EQUIPMENT** - Equipment inventory and maintenance
8. **FERTILIZER** - Fertilizer application tracking
9. **PESTICIDE** - Pest and disease control
10. **IRRIGATION** - Water usage and irrigation management
11. **SALES** - Sales and revenue tracking
12. **WEATHER_DATA** - Weather monitoring integration
13. **SOIL_ANALYSIS** - Soil health tracking
14. **EQUIPMENT_MAINTENANCE** - Maintenance scheduling
15. **CROP_DISEASES** - Disease and pest management

### Advanced DBMS Features

#### **Database Views**
- `FARMER_DASHBOARD` - Comprehensive farmer statistics
- `FARM_PERFORMANCE` - Farm efficiency metrics
- `CROP_ANALYTICS` - Crop performance analysis
- `MONTHLY_REVENUE` - Revenue trends
- `COST_ANALYSIS` - Cost breakdown and profit calculations

#### **Stored Procedures**
- `CALCULATE_FARM_PROFITABILITY` - Automated profit calculations
- `UPDATE_CROP_STATUS` - Crop status management
- `GET_FARMER_STATS` - Statistical analysis

#### **Triggers**
- `UPDATE_FARMER_STATS` - Automatic farmer statistics updates
- `LOG_FARM_ACTIVITY` - Activity logging system

#### **Complex Joins**
- Multi-table joins for comprehensive analytics
- Performance-optimized queries with proper indexing
- Real-time data aggregation

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **Oracle Database** (or compatible database)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Integrated-Smart-Farming-System
   ```

2. **Backend Setup**
   ```bash
   cd ISFS_backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ISFS_frontend
   npm install
   ```

4. **Database Setup**
   - Run the `enhanced_schema.sql` script in your Oracle database
   - Update the `.env` file with your database credentials

5. **Environment Configuration**
   ```bash
   # ISFS_backend/.env
   DB_USER=your_oracle_username
   DB_PASSWORD=your_oracle_password
   DB_CONNECT_STRING=localhost:1521/XE
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd ISFS_backend
   npm start
   ```

2. **Start Frontend Development Server**
   ```bash
   cd ISFS_frontend
   npm run dev
   ```

3. **Access the Application**
   - **Home Page**: http://localhost:5173
   - **Farmer Login**: http://localhost:5173/login
   - **Admin Login**: http://localhost:5173/admin-login

## 🔧 Technical Implementation

### Backend Architecture
- **Express.js** with ES6 modules
- **Oracle Database** integration with oracledb driver
- **JWT Authentication** with role-based access
- **RESTful API** design
- **Error Handling** and logging
- **Database Connection Pooling**

### Frontend Architecture
- **React.js** with functional components
- **React Router** for navigation
- **Axios** for API communication
- **Tailwind CSS** for styling
- **Responsive Design** for all devices
- **State Management** with React hooks

### Database Design
- **Normalized Schema** (3NF compliance)
- **Foreign Key Relationships** for data integrity
- **Indexes** for performance optimization
- **Sequences** for primary key generation
- **Constraints** for data validation

## 📊 DBMS Concepts Demonstrated

### 1. **DDL (Data Definition Language)**
- `CREATE TABLE` - Table creation with constraints
- `ALTER TABLE` - Schema modifications
- `DROP TABLE` - Table deletion
- `CREATE INDEX` - Performance optimization
- `CREATE SEQUENCE` - Auto-increment fields

### 2. **DML (Data Manipulation Language)**
- `INSERT` - Data insertion with sequences
- `UPDATE` - Data modifications
- `DELETE` - Data deletion with cascading
- `SELECT` - Complex queries with joins

### 3. **TCL (Transaction Control Language)**
- `COMMIT` - Transaction finalization
- `ROLLBACK` - Transaction rollback
- `SAVEPOINT` - Transaction checkpoints

### 4. **Advanced Features**
- **Views** - Pre-computed queries for analytics
- **Stored Procedures** - Complex business logic
- **Triggers** - Automated responses to events
- **Joins** - INNER, OUTER, CROSS joins
- **Aggregation** - GROUP BY, HAVING clauses
- **Subqueries** - Nested query execution

## 🎨 User Interface Features

### Farmer Interface
- **Modern Dashboard** with real-time statistics
- **Intuitive Navigation** with feature cards
- **Form Validation** and error handling
- **Responsive Design** for mobile devices
- **Quick Actions** for common tasks
- **Visual Analytics** with charts and graphs

### Admin Interface
- **System Overview** with key metrics
- **Database Administration** tools
- **User Management** capabilities
- **System Monitoring** dashboard
- **Advanced Analytics** and reporting
- **Security Management** features

## 📈 Analytics and Reporting

### Farmer Analytics
- **Farm Performance** metrics
- **Crop Yield** analysis
- **Financial Reports** with profit/loss
- **Cost Breakdown** by category
- **Trend Analysis** over time
- **Comparative Studies** between farms

### Admin Analytics
- **System-wide Statistics**
- **User Activity** monitoring
- **Database Performance** metrics
- **Revenue Analytics** across all farmers
- **Growth Tracking** and trends
- **System Health** monitoring

## 🔐 Security Features

- **JWT Token Authentication**
- **Password Hashing** with bcrypt
- **Role-based Access Control**
- **Input Validation** and sanitization
- **SQL Injection Prevention**
- **CORS Configuration**
- **Environment Variable Protection**

## 📱 Responsive Design

- **Mobile-first** approach
- **Tablet Optimization**
- **Desktop Enhancement**
- **Cross-browser Compatibility**
- **Progressive Web App** features
- **Offline Capabilities** (planned)

## 🚀 Future Enhancements

### Planned Features
- **Real-time Notifications**
- **Mobile App** development
- **IoT Integration** for sensors
- **Weather API** integration
- **Machine Learning** predictions
- **Advanced Reporting** with charts
- **Export Functionality** (PDF, Excel)
- **Multi-language Support**

### Database Optimizations
- **Query Optimization**
- **Index Tuning**
- **Partitioning** for large datasets
- **Caching** implementation
- **Backup and Recovery** automation
- **Performance Monitoring**

## 📚 Learning Outcomes

This project demonstrates:

1. **Database Design** - Normalization, relationships, constraints
2. **SQL Mastery** - Complex queries, joins, subqueries
3. **Database Administration** - Views, procedures, triggers
4. **Full-stack Development** - Frontend, backend, database integration
5. **API Design** - RESTful services, authentication, error handling
6. **Modern Web Development** - React, Node.js, responsive design
7. **Project Management** - Planning, implementation, testing
8. **Documentation** - Comprehensive project documentation

## 🎓 Educational Value

This project serves as an excellent example of:
- **Real-world Application** of DBMS concepts
- **Industry-standard** practices and patterns
- **Scalable Architecture** design
- **Professional Development** workflow
- **Comprehensive Testing** strategies
- **Documentation Standards**

## 📞 Support and Contact

For questions, issues, or contributions:
- **Documentation**: Check this README and code comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Contributions**: Fork the repository and submit pull requests

## 📄 License

This project is created for educational purposes and demonstrates advanced DBMS concepts in a real-world application scenario.

---

**🌟 This project showcases the power of modern database management systems in solving real-world agricultural challenges while providing a comprehensive learning experience in full-stack development and database administration.**

import oracledb from "oracledb";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Admin user details
const adminUsers = [
  {
    username: "admin",
    email: "admin@isfs.com",
    password: "admin123",
    fullName: "System Administrator",
    role: "SUPER_ADMIN"
  },
  {
    username: "manager",
    email: "manager@isfs.com",
    password: "manager123",
    fullName: "System Manager",
    role: "MANAGER"
  }
];

async function createAdminUsers() {
  let connection;

  try {
    // Connect to database
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionString: process.env.DB_CONNECT_STRING,
    });

    console.log("✅ Connected to database");
    console.log("\n🔐 Creating admin users...\n");

    for (const admin of adminUsers) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      // Insert admin user
      const result = await connection.execute(
        `INSERT INTO ADMIN (
          admin_id,
          username,
          email,
          password,
          full_name,
          role,
          created_date,
          status
        ) VALUES (
          ADMIN_SEQ.NEXTVAL,
          :username,
          :email,
          :password,
          :fullName,
          :role,
          SYSDATE,
          'ACTIVE'
        )`,
        {
          username: admin.username,
          email: admin.email,
          password: hashedPassword,
          fullName: admin.fullName,
          role: admin.role
        },
        { autoCommit: false }
      );

      console.log(`✅ Created admin user: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${admin.password}`);
      console.log(`   Role: ${admin.role}`);
      console.log();
    }

    // Commit the transaction
    await connection.commit();
    console.log("✅ All admin users created successfully!\n");

    // Verify admin users
    const verifyResult = await connection.execute(
      `SELECT admin_id, username, email, full_name, role, status, created_date
       FROM ADMIN
       ORDER BY admin_id`
    );

    console.log("📊 Current Admin Users:");
    console.table(
      verifyResult.rows.map((row) => ({
        ID: row[0],
        Username: row[1],
        Email: row[2],
        "Full Name": row[3],
        Role: row[4],
        Status: row[5],
        Created: row[6].toLocaleDateString()
      }))
    );

    console.log("\n⚠️  IMPORTANT: Change these default passwords after first login!\n");
    console.log("📝 Login Credentials:");
    adminUsers.forEach(admin => {
      console.log(`   Username: ${admin.username} | Password: ${admin.password}`);
    });

  } catch (err) {
    console.error("❌ Error creating admin users:", err.message);

    // Check if it's a unique constraint violation (admin already exists)
    if (err.message.includes("unique constraint")) {
      console.log("\n⚠️  Admin users might already exist. Showing existing admins:\n");
      
      try {
        const verifyResult = await connection.execute(
          `SELECT admin_id, username, email, full_name, role, status
           FROM ADMIN
           ORDER BY admin_id`
        );

        console.table(
          verifyResult.rows.map((row) => ({
            ID: row[0],
            Username: row[1],
            Email: row[2],
            "Full Name": row[3],
            Role: row[4],
            Status: row[5]
          }))
        );
      } catch (verifyErr) {
        console.error("Error verifying admins:", verifyErr.message);
      }
    }
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("\n✅ Database connection closed");
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

// Run the script
createAdminUsers();


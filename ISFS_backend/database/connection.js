import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT; // Makes query results easier to read

export async function getConnection() {
  try {
    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD, // ✅ FIXED
      connectString: process.env.DB_CONNECT_STRING,
    });

    console.log("✅ Connected to Oracle Database");
    return connection;
  } catch (err) {
    console.error("❌ Oracle DB Connection Error:", err);
    throw err;
  }
}

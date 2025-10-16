import { getConnection } from "./database/connection.js";

(async () => {
  try {
    const conn = await getConnection();
    console.log("✅ Connected to Oracle Database successfully!");
    const result = await conn.execute("SELECT * FROM Farmer");
    console.log("👩‍🌾 Farmers Data:", result.rows);
    await conn.close();
  } catch (err) {
    console.error("❌ Connection test failed:", err);
  }
})();

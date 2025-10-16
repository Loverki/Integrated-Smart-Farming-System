export const getFarmerData = async (req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM FARMERS WHERE FARMER_ID = :id`,
      [req.farmer.farmerId]
    );
    await conn.close();
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching farmer data' });
  }
};

const getAllVisitorLogs = async (req, res) => {
    try {
      console.log("Fetching all visitor logs");
      const result = await pool.query('SELECT * FROM visitor_log');
      console.log(`Found ${result.rows.length} visitor logs`);
      console.log("Sample data:", result.rows.slice(0, 2)); // Log first 2 entries
      res.json(result.rows);
    } catch (err) {
      console.error("Database query error:", err);
      res.status(500).send('Server error');
    }
  };
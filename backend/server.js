const express = require("express");
const dotenv = require("dotenv"); // Import first
const cors = require("cors");

dotenv.config({ path: "../.env" });
const pool = require("./src/config/db.js"); // Correct path

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "server is running!" });
});

// Routes BEFORE app.listen()
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "Database connection successful",
      timestamp: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// app.listen() LAST
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

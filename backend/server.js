const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// 1) Load .env from backend/.env
dotenv.config(); // <-- IMPORTANT: no { path: ... }

// 2) Then import anything that uses process.env
const authRoutes = require("./src/routes/authRoutes");
const pool = require("./src/config/db.js");
const taskRoutes = require("./src/routes/taskRoutes");
const projectRoutes = require("./src/routes/projectRoutes");

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

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});

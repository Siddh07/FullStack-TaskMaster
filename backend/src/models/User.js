const pool = require("../config/db.js"); // connection with database

const User = {
  // Method 1: Create user
  async create(userData) {
    const { name, email, password } = userData;

    const query =
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *";

    const result = await pool.query(query, [name, email, password]);
    return result.rows[0]; // return first user row
  },

  // Method 2: Find user by email
  async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  // Method 3: Find user by ID
  async findById(id) {
    const query = `
      SELECT id, name, email, created_at
      FROM users
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },
};

// Export so other files can use it
module.exports = User;

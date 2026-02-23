const pool = require("../config/db.js");

const Project = {
  // 1. GET all tasks for a user
  findAllProjects: async (userId, filters = {}) => {
    let query = `SELECT * FROM projects WHERE user_id = $1`;
    const values = [userId];
    let paramCount = 2;

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  },
};

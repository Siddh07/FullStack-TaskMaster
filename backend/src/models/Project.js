const pool = require("../config/db.js");

const Project = {
  // 1. GET all projects for a user
  findAllProjects: async (userId) => {
    const query = `SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  // 2. GET project by ID
  findById: async (id) => {
    const query = `SELECT * FROM projects WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // 3. CREATE project
  create: async (projectData) => {
    const { user_id, name, description, color } = projectData;

    const query = `
      INSERT INTO projects (user_id, name, description, color)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [user_id, name, description || null, color || "#3B82F6"];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // 4. UPDATE project
  update: async (id, projectData) => {
    const { name, description, color } = projectData;

    const query = `
      UPDATE projects SET
        name        = COALESCE($1, name),
        description = COALESCE($2, description),
        color       = COALESCE($3, color),
        updated_at  = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    const values = [name || null, description || null, color || null, id];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // 5. DELETE project
  delete: async (id) => {
    const query = `DELETE FROM projects WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },
};

module.exports = Project;

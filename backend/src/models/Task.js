const pool = require("../config/db.js");

const Task = {
  // 1. GET all tasks for a user
  findAllByUser: async (userId, filters = {}) => {
    let query = `SELECT * FROM tasks WHERE user_id = $1`;
    const values = [userId];
    let paramCount = 2;

    if (filters.status) {
      query += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.priority) {
      query += ` AND priority = $${paramCount}`;
      values.push(filters.priority);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  },

  // 2. GET one task by ID
  findById: async (id) => {
    const query = `SELECT * FROM tasks WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // 3. CREATE a new task
  create: async (taskData) => {
    const { user_id, title, description, status, priority, due_date } =
      taskData;

    const query = `
      INSERT INTO tasks (user_id, title, description, status, priority, due_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      user_id,
      title,
      description || null,
      status || "todo",
      priority || "medium",
      due_date || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // 4. UPDATE a task
  update: async (id, taskData) => {
    const { title, description, status, priority, due_date } = taskData;

    const query = `
      UPDATE tasks SET
        title       = COALESCE($1, title),
        description = COALESCE($2, description),
        status      = COALESCE($3, status),
        priority    = COALESCE($4, priority),
        due_date    = COALESCE($5, due_date),
        updated_at  = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const values = [
      title || null,
      description || null,
      status || null,
      priority || null,
      due_date || null,
      id,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // 5. DELETE a task
  delete: async (id) => {
    const query = `DELETE FROM tasks WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },
};

module.exports = Task;

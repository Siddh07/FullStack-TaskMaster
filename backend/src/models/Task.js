const pool = require("../config/db");

const Task = {
  // Get all tasks for a specific user
  findAllByUser: async (userId, filters = {}) => {
    // Start with base query
    let query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.project_id,
        t.created_at,
        t.updated_at
      FROM tasks t
      WHERE t.user_id = $1
    `;

    // Dynamic filter values
    const values = [userId];
    let paramCount = 2; // $1 is userId, next is $2

    // Add optional filters
    if (filters.status) {
      query += ` AND t.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.priority) {
      query += ` AND t.priority = $${paramCount}`;
      values.push(filters.priority);
      paramCount++;
    }

    if (filters.project_id) {
      query += ` AND t.project_id = $${paramCount}`;
      values.push(filters.project_id);
      paramCount++;
    }

    // Always sort newest first
    query += ` ORDER BY t.created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Find single task by id
  findById: async (id) => {
    const query = `
      SELECT * FROM tasks WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Create new task
  create: async (taskData) => {
    const {
      user_id,
      title,
      description,
      status,
      priority,
      due_date,
      project_id,
    } = taskData;

    const query = `
      INSERT INTO tasks 
        (user_id, title, description, status, priority, due_date, project_id)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      user_id,
      title,
      description || null,
      status || "todo",
      priority || "medium",
      due_date || null,
      project_id || null,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Update existing task
  update: async (id, taskData) => {
    const { title, description, status, priority, due_date, project_id } =
      taskData;

    const query = `
      UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        due_date = COALESCE($5, due_date),
        project_id = COALESCE($6, project_id),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    const values = [
      title,
      description,
      status,
      priority,
      due_date,
      project_id,
      id,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // Delete task
  delete: async (id) => {
    const query = `
      DELETE FROM tasks WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },
};

module.exports = Task;

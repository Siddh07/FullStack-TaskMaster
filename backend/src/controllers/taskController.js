const Task = require("../models/Task");
const pool = require("../config/db.js");

const getTaskSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT status, COUNT(*) as count
      FROM tasks
      WHERE user_id = $1
      GROUP BY status
    `;

    const result = await pool.query(query, [userId]);
    res.status(200).json({ summary: result.rows });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const fetchId = req.user.id;

    const assign_filter = {
      status: req.query.status,
      priority: req.query.priority,
    };

    const tasks = await Task.findAllByUser(fetchId, assign_filter);

    res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    // req.body → the JSON body the user sent in the POST request
    // e.g. { "title": "Buy milk", "priority": "low" }
    const { title, description, status, priority, due_date } = req.body;

    // title is required — reject immediately if missing
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Build the taskData object to pass to the model
    const taskData = {
      user_id: req.user.id, // always taken from JWT, never from body (security!)
      title,
      description,
      status,
      priority,
      due_date,
    };

    const task = await Task.create(taskData);

    // 201 = "Created" — the correct status for a new resource
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    // req.params.id → the :id part from the URL
    // e.g. PUT /api/tasks/7  →  req.params.id = "7"
    const taskId = req.params.id;

    // First check: does this task even exist?
    const existing = await Task.findById(taskId);
    if (!existing) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Second check: does this task BELONG to the logged-in user?
    // This prevents user A from editing user B's tasks (IDOR attack)
    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Pass only what the user sent — COALESCE keeps the rest unchanged
    const taskData = req.body;

    const updatedTask = await Task.update(taskId, taskData);

    res.status(200).json({ task: updatedTask });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    // Same ownership check as update
    const existing = await Task.findById(taskId);
    if (!existing) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Task.delete(taskId);

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskSummary,
};

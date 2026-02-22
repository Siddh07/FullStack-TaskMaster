const Task = require("../models/Task");

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    // req.user comes from auth middleware
    const userId = req.user.id;

    // Optional filters from query params
    // Example: /api/tasks?status=todo&priority=high
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      project_id: req.query.project_id,
    };

    const tasks = await Task.findAllByUser(userId, filters);

    return res.json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("GetTasks error:", error);
    return res.status(500).json({
      message: "Server error fetching tasks",
    });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, status, priority, due_date, project_id } =
      req.body;

    // Validate required field
    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const task = await Task.create({
      user_id: userId,
      title,
      description,
      status,
      priority,
      due_date,
      project_id,
    });

    return res.status(201).json({ task });
  } catch (error) {
    console.error("CreateTask error:", error);
    return res.status(500).json({
      message: "Server error creating task",
    });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    // First check task exists
    const existingTask = await Task.findById(taskId);

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check task belongs to this user
    if (existingTask.user_id !== userId) {
      return res.status(403).json({
        message: "Not authorized to update this task",
      });
    }

    const updatedTask = await Task.update(taskId, req.body);

    return res.json({ task: updatedTask });
  } catch (error) {
    console.error("UpdateTask error:", error);
    return res.status(500).json({
      message: "Server error updating task",
    });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;

    // Check task exists
    const existingTask = await Task.findById(taskId);

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Check task belongs to this user
    if (existingTask.user_id !== userId) {
      return res.status(403).json({
        message: "Not authorized to delete this task",
      });
    }

    await Task.delete(taskId);

    return res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DeleteTask error:", error);
    return res.status(500).json({
      message: "Server error deleting task",
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};

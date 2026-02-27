const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskSummary,
} = require("../controllers/taskController");

router.get("/summary", auth, getTaskSummary);
router.get("/", auth, getTasks);
router.post("/", auth, createTask);
router.put("/:id", auth, updateTask);
router.delete("/:id", auth, deleteTask);

module.exports = router;

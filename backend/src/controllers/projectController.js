const Project = require("../models/Project"); // capital P

// GET all projects
const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projects = await Project.findAllProjects(userId);

    res.status(200).json({
      success: true,
      message: "Projects fetched successfully",
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE project
const createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    } // ← closes here

    const projectData = {
      // ← now runs only if name exists
      user_id: req.user.id,
      name,
      description,
      color,
    };

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE project
const updateProject = async (req, res, next) => {
  try {
    const projectId = req.params.id; // ← which project to update

    const existing = await Project.findById(projectId);
    if (!existing) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedProject = await Project.update(projectId, req.body);

    res.status(200).json({
      // ← 200 not 201 for update
      success: true,
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE project
const deleteProject = async (req, res, next) => {
  try {
    const projectId = req.params.id; // ← which project to delete

    const existing = await Project.findById(projectId);
    if (!existing) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (existing.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Project.delete(projectId);

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };

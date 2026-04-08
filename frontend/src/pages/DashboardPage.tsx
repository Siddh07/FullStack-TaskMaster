import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTask, type Project, type Task } from "../context/TaskContext";

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    user,
    projects,
    tasks,
    isTasksLoading,
    loading,
    selectedProjectId,
    setSelectedProjectId,
    fetchProjects,
    fetchTasks,
    shareProject,
    createProject,
    deleteProject,
    createTask,
    toggleTask,
    deleteTask,
  } = useTask();

  const [newProjectName, setNewProjectName] = useState("");
  const [newTaskTitle, setNewTaskTitle]     = useState("");
  const [shareEmail, setShareEmail]         = useState("");
  const [sharing, setSharing]               = useState(false);

  // ── Auth guard ──────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    const hasSession = !!localStorage.getItem("userId");
    if (!user && !hasSession) navigate("/login");
  }, [user, loading, navigate]);

  // ── Auto-select first project when list loads ───────────────
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      const first = projects[0];
      setSelectedProjectId(first.id);
      fetchTasks(first.id);
    }
  }, [projects, selectedProjectId, setSelectedProjectId, fetchTasks]);

  // ── Refresh projects if we arrive with none ─────────────────
  useEffect(() => {
    if (user && projects.length === 0) fetchProjects(user.id, user.email);
  }, [user, projects.length, fetchProjects]);

  // ── Logout ──────────────────────────────────────────────────
  const handleLogout = () => {
    ["userId", "userName", "userEmail"].forEach((k) => localStorage.removeItem(k));
    navigate("/login");
  };

  // ── Handlers ────────────────────────────────────────────────
  const selectProject = (project: Project) => {
    setSelectedProjectId(project.id);
    fetchTasks(project.id);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const name = newProjectName;
    setNewProjectName("");
    await createProject(name);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const title = newTaskTitle;
    setNewTaskTitle("");
    await createTask(title);
  };

  const handleShareProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail.trim() || !selectedProjectId) return;
    setSharing(true);
    await shareProject(selectedProjectId, shareEmail.trim());
    setShareEmail("");
    setSharing(false);
  };

  // ── Derived ─────────────────────────────────────────────────
  const completedCount  = tasks.filter((t: Task) => t.completed).length;
  const pendingCount    = tasks.length - completedCount;
  const selectedProject = projects.find((p: Project) => p.id === selectedProjectId);
  const firstName       = user?.name?.split(" ")[0] ?? "";

  if (loading) {
    return (
      <div className="loading-screen">
        <span className="loading-text">Loading Workspace...</span>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          {firstName ? `${firstName}'s Workspace` : "My Workspace"}
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Navigation</span>
          <a href="#" className="sidebar-link sidebar-link--active">Dashboard</a>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() ?? "?"}</div>
            <div className="user-meta">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button id="logout-btn" onClick={handleLogout} className="btn btn-ghost btn-sm">
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────── */}
      <main className="main">
        <header className="main-header">
          <div>
            <h1 className="main-title">Dashboard</h1>
            <p className="main-sub">Welcome back, {firstName || "there"}.</p>
          </div>
        </header>

        <div className="workspace">
          {/* ── Projects Panel ───────────────────────────────── */}
          <section className="panel panel-projects">
            <div className="panel-header">
              <h2 className="panel-title">Projects</h2>
              <span className="panel-count">{projects.length}</span>
            </div>

            <form onSubmit={handleCreateProject} className="inline-form">
              <input
                id="new-project-input"
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="New project name"
                className="field-input field-input--sm"
              />
              <button
                id="create-project-btn"
                type="submit"
                disabled={!newProjectName.trim()}
                className="btn btn-primary btn-sm"
              >
                Add
              </button>
            </form>

            {projects.length === 0 ? (
              <p className="empty-msg">No projects yet.</p>
            ) : (
              <ul className="project-list">
                {projects.map((project: Project) => (
                  <li
                    key={project.id}
                    className={`project-row ${selectedProjectId === project.id ? "project-row--active" : ""}`}
                  >
                    <button className="project-name" onClick={() => selectProject(project)}>
                      {project.name} {project.userId !== user?.id && <span className="shared-badge">(Shared)</span>}
                    </button>
                    {project.userId === user?.id && (
                      <button
                        className="btn-icon btn-icon--danger"
                        onClick={() => deleteProject(project.id)}
                        title="Delete project"
                        aria-label={`Delete project ${project.name}`}
                      >
                        &times;
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── Tasks Panel ──────────────────────────────────── */}
          <section className="panel panel-tasks">
            {selectedProject ? (
              <>
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">
                      {selectedProject.name}
                    </h2>
                    {selectedProject.sharedWith && selectedProject.sharedWith.length > 0 && (
                      <div className="shared-with-list">
                        Shared with: {selectedProject.sharedWith.map(email => (
                          <span key={email} className="shared-user-pill" title={email}>
                            {email.split('@')[0]}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="task-stats">
                      <span className="stat">{tasks.length} total</span>
                      <span className="stat stat--done">{completedCount} done</span>
                      <span className="stat stat--pending">{pendingCount} pending</span>
                    </div>
                  </div>
                  
                  {selectedProject.userId === user?.id && (
                    <form onSubmit={handleShareProject} className="inline-form share-form">
                      <input
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="Invite via email"
                        className="field-input field-input--sm"
                        required
                      />
                      <button 
                        type="submit" 
                        disabled={!shareEmail.trim() || sharing} 
                        className="btn btn-ghost btn-sm"
                      >
                        {sharing ? "..." : "Invite"}
                      </button>
                    </form>
                  )}
                </div>

                <form onSubmit={handleCreateTask} className="inline-form">
                  <input
                    id="new-task-input"
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a task..."
                    className="field-input field-input--sm"
                  />
                  <button
                    id="create-task-btn"
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    className="btn btn-primary btn-sm"
                  >
                    Add
                  </button>
                </form>

                {isTasksLoading ? (
                  <p className="empty-msg">Loading tasks...</p>
                ) : tasks.length === 0 ? (
                  <p className="empty-msg">No tasks yet. Add one above.</p>
                ) : (
                  <ul className="task-list">
                    {tasks.map((task: Task) => (
                      <li key={task.id} className="task-row">
                        <input
                          type="checkbox"
                          id={`task-${task.id}`}
                          checked={task.completed}
                          onChange={() => toggleTask(task)}
                          className="task-checkbox"
                        />
                        <label
                          htmlFor={`task-${task.id}`}
                          className={`task-title ${task.completed ? "task-title--done" : ""}`}
                        >
                          {task.title}
                        </label>
                        <button
                          className="btn-icon btn-icon--danger"
                          onClick={() => deleteTask(task.id)}
                          title="Delete task"
                          aria-label={`Delete task ${task.title}`}
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p className="empty-state-msg">Select a project to view tasks.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

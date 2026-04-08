import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTask } from "../context/TaskContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, tasks, loading } = useTask();
  console.log("user:", user);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const completedTasks = tasks.filter((t) => t.completed);
  const pendingTasks = tasks.filter((t) => !t.completed);
  const recentTasks = tasks.slice(0, 5);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">TaskMaster</h2>

        <nav className="space-y-2 flex-1">
          <button className="w-full text-left px-3 py-2 rounded-lg bg-slate-100 font-medium">
            Overview
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100">
            Tasks
          </button>
          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100">
            Profile
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-4 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Top bar */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-slate-500 text-sm">
              Welcome back, {user?.name?.split(" ")[0] ?? "there"}. Here is your
              overview.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              + New Task
            </button>
            {/* Show user initial if available, fallback to grey circle */}
            <div className="h-10 w-10 rounded-full bg-slate-300 flex items-center justify-center text-sm font-semibold text-slate-600">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          </div>
        </header>

        {/* Stats cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Total Tasks</p>
            <p className="text-2xl font-bold mt-1">{tasks.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Completed</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">
              {completedTasks.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-2xl font-bold mt-1 text-amber-500">
              {pendingTasks.length}
            </p>
          </div>
        </section>

        {/* Recent tasks list */}
        <section className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Tasks</h2>
            <button className="px-3 py-1 text-sm border rounded-lg hover:bg-slate-50">
              View all
            </button>
          </div>

          {recentTasks.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No tasks yet. Start by creating your first task.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full flex-shrink-0 ${
                        task.completed ? "bg-emerald-500" : "bg-amber-400"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        task.completed
                          ? "line-through text-slate-400"
                          : "text-slate-700"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      task.completed
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {task.completed ? "Done" : "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

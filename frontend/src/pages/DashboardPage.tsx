// src/pages/Dashboard.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  // Simple route protection (adjust to your auth logic)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

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
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
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
              Welcome back, Siddhant. Here is your overview.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              + New Task
            </button>
            <div className="h-10 w-10 rounded-full bg-slate-300" />
          </div>
        </header>

        {/* Stats cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Total Tasks</p>
            <p className="text-2xl font-bold mt-1">24</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Completed</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">13</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-2xl font-bold mt-1 text-amber-500">11</p>
          </div>
        </section>

        {/* Recent items list */}
        <section className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Tasks</h2>
            <button className="px-3 py-1 text-sm border rounded-lg hover:bg-slate-50">
              View all
            </button>
          </div>

          <p className="text-slate-500 text-sm">
            No tasks yet. Start by creating your first task.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

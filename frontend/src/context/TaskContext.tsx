import { createContext, useContext, useState, useEffect } from "react";

// --- Types ---
interface User {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskContextType {
  user: User | null;
  tasks: Task[];
  loading: boolean;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskContext = createContext<TaskContextType | null>(null);

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true); // starts true — assume fetch is in progress
  console.log("API URL:", import.meta.env.VITE_API_URL);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false); // no token, nothing to fetch, done
      return;
    }

    const fetchMe = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();
        setUser(data.user);
        setTasks(data.tasks);
      } catch (error) {
        console.error("Auth fetch failed:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false); // always runs — success or failure
      }
    };

    fetchMe();
  }, []);

  return (
    <TaskContext.Provider value={{ user, tasks, loading, setTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTask must be used within a <TaskProvider>");
  }
  return context;
};

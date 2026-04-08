import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { api } from "../lib/api";

// ── Types ─────────────────────────────────────────────────────

export interface User    { id: string; name: string; email: string; }
export interface Project { id: string; userId: string; name: string; createdAt: string; sharedWith?: string[]; }
export interface Task    { id: string; projectId: string; title: string; completed: boolean; createdAt: string; }

interface TaskContextType {
  user: User | null;
  projects: Project[];
  tasks: Task[];
  isTasksLoading: boolean;
  loading: boolean;
  selectedProjectId: string | null;
  
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setSelectedProjectId: React.Dispatch<React.SetStateAction<string | null>>;
  
  // Data Methods
  fetchProjects: (userId: string, userEmail: string) => Promise<void>;
  fetchTasks: (projectId: string) => Promise<void>;
  clearProjectTaskCache: (projectId: string) => void;
  
  // Operations (with mutation locking)
  createProject: (name: string) => Promise<string | null>;
  deleteProject: (projectId: string) => Promise<void>;
  shareProject: (projectId: string, email: string) => Promise<boolean>;
  
  createTask: (title: string) => Promise<void>;
  toggleTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────

const TaskContext = createContext<TaskContextType | null>(null);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]                     = useState<User | null>(null);
  const [projects, setProjects]             = useState<Project[]>([]);
  const [loading, setLoading]               = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [projectTasks, setProjectTasks] = useState<Record<string, Task[]>>({});
  const fetchedRef = useRef<Set<string>>(new Set());
  
  // mutationLockRef tracks if a local user operation is in progress.
  const mutationLockRef = useRef(false);

  const tasks: Task[] = selectedProjectId
    ? (projectTasks[selectedProjectId] ?? [])
    : [];
  
  const isTasksLoading = selectedProjectId 
    ? projectTasks[selectedProjectId] === undefined 
    : false;

  // Internal updater
  const _setTasksInternal = useCallback((projectId: string, updater: Task[] | ((prev: Task[]) => Task[])) => {
    setProjectTasks((prev) => {
      const current = prev[projectId] ?? [];
      const next    = typeof updater === "function" ? updater(current) : updater;
      return { ...prev, [projectId]: next };
    });
  }, []);

  // ── fetchProjects ─────────────────────────────────────────────
  const fetchProjects = useCallback(async (userId: string, userEmail: string) => {
    try {
      const data = await api("getProjects", { userId, userEmail });
      setProjects((data.projects as Project[]) ?? []);
    } catch (err) {
      console.error("fetchProjects failed:", err);
    }
  }, []);

  // ── fetchTasks ────────────────────────────────────────────────
  const fetchTasks = useCallback(async (projectId: string) => {
    if (fetchedRef.current.has(projectId)) return;
    fetchedRef.current.add(projectId);
    try {
      const data    = await api("getTasks", { projectId });
      const fetched = (data.tasks as Task[]) ?? [];
      setProjectTasks((prev) => ({ ...prev, [projectId]: fetched }));
    } catch (err) {
      fetchedRef.current.delete(projectId);
      console.error("fetchTasks failed:", err);
    }
  }, []);

  // ── Operations ────────────────────────────────────────────────
  
  const createProject = async (name: string) => {
    if (!user) return null;
    mutationLockRef.current = true;
    const tempId = crypto.randomUUID();
    const temp: Project = { id: tempId, userId: user.id, name, createdAt: new Date().toISOString() };
    
    setProjects(prev => [...prev, temp]);
    setSelectedProjectId(tempId);
    _setTasksInternal(tempId, []);

    try {
      const data = await api("createProject", { userId: user.id, name });
      if (data.success) {
        const real = data.project as Project;
        setProjects(prev => prev.map(p => p.id === tempId ? real : p));
        setSelectedProjectId(real.id);
        return real.id;
      }
    } catch {}
    setProjects(prev => prev.filter(p => p.id !== tempId));
    mutationLockRef.current = false;
    return null;
  };

  const deleteProject = async (projectId: string) => {
    mutationLockRef.current = true;
    const snapshot = projects.find(p => p.id === projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (selectedProjectId === projectId) setSelectedProjectId(null);

    try {
      await api("deleteProject", { projectId });
    } catch {
      if (snapshot) setProjects(prev => [...prev, snapshot]);
    }
    mutationLockRef.current = false;
  };

  const shareProject = async (projectId: string, email: string) => {
    if (!user) return false;
    mutationLockRef.current = true;
    try {
      const data = await api("shareProject", { projectId, email, userId: user.id });
      if (data.success) {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, sharedWith: data.sharedWith as string[] } : p));
        return true;
      }
    } catch {}
    mutationLockRef.current = false;
    return false;
  };

  const createTask = async (title: string) => {
    if (!selectedProjectId) return;
    mutationLockRef.current = true;
    const tempId = crypto.randomUUID();
    const temp: Task = { id: tempId, projectId: selectedProjectId, title, completed: false, createdAt: new Date().toISOString() };
    _setTasksInternal(selectedProjectId, prev => [...prev, temp]);

    try {
      const data = await api("createTask", { projectId: selectedProjectId, title });
      if (data.success) {
        _setTasksInternal(selectedProjectId, prev => prev.map(t => t.id === tempId ? (data.task as Task) : t));
      }
    } catch {
      _setTasksInternal(selectedProjectId, prev => prev.filter(t => t.id !== tempId));
    }
    mutationLockRef.current = false;
  };

  const toggleTask = async (task: Task) => {
    if (!selectedProjectId) return;
    mutationLockRef.current = true;
    _setTasksInternal(selectedProjectId, prev => prev.map(t => t.id === task.id ? { ...t, completed: !task.completed } : t));

    try {
      const data = await api("updateTask", { taskId: task.id, completed: !task.completed });
      if (!data.success) throw new Error();
    } catch {
      _setTasksInternal(selectedProjectId, prev => prev.map(t => t.id === task.id ? { ...t, completed: task.completed } : t));
    }
    mutationLockRef.current = false;
  };

  const deleteTask = async (taskId: string) => {
    if (!selectedProjectId) return;
    mutationLockRef.current = true;
    const snapshot = (projectTasks[selectedProjectId] || []).find(t => t.id === taskId);
    _setTasksInternal(selectedProjectId, prev => prev.filter(t => t.id !== taskId));

    try {
      await api("deleteTask", { taskId });
    } catch {
      if (snapshot) _setTasksInternal(selectedProjectId, prev => [...prev, snapshot]);
    }
    mutationLockRef.current = false;
  };

  const clearProjectTaskCache = useCallback((projectId: string) => {
    fetchedRef.current.delete(projectId);
    setProjectTasks((prev) => {
      const next = { ...prev };
      delete next[projectId];
      return next;
    });
  }, []);

  // ── Silent Sync ───────────────────────────────────────────────
  const silentSync = useCallback(async () => {
    if (mutationLockRef.current || !user || document.hidden) return;
    try {
      const pData = await api("getProjects", { userId: user.id, userEmail: user.email });
      // Re-check lock after network call
      if (!mutationLockRef.current && pData.success) {
        setProjects(pData.projects as Project[]);
      }
      if (selectedProjectId) {
        const tData = await api("getTasks", { projectId: selectedProjectId });
        // Re-check lock after network call
        if (!mutationLockRef.current && tData.success) {
          const incoming = tData.tasks as Task[];
          setProjectTasks(prev => ({ ...prev, [selectedProjectId]: incoming }));
        }
      }
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      // Done
    }
  }, [user, selectedProjectId]);

  useEffect(() => {
    const timer = setInterval(silentSync, 10000); // 10s for stability
    return () => clearInterval(timer);
  }, [silentSync]);

  useEffect(() => {
    const userId    = localStorage.getItem("userId");
    const userName  = localStorage.getItem("userName");
    const userEmail = localStorage.getItem("userEmail");
    if (userId && userName && userEmail) {
      setUser({ id: userId, name: userName, email: userEmail });
      fetchProjects(userId, userEmail).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProjects]);

  return (
    <TaskContext.Provider
      value={{
        user, projects, tasks, isTasksLoading, loading, selectedProjectId,
        setUser, setSelectedProjectId, fetchProjects, fetchTasks, clearProjectTaskCache,
        createProject, deleteProject, shareProject, createTask, toggleTask, deleteTask
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTask must be used within a <TaskProvider>");
  return context;
};

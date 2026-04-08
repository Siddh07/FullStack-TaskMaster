import type { Task } from "../context/TaskContext";

interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="empty-msg">No tasks yet. Add one above.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className="task-row">
          <input
            type="checkbox"
            id={`tl-task-${task.id}`}
            checked={task.completed}
            onChange={() => onToggle(task)}
            className="task-checkbox"
          />
          <label
            htmlFor={`tl-task-${task.id}`}
            className={`task-title ${task.completed ? "task-title--done" : ""}`}
          >
            {task.title}
          </label>
          <button
            className="btn-icon btn-icon--danger"
            onClick={() => onDelete(task.id)}
            title="Delete task"
            aria-label={`Delete task ${task.title}`}
          >
            &times;
          </button>
        </li>
      ))}
    </ul>
  );
}

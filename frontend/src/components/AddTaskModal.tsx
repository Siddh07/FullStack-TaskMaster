import { useState } from "react";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string) => Promise<void> | void;
}

export default function AddTaskModal({ isOpen, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [busy, setBusy]   = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await onAdd(title.trim());
      setTitle("");
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal">
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">New Task</h2>
          <button
            className="btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <label className="field-label" htmlFor="modal-task-title">Task title</label>
          <input
            id="modal-task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            className="field-input"
            autoFocus
            required
          />

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              id="modal-add-task-btn"
              type="submit"
              disabled={busy || !title.trim()}
              className="btn btn-primary btn-sm"
            >
              {busy ? "Adding..." : "Add task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

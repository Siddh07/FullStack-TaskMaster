import { useState } from "react";

interface AddTaskCardProps {
  onAdd: (title: string) => Promise<void> | void;
  disabled?: boolean;
}

export default function AddTaskCard({ onAdd, disabled = false }: AddTaskCardProps) {
  const [title, setTitle]   = useState("");
  const [busy, setBusy]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await onAdd(title.trim());
      setTitle("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input
        id="add-task-card-input"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task..."
        className="field-input field-input--sm"
        disabled={disabled || busy}
      />-
      <button
        id="add-task-card-btn"
        type="submit"
        disabled={disabled || busy || !title.trim()}
        className="btn btn-primary btn-sm"
      >
        {busy ? "Adding..." : "Add"}
      </button>
    </form>
  );
}

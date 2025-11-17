import { useState } from "react";
import { Trash2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Subtask } from "@shared/schema";

interface SubtaskManagerProps {
  subtasks: Subtask[] | undefined;
  onChange: (subtasks: Subtask[]) => void;
}

export function SubtaskManager({ subtasks = [], onChange }: SubtaskManagerProps) {
  const [newSubtask, setNewSubtask] = useState("");

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;

    const updated = [
      ...subtasks,
      {
        id: `subtask-${Date.now()}`,
        title: newSubtask,
        completed: false,
      },
    ];
    onChange(updated);
    setNewSubtask("");
  };

  const handleToggleSubtask = (id: string) => {
    const updated = subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st));
    onChange(updated);
  };

  const handleDeleteSubtask = (id: string) => {
    const updated = subtasks.filter((st) => st.id !== id);
    onChange(updated);
  };

  const completedCount = subtasks.filter((st) => st.completed).length;
  const completionPercentage = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <div className="space-y-3 p-3 bg-black/5 dark:bg-white/5 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">Subtasks</h4>
        {subtasks.length > 0 && <span className="text-xs text-gray-600 dark:text-gray-400">{completionPercentage}% complete</span>}
      </div>

      {subtasks.length > 0 && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center gap-2 group">
            <button
              onClick={() => handleToggleSubtask(subtask.id)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                subtask.completed
                  ? "bg-green-500 border-green-500"
                  : "border-gray-300 dark:border-gray-600 hover:border-green-500"
              }`}
            >
              {subtask.completed && <Check className="w-3 h-3 text-white" />}
            </button>
            <span
              className={`flex-1 text-sm ${
                subtask.completed ? "line-through opacity-60" : ""
              }`}
            >
              {subtask.title}
            </span>
            <button
              onClick={() => handleDeleteSubtask(subtask.id)}
              className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add a subtask..."
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
          className="text-sm"
        />
        <Button
          onClick={handleAddSubtask}
          size="sm"
          variant="outline"
          className="flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

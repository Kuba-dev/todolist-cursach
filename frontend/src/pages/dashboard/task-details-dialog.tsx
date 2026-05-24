import { useEffect, useState } from "react";
import { CalendarClock, Sparkles, Tag, Trash, Flag } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeadlinePicker } from "@/components/ui/deadline-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  Subtask,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/shared/api/tasks";
import {
  deadlineToIso,
  formatDeadline,
  isOverdue,
  parseTags,
  priorityClasses,
  priorityLabels,
} from "./task-meta";

type UpdateTaskData = {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  priority?: TaskPriority;
  deadline?: string | null;
  status?: TaskStatus;
};

type TaskDetailsDialogProps = {
  open: boolean;
  task: Task | null;
  subtasks: Subtask[];
  onOpenChange: (open: boolean) => void;
  onSaveTask: (id: number, data: UpdateTaskData) => void;
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (subtaskId: number) => void;
  onDeleteSubtask: (subtaskId: number) => void;
};

const kanbanStatusLabels: Record<TaskStatus, string> = {
  new: "Inbox",
  doing: "In progress",
  completed: "Done",
  closed: "Closed",
};

export function TaskDetailsDialog({
  open,
  task,
  subtasks,
  onOpenChange,
  onSaveTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: TaskDetailsDialogProps) {
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [categoryDraft, setCategoryDraft] = useState("");
  const [tagsDraft, setTagsDraft] = useState("");
  const [priorityDraft, setPriorityDraft] = useState<TaskPriority>("medium");
  const [deadlineDraft, setDeadlineDraft] = useState<Date | undefined>(
    undefined,
  );
  const [statusDraft, setStatusDraft] = useState<TaskStatus>("new");
  const [subtaskDraft, setSubtaskDraft] = useState("");

  useEffect(() => {
    if (!task) return;

    setDescriptionDraft(task.description ?? "");
    setCategoryDraft(task.category ?? "");
    setTagsDraft(task.tags.join(", "));
    setPriorityDraft(task.priority);
    setDeadlineDraft(task.deadline ? new Date(task.deadline) : undefined);
    setStatusDraft(task.status);
    setSubtaskDraft("");
  }, [task]);

  const persistTask = () => {
    if (!task) return;

    onSaveTask(task.id, {
      description: descriptionDraft.trim() ? descriptionDraft : undefined,
      category: categoryDraft.trim() ? categoryDraft : undefined,
      tags: parseTags(tagsDraft),
      priority: priorityDraft,
      deadline: deadlineToIso(deadlineDraft) ?? null,
      status: statusDraft,
    });
  };

  const updateDeadline = (value?: Date) => {
    setDeadlineDraft(value);

    if (task) {
      onSaveTask(task.id, {
        deadline: deadlineToIso(value) ?? null,
      });
    }
  };

  const changeStatus = (status: TaskStatus) => {
    setStatusDraft(status);

    if (task) {
      onSaveTask(task.id, { status });
    }
  };

  const addSubtask = () => {
    if (!subtaskDraft.trim()) return;

    onAddSubtask(subtaskDraft.trim());
    setSubtaskDraft("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-4xl overflow-x-hidden overflow-y-auto border-white/10 bg-slate-950/95 p-4 text-white shadow-2xl shadow-black/60 backdrop-blur-2xl sm:w-full sm:p-6">
        <div className="pointer-events-none absolute inset-0 h-full">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.2),transparent_32%),radial-gradient(circle_at_90%_10%,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.16),transparent_30%)]" />
          <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:56px_56px]" />
        </div>
		<div className="relative max-h-[80vh] overflow-y-auto pr-2">
        {task ? (
          <>
            <div className="relative space-y-6">
              <DialogHeader>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/70 backdrop-blur-xl">
                  <Sparkles size={14} />
                  task editor
                </div>
                <DialogTitle className="text-3xl text-white md:text-4xl">
                  {task.title}
                </DialogTitle>
                <DialogDescription className="max-w-2xl text-white/60">
                  Edit the task details, move its status, and manage subtasks.
                  Everything stays inside one cinematic workspace.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
                    <Flag size={13} className="text-amber-300" />
                    Priority
                  </div>
                  <div
                    className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] ${priorityClasses[task.priority]}`}
                  >
                    {priorityLabels[task.priority]}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
                    <Tag size={13} className="text-cyan-300" />
                    Tags
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {task.tags.length > 0 ? (
                      task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[11px] text-cyan-100"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-white/35">No tags</span>
                    )}
                  </div>
                </div>

                <div
                  className={`rounded-2xl border p-3 ${task.deadline ? (isOverdue(task.deadline) && task.status !== "completed" && task.status !== "closed" ? "border-rose-400/25 bg-rose-400/10" : "border-white/10 bg-white/5") : "border-white/10 bg-white/5"}`}
                >
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/40">
                    <CalendarClock
                      size={13}
                      className={
                        task.deadline ? "text-cyan-300" : "text-white/35"
                      }
                    />
                    Deadline
                  </div>
                  <div
                    className={`mt-2 text-sm ${task.deadline ? "text-white/85" : "text-white/35"}`}
                  >
                    {formatDeadline(task.deadline) || "No deadline"}
                    {task.deadline &&
                    isOverdue(task.deadline) &&
                    task.status !== "completed" &&
                    task.status !== "closed"
                      ? " overdue"
                      : ""}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm uppercase tracking-[0.24em] text-white/50">
                      Description
                    </div>
                    <Textarea
                      value={descriptionDraft}
                      onChange={(event) =>
                        setDescriptionDraft(event.target.value)
                      }
                      onBlur={persistTask}
                      placeholder="Describe the task in more detail"
                      className="min-h-32 border-white/20 bg-white/10 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm uppercase tracking-[0.24em] text-white/50">
                        Category
                      </div>
                      <Input
                        value={categoryDraft}
                        onChange={(event) =>
                          setCategoryDraft(event.target.value)
                        }
                        onBlur={persistTask}
                        placeholder="Feature, bug, research..."
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm uppercase tracking-[0.24em] text-white/50">
                        Priority
                      </div>
                      <select
                        value={priorityDraft}
                        onChange={(event) =>
                          setPriorityDraft(event.target.value as TaskPriority)
                        }
                        onBlur={persistTask}
                        className="h-10 w-full rounded-md border border-white/20 bg-white/10 px-3 text-sm text-white outline-none transition focus:ring-2 focus:ring-white/20"
                      >
                        <option value="low" className="bg-slate-900 text-white">
                          Low priority
                        </option>
                        <option
                          value="medium"
                          className="bg-slate-900 text-white"
                        >
                          Medium priority
                        </option>
                        <option
                          value="high"
                          className="bg-slate-900 text-white"
                        >
                          High priority
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm uppercase tracking-[0.24em] text-white/50">
                        Tags
                      </div>
                      <Input
                        value={tagsDraft}
                        onChange={(event) => setTagsDraft(event.target.value)}
                        onBlur={persistTask}
                        placeholder="frontend, urgent, release"
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm uppercase tracking-[0.24em] text-white/50">
                        Deadline
                      </div>
                      <DeadlinePicker
                        value={deadlineDraft}
                        onChange={updateDeadline}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm uppercase tracking-[0.24em] text-white/50">
                      Status
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(kanbanStatusLabels).map(
                        ([status, label]) => (
                          <Button
                            key={status}
                            type="button"
                            variant={
                              statusDraft === status ? "default" : "outline"
                            }
                            onClick={() => changeStatus(status as TaskStatus)}
                            className={
                              statusDraft === status
                                ? "bg-white text-slate-950 hover:bg-white/90 hover:text-slate-950"
                                : "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                            }
                          >
                            {label}
                          </Button>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 text-sm uppercase tracking-[0.24em] text-white/50">
                      Meta
                    </div>
                    <div className="space-y-2 text-sm text-white/70">
                      <div>
                        Created at {new Date(task.createdAt).toLocaleString()}
                      </div>
                      <div>Priority: {priorityLabels[task.priority]}</div>
                      <div>Category: {task.category || "Uncategorized"}</div>
                      <div>
                        Tags:{" "}
                        {task.tags.length
                          ? task.tags.map((tag) => `#${tag}`).join(", ")
                          : "None"}
                      </div>
                      <div>
                        Deadline:{" "}
                        {formatDeadline(task.deadline) || "No deadline"}
                        {task.deadline &&
                        isOverdue(task.deadline) &&
                        task.status !== "completed" &&
                        task.status !== "closed"
                          ? " (overdue)"
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm uppercase tracking-[0.24em] text-white/50">
                          Subtasks
                        </div>
                        <div className="text-sm text-white/60">
                          {
                            subtasks.filter((subtask) => subtask.completed)
                              .length
                          }
                          /{subtasks.length} completed
                        </div>
                      </div>
                      <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/70">
                        {subtasks.length} total
                      </div>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{
                          width: subtasks.length
                            ? `${Math.round(
                                (subtasks.filter((subtask) => subtask.completed)
                                  .length /
                                  subtasks.length) *
                                  100,
                              )}%`
                            : "0%",
                        }}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={subtaskDraft}
                        onChange={(event) =>
                          setSubtaskDraft(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            addSubtask();
                          }
                        }}
                        placeholder="Add a subtask"
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
                      />
                      <Button
                        type="button"
                        onClick={addSubtask}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                      >
                        Add
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {subtasks.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-white/15 px-4 py-6 text-center text-sm text-white/50">
                          Add the first subtask to break the work down.
                        </div>
                      ) : null}

                      {subtasks.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                        >
                          <button
                            type="button"
                            onClick={() => onToggleSubtask(subtask.id)}
                            className={`h-5 w-5 rounded border transition ${subtask.completed ? "border-emerald-400 bg-emerald-400" : "border-white/25 bg-transparent"}`}
                            aria-label={
                              subtask.completed
                                ? "Mark subtask incomplete"
                                : "Mark subtask complete"
                            }
                          />
                          <div
                            className={`flex-1 text-sm ${subtask.completed ? "text-white/45 line-through" : "text-white"}`}
                          >
                            {subtask.title}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onDeleteSubtask(subtask.id)}
                            className="text-white/60 hover:bg-white/10 hover:text-red-400"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    persistTask();
                    onOpenChange(false);
                  }}
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-white/10"
                >
                  Save and close
                </Button>
              </div>
            </div>
          </>
        ) : null}
		</div>
      </DialogContent>
    </Dialog>
  );
}

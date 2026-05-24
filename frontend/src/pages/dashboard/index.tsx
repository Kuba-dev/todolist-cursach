import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subtasksApi, tasksApi, type Task, type TaskPriority, type TaskStatus } from "@/shared/api/tasks";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarClock, CheckCircle2, Flag, FolderKanban, ListTodo, SearchX, Sparkles, Tag, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CursorGlow } from "@/components/CursorGlow";
import { TaskComposer } from "./task-composer";
import { TaskDetailsDialog } from "./task-details-dialog";
import { formatDeadline, isOverdue, priorityClasses, priorityLabels } from "./task-meta";

const kanbanColumns: Array<{
  status: TaskStatus;
  title: string;
  hint: string;
  accent: string;
}> = [
  {
    status: "new",
    title: "Inbox",
    hint: "Tasks waiting to be started",
    accent: "from-slate-500/40 to-slate-500/10"
  },
  {
    status: "doing",
    title: "In progress",
    hint: "Work that is currently active",
    accent: "from-blue-500/40 to-blue-500/10"
  },
  {
    status: "completed",
    title: "Done",
    hint: "Finished tasks",
    accent: "from-emerald-500/40 to-emerald-500/10"
  },
  {
    status: "closed",
    title: "Closed",
    hint: "Completed and permanently closed tasks",
    accent: "from-pink-500/40 to-pink-500/10"
  }
];

type TaskUpdateData = {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  priority?: TaskPriority;
  deadline?: string | null;
  status?: TaskStatus;
};

export function Dashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);
  const [activeDropStatus, setActiveDropStatus] = useState<TaskStatus | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const normalizedSearch = search.trim();

  const { data } = useQuery({
    queryKey: ["tasks", normalizedSearch],
    queryFn: () => tasksApi.getAll(normalizedSearch).then((r) => r.data),
  });

  const tasks = data ?? [];
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  const { data: subtasks = [] } = useQuery({
    queryKey: ["task-subtasks", selectedTaskId],
    queryFn: () => subtasksApi.getAll(selectedTaskId as number).then((r) => r.data),
    enabled: selectedTaskId !== null,
  });
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter((task) => task.status === "doing").length;
  const finishedTasks = tasks.filter(
    (task) => task.status === "completed" || task.status === "closed"
  ).length;
  const completionRate = totalTasks ? Math.round((finishedTasks / totalTasks) * 100) : 0;
  const totalSubtasks = tasks.reduce((sum, task) => sum + (task.subtasks?.length ?? 0), 0);
  const completedSubtasks = tasks.reduce(
    (sum, task) => sum + (task.subtasks?.filter((subtask) => subtask.completed).length ?? 0),
    0
  );

  const tasksByStatus = kanbanColumns.reduce(
    (accumulator, column) => {
      accumulator[column.status] = tasks.filter((task) => task.status === column.status);

      return accumulator;
    },
    {} as Record<TaskStatus, Task[]>
  );

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const createTask = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const createQuickTask = (taskTitle: string) => {
    createTask.mutate({ title: taskTitle });
  };

  const createAdvancedTask = (data: {
    title: string;
    description?: string;
    category?: string;
    tags: string[];
    priority: TaskPriority;
    deadline?: string;
  }) => {
    createTask.mutate(data);
  };

  const deleteTask = useMutation({
    mutationFn: tasksApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateTask = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: TaskUpdateData;
    }) =>
      tasksApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const saveEdit = (id: number) => {
    if (!editingTitle.trim()) return;

    updateTask.mutate({
      id,
      data: { title: editingTitle },
    });

    setEditingId(null);
    setEditingTitle("");
  };

  const openTaskDetails = (task: Task) => {
    setSelectedTaskId(task.id);
    setDetailsOpen(true);
  };

  const closeTaskDetails = () => {
    setDetailsOpen(false);
    setSelectedTaskId(null);
  };

  const saveTask = (id: number, data: Parameters<typeof updateTask.mutate>[0] extends { data: infer T } ? T : never) => {
    updateTask.mutate({ id, data });
  };

  const addSubtask = (title: string) => {
    if (!selectedTask) return;

    subtasksApi.create(selectedTask.id, { title }).then(() => {
      qc.invalidateQueries({ queryKey: ["task-subtasks", selectedTask.id] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    });
  };

  const toggleSubtask = (subtaskId: number) => {
    if (!selectedTask) return;

    const currentSubtask = subtasks.find((subtask) => subtask.id === subtaskId);

    if (!currentSubtask) return;

    subtasksApi.update(selectedTask.id, subtaskId, { completed: !currentSubtask.completed }).then(() => {
      qc.invalidateQueries({ queryKey: ["task-subtasks", selectedTask.id] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    });
  };

  const deleteSubtask = (subtaskId: number) => {
    if (!selectedTask) return;

    subtasksApi.remove(selectedTask.id, subtaskId).then(() => {
      qc.invalidateQueries({ queryKey: ["task-subtasks", selectedTask.id] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    });
  };


  const moveTask = (taskId: number, status: TaskStatus) => {
    const task = tasks.find((item) => item.id === taskId);

    if (!task || task.status === status) {
      return;
    }

    updateTask.mutate({
      id: taskId,
      data: { status }
    });
  };

  return (
    <div className="min-h-screen relative bg-slate-950 text-white overflow-hidden p-10">
	  <CursorGlow />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_28%),radial-gradient(circle_at_20%_85%,rgba(34,211,238,0.12),transparent_26%),linear-gradient(180deg,rgba(2,6,23,0.92)_0%,rgba(2,6,23,0.88)_34%,rgba(2,6,23,0.96)_100%)]" />
        <div className="dashboard-float absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-35" />
        <div className="dashboard-float-slow absolute top-40 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[140px] opacity-24" />
        <div className="dashboard-drift absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-pink-500 rounded-full blur-[120px] opacity-16" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-18 [mask-image:radial-gradient(circle_at_center,black,transparent_84%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-6">
        <div className="dashboard-fade-up flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/70 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.95)]" />
              live board
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-200 bg-clip-text text-transparent md:text-5xl">
              Tasks
            </h1>
            <p className="max-w-2xl text-sm text-white/60 md:text-base">
              Drag, edit, inspect and ship work from a single glass board with live status, details and subtasks.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/profile")}
            className="border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:text-white hover:shadow-lg hover:shadow-purple-500/20"
          >
            Profile
          </Button>
        </div>

        <TaskComposer onQuickCreate={createQuickTask} onAdvancedCreate={createAdvancedTask} />

        <div className="grid gap-3 md:grid-cols-4">
          <div className="dashboard-fade-up rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl shadow-lg shadow-black/20" style={{ animationDelay: "60ms" }}>
            <div className="mb-4 flex items-center justify-between text-white/60">
              <span className="text-xs uppercase tracking-[0.26em]">Total</span>
              <ListTodo size={16} />
            </div>
            <div className="text-3xl font-semibold text-white">{totalTasks}</div>
            <div className="mt-2 text-sm text-white/55">Tasks across the board</div>
          </div>

          <div className="dashboard-fade-up rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl shadow-lg shadow-black/20" style={{ animationDelay: "120ms" }}>
            <div className="mb-4 flex items-center justify-between text-white/60">
              <span className="text-xs uppercase tracking-[0.26em]">Active</span>
              <Sparkles size={16} />
            </div>
            <div className="text-3xl font-semibold text-white">{activeTasks}</div>
            <div className="mt-2 text-sm text-white/55">Currently in progress</div>
          </div>

          <div className="dashboard-fade-up rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl shadow-lg shadow-black/20" style={{ animationDelay: "180ms" }}>
            <div className="mb-4 flex items-center justify-between text-white/60">
              <span className="text-xs uppercase tracking-[0.26em]">Done</span>
              <CheckCircle2 size={16} />
            </div>
            <div className="text-3xl font-semibold text-white">{finishedTasks}</div>
            <div className="mt-2 text-sm text-white/55">Completed and closed tasks</div>
          </div>

          <div className="dashboard-fade-up rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/20 to-pink-500/10 p-4 backdrop-blur-xl shadow-lg shadow-black/20" style={{ animationDelay: "240ms" }}>
            <div className="mb-3 flex items-center justify-between text-white/70">
              <span className="text-xs uppercase tracking-[0.26em]">Board</span>
              <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-xs">
                {completionRate}%
              </span>
            </div>
            <div className="text-3xl font-semibold text-white">Progress</div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300 bg-[length:200%_200%] dashboard-shimmer transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-white/60">
              {completedSubtasks}/{totalSubtasks} subtasks done
            </div>
          </div>
        </div>

        {tasks.length === 0 ? (
          <Card className="dashboard-fade-up overflow-hidden border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/20">
            <CardContent className="relative flex min-h-[420px] items-center justify-center p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.14),transparent_30%)]" />
              <div className="relative max-w-xl text-center space-y-5">
                <div className="dashboard-float mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-xl shadow-black/20">
                  <SearchX size={28} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-white">
                    {normalizedSearch ? "No tasks match your search" : "Your board is empty"}
                  </h2>
                  <p className="text-sm leading-6 text-white/60">
                    {normalizedSearch
                      ? "Try a different keyword or clear the search to bring everything back."
                      : "Add a task and drag it across columns to see the board come alive."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {normalizedSearch ? (
                    <Button
                      type="button"
                      onClick={() => setSearch("")}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 hover:shadow-lg hover:shadow-pink-500/20"
                    >
                      Clear search
                    </Button>
                  ) : null}
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur-xl">
                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                    Drag cards to change status
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-2">
            {kanbanColumns.map((column, columnIndex) => (
              <div
                key={column.status}
                className={`dashboard-fade-up rounded-2xl border border-white/10 bg-gradient-to-b ${column.accent} p-3 backdrop-blur-xl transition duration-200 ${
                  activeDropStatus === column.status ? "ring-2 ring-white/40" : ""
                }`}
                style={{ animationDelay: `${columnIndex * 90}ms` }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setActiveDropStatus(column.status);
                }}
                onDragLeave={() => {
                  if (activeDropStatus === column.status) {
                    setActiveDropStatus(null);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();

                  if (draggingTaskId !== null) {
                    moveTask(draggingTaskId, column.status);
                  }

                  setDraggingTaskId(null);
                  setActiveDropStatus(null);
                }}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{column.title}</h2>
                    <p className="text-sm text-white/60">{column.hint}</p>
                  </div>
                  <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/80">
                    {tasksByStatus[column.status].length}
                  </div>
                </div>

                <div className="space-y-3 min-h-40">
                    {tasksByStatus[column.status].map((task, taskIndex) => (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={() => setDraggingTaskId(task.id)}
                      onDragEnd={() => {
                        setDraggingTaskId(null);
                        setActiveDropStatus(null);
                      }}
                      onClick={() => openTaskDetails(task)}
                        className="dashboard-fade-up group bg-black/20 border-white/10 backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:bg-white/10 hover:shadow-xl hover:shadow-black/20 cursor-grab active:cursor-grabbing"
                        style={{ animationDelay: `${taskIndex * 55}ms` }}
                    >
                      <CardContent className="p-3 flex gap-3 items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/50">
                            <span className="inline-block h-2 w-2 rounded-full bg-white/60" />
                            {task.status}
                          </div>
                          {task.category ? (
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-white/70">
                              <FolderKanban size={12} className="text-cyan-300" />
                              <span className="text-white/40">Category</span>
                              <span className="text-white/85">{task.category}</span>
                            </div>
                          ) : null}
                          {editingId === task.id ? (
                            <Input
                              value={editingTitle}
                              autoFocus
                              onClick={(event) => event.stopPropagation()}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onBlur={() => saveEdit(task.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(task.id);
                              }}
                              className="h-10 border-white/20 bg-white/10 text-white"
                            />
                          ) : (
                            <div
                              onClick={(event) => {
                                event.stopPropagation();
                                startEdit(task);
                              }}
                              className="cursor-pointer break-words text-base font-medium text-white transition hover:text-purple-300"
                            >
                              {task.title}
                            </div>
                          )}
                          <div className="mt-4 space-y-2.5 text-[11px] text-white/65">
                              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
                                <Flag size={13} className="shrink-0 text-amber-300" />
                                <span className="uppercase tracking-[0.16em] text-white/40">Priority</span>
                                <span className={`ml-auto rounded-full border px-2 py-0.5 uppercase tracking-[0.14em] ${priorityClasses[task.priority]}`}>
                                  {priorityLabels[task.priority]}
                                </span>
                              </div>

                              {task.tags.length > 0 ? (
                                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
                                  <Tag size={13} className="mt-0.5 shrink-0 text-cyan-300" />
                                  <div className="min-w-0 flex-1">
                                    <div className="uppercase tracking-[0.16em] text-white/40">Tags</div>
                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                      {task.tags.slice(0, 2).map((tag) => (
                                        <span
                                          key={tag}
                                          className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[11px] text-cyan-100"
                                        >
                                          #{tag}
                                        </span>
                                      ))}
                                      {task.tags.length > 2 ? (
                                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/55">
                                          +{task.tags.length - 2}
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              ) : null}

                              <div
                                className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 ${
                                  task.deadline
                                    ? isOverdue(task.deadline) && task.status !== "completed" && task.status !== "closed"
                                      ? "border-rose-400/25 bg-rose-400/10"
                                      : "border-white/10 bg-white/5"
                                    : "border-white/10 bg-white/5"
                                }`}
                              >
                                <CalendarClock size={13} className={task.deadline ? "shrink-0 text-cyan-300" : "shrink-0 text-white/35"} />
                                <span className="uppercase tracking-[0.16em] text-white/40">Deadline</span>
                                <span className={`ml-auto ${task.deadline ? "text-white/85" : "text-white/35"}`}>
                                  {formatDeadline(task.deadline) || "No deadline"}
                                </span>
                              </div>
                            </div>

                            <div className="mt-2 text-xs text-white/45">
                              {task.subtasks?.length ?? 0} subtasks
                            </div>
                        </div>

                        <Button
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteTask.mutate(task.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition text-white hover:bg-white/10 hover:text-red-400"
                        >
                          <Trash size={18} />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}

                  {tasksByStatus[column.status].length === 0 && (
                    <div className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-white/50">
                      Drop a task here
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <TaskDetailsDialog
          open={detailsOpen}
          task={selectedTask}
          subtasks={subtasks}
          onOpenChange={(open) => (open ? setDetailsOpen(true) : closeTaskDetails())}
          onSaveTask={saveTask}
          onAddSubtask={addSubtask}
          onToggleSubtask={toggleSubtask}
          onDeleteSubtask={deleteSubtask}
        />
      </div>
    </div>
  );
}

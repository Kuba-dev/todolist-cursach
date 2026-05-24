import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CursorGlow } from "@/components/CursorGlow";
import { api } from "@/shared/api/api";
import { subtasksApi, tasksApi, type Subtask, type Task, type TaskPriority, type TaskStatus } from "@/shared/api/tasks";
import { TaskDetailsDialog } from "./dashboard/task-details-dialog";
import { BadgeCheck, CalendarDays, FolderKanban, ListTodo, Sparkles, Tag, TriangleAlert } from "lucide-react";

const statusLabels: Record<TaskStatus, string> = {
	new: "Inbox",
	doing: "In progress",
	completed: "Done",
	closed: "Closed"
};

type TaskUpdateData = {
	title?: string;
	description?: string;
	category?: string;
	tags?: string[];
	priority?: TaskPriority;
	deadline?: string | null;
	status?: TaskStatus;
};

const getMostCommonValue = (values: string[]) => {
	const counts = values.reduce<Record<string, number>>((accumulator, value) => {
		const normalized = value.trim();

		if (!normalized) {
			return accumulator;
		}

		accumulator[normalized] = (accumulator[normalized] ?? 0) + 1;

		return accumulator;
	}, {});

	const [value, count] = Object.entries(counts).sort((left, right) => right[1] - left[1])[0] ?? [];

	return value ? { value, count } : null;
};

export function Profile() {
	const [user, setUser] = useState<{ email?: string } | null>(null);
	const navigate = useNavigate();
	const [now] = useState(() => Date.now());
	const queryClient = useQueryClient();
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

	const { data: tasks = [] } = useQuery({
		queryKey: ["profile-tasks"],
		queryFn: () => tasksApi.getAll().then((response) => response.data),
		enabled: Boolean(user)
	});
	const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
	const { data: subtasks = [] } = useQuery({
		queryKey: ["profile-task-subtasks", selectedTaskId],
		queryFn: () => subtasksApi.getAll(selectedTaskId as number).then((response) => response.data),
		enabled: selectedTaskId !== null,
	});

	const updateTask = useMutation({
		mutationFn: ({ id, data }: { id: number; data: TaskUpdateData }) => tasksApi.update(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["profile-tasks"] });
		},
	});

	const openTaskDetails = (task: Task) => {
		setSelectedTaskId(task.id);
		setDetailsOpen(true);
	};

	const closeTaskDetails = () => {
		setDetailsOpen(false);
		setSelectedTaskId(null);
	};

	const saveTask = (id: number, data: TaskUpdateData) => {
		updateTask.mutate({ id, data });
	};

	const addSubtask = (title: string) => {
		if (!selectedTask) return;

		subtasksApi.create(selectedTask.id, { title }).then(() => {
			queryClient.invalidateQueries({ queryKey: ["profile-task-subtasks", selectedTask.id] });
			queryClient.invalidateQueries({ queryKey: ["profile-tasks"] });
		});
	};

	const toggleSubtask = (subtaskId: number) => {
		if (!selectedTask) return;

		const currentSubtask = subtasks.find((subtask: Subtask) => subtask.id === subtaskId);

		if (!currentSubtask) return;

		subtasksApi.update(selectedTask.id, subtaskId, { completed: !currentSubtask.completed }).then(() => {
			queryClient.invalidateQueries({ queryKey: ["profile-task-subtasks", selectedTask.id] });
			queryClient.invalidateQueries({ queryKey: ["profile-tasks"] });
		});
	};

	const deleteSubtask = (subtaskId: number) => {
		if (!selectedTask) return;

		subtasksApi.remove(selectedTask.id, subtaskId).then(() => {
			queryClient.invalidateQueries({ queryKey: ["profile-task-subtasks", selectedTask.id] });
			queryClient.invalidateQueries({ queryKey: ["profile-tasks"] });
		});
	};

	const totalTasks = tasks.length;
	const activeTasks = tasks.filter((task) => task.status === "doing").length;
	const finishedTasks = tasks.filter((task) => task.status === "completed" || task.status === "closed").length;
	const overdueTaskList = tasks.filter(
		(task) =>
			task.deadline &&
			new Date(task.deadline).getTime() < now &&
			task.status !== "completed" &&
			task.status !== "closed"
	);
	const overdueTasks = tasks.filter(
		(task) =>
			task.deadline &&
			new Date(task.deadline).getTime() < now &&
			task.status !== "completed" &&
			task.status !== "closed"
	).length;
	const dueSoonTasks = tasks.filter((task) => {
		if (!task.deadline) return false;

		const deadlineTime = new Date(task.deadline).getTime();
		const inSevenDays = now + 7 * 24 * 60 * 60 * 1000;

		return deadlineTime >= now && deadlineTime <= inSevenDays && task.status !== "completed" && task.status !== "closed";
	}).length;
	const totalSubtasks = tasks.reduce((sum, task) => sum + (task.subtasks?.length ?? 0), 0);
	const completedSubtasks = tasks.reduce(
		(sum, task) => sum + (task.subtasks?.filter((subtask) => subtask.completed).length ?? 0),
		0
	);
	const completionRate = totalTasks ? Math.round((finishedTasks / totalTasks) * 100) : 0;
	const topTagEntry = getMostCommonValue(tasks.flatMap((task) => task.tags));
	const topCategoryEntry = getMostCommonValue(tasks.map((task) => task.category ?? ""));

	useEffect(() => {
		api
			.get("/auth/me")
			.then((response) => setUser(response.data))
			.catch(() => navigate("/login"));
	}, [navigate]);

	if (!user) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
				<div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 px-8 py-6 backdrop-blur-xl shadow-2xl shadow-black/30">
					<div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.12),transparent_35%,rgba(255,255,255,0.04))]" />
					<div className="relative flex items-center gap-3 text-white/70">
						<div className="h-3 w-3 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(74,222,128,0.9)]" />
						Loading profile...
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative bg-slate-950 text-white overflow-hidden p-10">
			<CursorGlow />
			<div className="absolute inset-0">
				<div className="dashboard-float absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-40" />
				<div className="dashboard-float-slow absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[140px] opacity-30" />
				<div className="dashboard-drift absolute top-24 right-1/3 w-[280px] h-[280px] bg-pink-500 rounded-full blur-[120px] opacity-20" />
				<div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20 [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
			</div>

			<div className="relative mx-auto max-w-6xl space-y-6">
				<div className="dashboard-fade-up flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div className="space-y-2">
						<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/70 backdrop-blur-xl">
							<span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.95)]" />
							identity
						</div>
						<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-200 bg-clip-text text-transparent md:text-5xl">
							Profile
						</h1>
						<p className="max-w-2xl text-sm text-white/60 md:text-base">
							Your workspace snapshot, account details and progress overview in the same visual style as the task board.
						</p>
					</div>

					<Button
						variant="outline"
						onClick={() => navigate("/dashboard")}
						className="border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white hover:shadow-lg hover:shadow-purple-500/20"
					>
						Go to Tasks
					</Button>
				</div>

				<div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
					<Card className="dashboard-fade-up overflow-hidden border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/20">
						<CardContent className="relative p-6 md:p-8 h-full">
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.12),transparent_26%)]" />
							<div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
								<div className="flex items-center gap-4">
									<div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/35 via-pink-500/25 to-cyan-400/20 text-3xl font-semibold text-white shadow-2xl shadow-purple-500/20">
										{user.email?.charAt(0)?.toUpperCase() ?? "U"}
									</div>
									<div>
										<div className="text-sm uppercase tracking-[0.28em] text-white/50">Logged in as</div>
										<div className="mt-2 text-2xl font-semibold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
											{user.email}
										</div>
										<div className="mt-3 flex flex-wrap gap-2 text-xs text-white/65">
											<span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-xl">Secure session</span>
											<span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-xl">Task workspace</span>
										</div>
									</div>
								</div>

								<div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
									<div className="text-xs uppercase tracking-[0.28em] text-white/50">Quick action</div>
									<div className="mt-2 text-sm text-white/70">Jump back into the board and continue where you left off.</div>
									<Button
										className="mt-4 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-[length:200%_200%] dashboard-shimmer hover:opacity-95 hover:shadow-lg hover:shadow-pink-500/20"
										onClick={() => navigate("/dashboard")}
									>
										Open Tasks
									</Button>
								</div>
							</div>

							<div className="relative mt-6 grid gap-3 md:grid-cols-3">
								<div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
									<div className="mb-3 flex items-center justify-between text-white/55">
										<span className="text-xs uppercase tracking-[0.24em]">Tasks</span>
										<ListTodo size={16} />
									</div>
									<div className="text-3xl font-semibold text-white">{totalTasks}</div>
									<div className="mt-2 text-sm text-white/55">Total tasks in your board</div>
								</div>

								<div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
									<div className="mb-3 flex items-center justify-between text-white/55">
										<span className="text-xs uppercase tracking-[0.24em]">Focus</span>
										<Sparkles size={16} />
									</div>
									<div className="text-3xl font-semibold text-white">{activeTasks}</div>
									<div className="mt-2 text-sm text-white/55">Tasks currently in progress</div>
								</div>

								<div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
									<div className="mb-3 flex items-center justify-between text-white/55">
										<span className="text-xs uppercase tracking-[0.24em]">Done</span>
										<BadgeCheck size={16} />
									</div>
									<div className="text-3xl font-semibold text-white">{finishedTasks}</div>
									<div className="mt-2 text-sm text-white/55">Completed or closed</div>
								</div>
							</div>
						</CardContent>
					</Card>

						<div className="space-y-4">
						<Card className="dashboard-fade-up border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/20" style={{ animationDelay: "80ms" }}>
							<CardContent className="p-5 space-y-4">
								<div className="flex items-center justify-between">
									<div>
										<div className="text-xs uppercase tracking-[0.26em] text-white/50">Board pulse</div>
										<div className="mt-1 text-xl font-semibold text-white">{completionRate}% complete</div>
									</div>
									<div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">live</div>
								</div>

								<div className="h-3 overflow-hidden rounded-full bg-white/10">
									<div
										className="h-full rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-300 bg-[length:200%_200%] dashboard-shimmer transition-all"
										style={{ width: `${completionRate}%` }}
									/>
								</div>

								<div className="flex items-center justify-between text-sm text-white/60">
									<span>{completedSubtasks} subtasks completed</span>
									<span>{totalSubtasks} subtasks total</span>
								</div>
							</CardContent>
						</Card>

							<Card className="dashboard-fade-up border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/20" style={{ animationDelay: "120ms" }}>
								<CardContent className="p-5 space-y-4">
									<div>
										<div className="text-xs uppercase tracking-[0.26em] text-white/50">Insights</div>
										<div className="mt-2 text-xl font-semibold text-white">More task signals</div>
									</div>

									<div className="grid gap-3 sm:grid-cols-2">
										<div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
											<div className="mb-3 flex items-center justify-between text-white/55">
												<span className="text-xs uppercase tracking-[0.24em]">Overdue</span>
												<TriangleAlert size={16} />
											</div>
											<div className="text-3xl font-semibold text-white">{overdueTasks}</div>
											<div className="mt-2 text-sm text-white/55">Tasks that need attention now</div>
										</div>

										<div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
											<div className="mb-3 flex items-center justify-between text-white/55">
												<span className="text-xs uppercase tracking-[0.24em]">Due soon</span>
												<CalendarDays size={16} />
											</div>
											<div className="text-3xl font-semibold text-white">{dueSoonTasks}</div>
											<div className="mt-2 text-sm text-white/55">Deadlines within 7 days</div>
										</div>

										<div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
											<div className="mb-3 flex items-center justify-between text-white/55">
												<span className="text-xs uppercase tracking-[0.24em]">Top tag</span>
												<Tag size={16} />
											</div>
											<div className="text-3xl font-semibold text-white">{topTagEntry?.count ?? 0}</div>
											<div className="mt-2 text-sm text-white/55">
												{topTagEntry ? `Most used tag: #${topTagEntry.value}` : "No tags yet"}
											</div>
										</div>

										<div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
											<div className="mb-3 flex items-center justify-between text-white/55">
												<span className="text-xs uppercase tracking-[0.24em]">Top category</span>
												<FolderKanban size={16} />
											</div>
											<div className="text-3xl font-semibold text-white">{topCategoryEntry?.count ?? 0}</div>
											<div className="mt-2 text-sm text-white/55">
												{topCategoryEntry ? `Most used category: ${topCategoryEntry.value}` : "No categories yet"}
											</div>
										</div>
									</div>

									<div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">
										<div className="mb-3 flex items-center justify-between text-white/55">
											<span className="text-xs uppercase tracking-[0.24em]">Open overdue</span>
											<span className="text-xs uppercase tracking-[0.24em]">{overdueTaskList.length}</span>
										</div>
										<div className="space-y-2">
											{overdueTaskList.length > 0 ? (
												overdueTaskList.slice(0, 4).map((task) => (
													<div key={task.id} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:flex-row sm:items-center sm:justify-between">
														<div className="min-w-0">
															<div className="truncate text-sm font-medium text-white">{task.title}</div>
															<div className="mt-1 text-xs uppercase tracking-[0.22em] text-rose-200/80">
																{task.category || "Uncategorized"} · {task.deadline ? new Date(task.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "No deadline"}
															</div>
														</div>
														<Button
															size="sm"
															variant="outline"
															onClick={() => openTaskDetails(task)}
															className="border-rose-400/20 bg-rose-400/10 text-white hover:bg-rose-400/20 hover:text-white"
														>
															Open task
														</Button>
													</div>
											))
											) : (
												<div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/55">
													No overdue tasks right now.
												</div>
											)}
										</div>
									</div>
								</CardContent>
							</Card>

						<Card className="dashboard-fade-up border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/20" style={{ animationDelay: "140ms" }}>
							<CardContent className="p-5 space-y-4">
								<div>
									<div className="text-xs uppercase tracking-[0.26em] text-white/50">Status map</div>
									<div className="mt-2 text-xl font-semibold text-white">Current board mix</div>
								</div>

								<div className="space-y-3">
									{([
										{ key: "new", value: tasks.filter((task) => task.status === "new").length },
										{ key: "doing", value: tasks.filter((task) => task.status === "doing").length },
										{ key: "completed", value: tasks.filter((task) => task.status === "completed").length },
										{ key: "closed", value: tasks.filter((task) => task.status === "closed").length },
									] as Array<{ key: TaskStatus; value: number }>).map((item) => (
										<div key={item.key} className="space-y-2">
											<div className="flex items-center justify-between text-sm text-white/65">
												<span>{statusLabels[item.key]}</span>
												<span>{item.value}</span>
											</div>
											<div className="h-2 overflow-hidden rounded-full bg-white/10">
												<div
													className="h-full rounded-full bg-gradient-to-r from-white/20 to-white/70"
													style={{ width: `${totalTasks ? Math.max(8, Math.round((item.value / totalTasks) * 100)) : 0}%` }}
												/>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card className="dashboard-fade-up border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl shadow-black/20" style={{ animationDelay: "200ms" }}>
							<CardContent className="p-5 space-y-4">
								<div>
									<div className="text-xs uppercase tracking-[0.26em] text-white/50">Account</div>
									<div className="mt-2 text-xl font-semibold text-white">Profile controls</div>
								</div>

								<div className="grid gap-3 sm:grid-cols-2">
									<Button
										className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-[length:200%_200%] dashboard-shimmer hover:opacity-95 hover:shadow-lg hover:shadow-pink-500/20"
										onClick={() => navigate("/dashboard")}
									>
										Open Tasks
									</Button>

									<Button
										variant="ghost"
										className="border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-red-300"
										onClick={() => {
											localStorage.removeItem("token");
											navigate("/login");
										}}
									>
										Logout
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			<TaskDetailsDialog
				open={detailsOpen}
				task={selectedTask}
				subtasks={subtasks}
				onOpenChange={(open) => {
					if (!open) {
						closeTaskDetails();
					}
				}}
				onSaveTask={saveTask}
				onAddSubtask={addSubtask}
				onToggleSubtask={toggleSubtask}
				onDeleteSubtask={deleteSubtask}
			/>
		</div>
	);
}

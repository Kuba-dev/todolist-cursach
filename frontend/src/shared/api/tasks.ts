import { api } from "./api"

export type TaskStatus = "new" | "doing" | "completed" | "closed"
export type TaskPriority = "low" | "medium" | "high"

export type Subtask = {
	id: number
	title: string
	completed: boolean
	createdAt: string
}

export type Task = {
	id: number
	title: string
	description?: string
	category?: string | null
	tags: string[]
	priority: TaskPriority
	deadline?: string | null
	status: TaskStatus
	createdAt: string
	subtasks?: Subtask[]
}

export const tasksApi = {
	getAll: (search?: string) =>
		api.get<Task[]>("/tasks", {
			params: search?.trim() ? { search: search.trim() } : undefined
		}),
	create: (data: {
		title: string
		description?: string
		category?: string
		tags?: string[]
		priority?: TaskPriority
		deadline?: string | null
	}) =>
		api.post<Task>("/tasks", data),
	remove: (id: number) =>
		api.delete(`/tasks/${id}`),
	update: (id: number, data: {
		title?: string
		description?: string
		category?: string
		tags?: string[]
		priority?: TaskPriority
		deadline?: string | null
		status?: TaskStatus
	}) =>
		api.patch(`/tasks/${id}`, data)
}

export const subtasksApi = {
	getAll: (taskId: number) => api.get<Subtask[]>(`/tasks/${taskId}/subtasks`),
	create: (taskId: number, data: { title: string }) =>
		api.post<Subtask>(`/tasks/${taskId}/subtasks`, data),
	update: (taskId: number, id: number, data: { title?: string; completed?: boolean }) =>
		api.patch<Subtask>(`/tasks/${taskId}/subtasks/${id}`, data),
	remove: (taskId: number, id: number) =>
		api.delete(`/tasks/${taskId}/subtasks/${id}`)
}
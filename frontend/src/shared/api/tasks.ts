import { api } from "./api"

export type Task = {
	id: number
	title: string
	description?: string
	createdAt: string
}

export const tasksApi = {
	getAll: () => api.get<Task[]>("/tasks"),
	create: (data: { title: string }) =>
		api.post<Task>("/tasks", data),
	remove: (id: number) =>
		api.delete(`/tasks/${id}`),
	update: (id: number, data: { title: string }) =>
	api.patch(`/tasks/${id}`, data)
}
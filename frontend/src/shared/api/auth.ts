import { api } from "./api"

export const authApi = {
	register: (data: any) => api.post("/auth/register", data),
	login: (data: any) => api.post("/auth/login", data),
	logout: () => api.post("/auth/logout"),
	refresh: () => api.post("/auth/refresh")
}
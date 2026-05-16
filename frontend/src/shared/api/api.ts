import axios from "axios"

export const api = axios.create({
	baseURL: "http://localhost:3000",
	withCredentials: true
})

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token")

	if (token && token !== "undefined" && token !== "null") {
		config.headers.Authorization = `Bearer ${token}`
	} else if (config.headers) {
		delete config.headers.Authorization
	}

	return config
})
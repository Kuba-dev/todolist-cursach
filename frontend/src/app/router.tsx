import { createBrowserRouter, Navigate } from "react-router-dom"
import { Profile } from "@/pages/profile"
import { Dashboard } from "@/pages/dashboard"
import { AuthPage } from "@/pages/auth/auth"

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Navigate to="/profile" />
	},
	{
		path: "/login",
		element: <AuthPage />
	},
	{
		path: "/profile",
		element: <Profile />
	},
	{
		path: "/dashboard",
		element: <Dashboard />
	}
])
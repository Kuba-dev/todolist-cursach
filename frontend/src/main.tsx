import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./app/providers/query-client"
import { router } from "./app/router"
import { RouterProvider } from "react-router-dom"

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
		</QueryClientProvider>
	</React.StrictMode>
)
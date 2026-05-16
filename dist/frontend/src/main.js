"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const client_1 = require("react-dom/client");
require("./index.css");
const react_query_1 = require("@tanstack/react-query");
const query_client_1 = require("./app/providers/query-client");
const router_1 = require("./app/router");
const react_router_dom_1 = require("react-router-dom");
client_1.default.createRoot(document.getElementById("root")).render(<react_1.default.StrictMode>
		<react_query_1.QueryClientProvider client={query_client_1.queryClient}>
				<react_router_dom_1.RouterProvider router={router_1.router}/>
		</react_query_1.QueryClientProvider>
	</react_1.default.StrictMode>);
//# sourceMappingURL=main.js.map
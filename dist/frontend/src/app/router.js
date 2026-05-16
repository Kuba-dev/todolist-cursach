"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const react_router_dom_1 = require("react-router-dom");
const auth_1 = require("@/pages/auth/auth");
const dashboard_1 = require("@/pages/dashboard");
exports.router = (0, react_router_dom_1.createBrowserRouter)([
    {
        path: "/login",
        element: <auth_1.Login />
    },
    {
        path: "/",
        element: <dashboard_1.Dashboard />
    }
]);
//# sourceMappingURL=router.js.map
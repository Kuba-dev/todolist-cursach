"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authApi = void 0;
const api_1 = require("./api");
exports.authApi = {
    register: (data) => api_1.api.post("/auth/register", data),
    login: (data) => api_1.api.post("/auth/login", data),
    logout: () => api_1.api.post("/auth/logout"),
    refresh: () => api_1.api.post("/auth/refresh")
};
//# sourceMappingURL=auth.js.map
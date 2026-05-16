"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksApi = void 0;
const api_1 = require("./api");
exports.tasksApi = {
    getAll: () => api_1.api.get("/tasks"),
    create: (data) => api_1.api.post("/tasks", data),
    update: (id, data) => api_1.api.patch(`/tasks/${id}`, data),
    remove: (id) => api_1.api.delete(`/tasks/${id}`)
};
//# sourceMappingURL=tasks.js.map
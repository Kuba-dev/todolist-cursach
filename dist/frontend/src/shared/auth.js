"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
let user = null;
exports.auth = {
    setUser: (u) => (user = u),
    getUser: () => user,
    isAuth: () => !!user,
    logout: () => (user = null)
};
//# sourceMappingURL=auth.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserDto = void 0;
const openapi = require("@nestjs/swagger");
class GetUserDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: false, type: () => Number }, email: { required: false, type: () => String } };
    }
}
exports.GetUserDto = GetUserDto;
//# sourceMappingURL=get-user.dto.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TasksService = class TasksService {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async get(userId) {
        return await this.prismaService.task.findMany({ where: { userId } });
    }
    async createOne(dto, userId) {
        const createdTask = await this.prismaService.task.create({
            data: {
                ...dto,
                userId
            }
        });
        return createdTask;
    }
    async updateOne(id, dto, userId) {
        await this.getOneOrThrow(id, userId);
        const deletedTask = await this.prismaService.task.update({
            where: { id, userId },
            data: dto
        });
        return deletedTask;
    }
    async deleteOne(id, userId) {
        await this.getOneOrThrow(id, userId);
        const updatedTask = await this.prismaService.task.delete({
            where: { id, userId }
        });
        return updatedTask;
    }
    async getOneOrThrow(id, userId) {
        const task = await this.prismaService.task.findUnique({ where: { id } });
        if (!task) {
            throw new common_1.NotFoundException(`Could not find any task. userId: ${userId}`);
        }
        return task;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map
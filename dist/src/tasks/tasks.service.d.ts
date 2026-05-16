import { Task } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import { CreateTaskDto } from "./dtos/create-task.dto";
import { UpdateTaskDto } from "./dtos/update-task.dto";
export declare class TasksService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    get(userId: number): Promise<Task[]>;
    createOne(dto: CreateTaskDto, userId: number): Promise<{
        id: number;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatusEnum;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateOne(id: number, dto: UpdateTaskDto, userId: number): Promise<{
        id: number;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatusEnum;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteOne(id: number, userId: number): Promise<{
        id: number;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.TaskStatusEnum;
        userId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private getOneOrThrow;
}

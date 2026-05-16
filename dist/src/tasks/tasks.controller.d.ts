import { TasksService } from "./tasks.service";
import { Task } from "@prisma/client";
import { CreateTaskDto } from "./dtos/create-task.dto";
import { UpdateTaskDto } from "./dtos/update-task.dto";
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    get(userId: number): Promise<Task[]>;
    createOne(dto: CreateTaskDto, userId: number): Promise<Task>;
    updateOne(id: number, dto: UpdateTaskDto, userId: number): Promise<Task>;
    deleteOne(id: number, userId: number): Promise<Task>;
}

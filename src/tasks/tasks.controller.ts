import {
	Controller,
	Body,
	Post,
	Get,
	Patch,
	Delete,
	Param,
	ParseIntPipe,
	UseGuards
} from "@nestjs/common"
import { TasksService } from "./tasks.service"
import { Task } from "@prisma/client"
import { CreateTaskDto } from "./dtos/create-task.dto"
import { UpdateTaskDto } from "./dtos/update-task.dto"
import { JwtAccessGuard } from "src/auth/guards/jwt-access.guard"
import { CurrentUser } from "src/utils/decorators/current-user"
import { ApiBearerAuth } from "@nestjs/swagger"

@UseGuards(JwtAccessGuard)
@Controller("tasks")
export class TasksController {
	constructor(private readonly tasksService: TasksService) {}

	@Get()
	@ApiBearerAuth("JWT-auth")
	async get(@CurrentUser("id", ParseIntPipe) userId: number): Promise<Task[]> {
		return await this.tasksService.get(userId)
	}

	@Post()
	@ApiBearerAuth("JWT-auth")
	async createOne(
		@Body() dto: CreateTaskDto,
		@CurrentUser("id", ParseIntPipe) userId: number
	): Promise<Task> {
		return await this.tasksService.createOne(dto, userId)
	}

	@Patch(":id")
	@ApiBearerAuth("JWT-auth")
	async updateOne(
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: UpdateTaskDto,
		@CurrentUser("id", ParseIntPipe) userId: number
	): Promise<Task> {
		return await this.tasksService.updateOne(id, dto, userId)
	}

	@Delete(":id")
	@ApiBearerAuth("JWT-auth")
	async deleteOne(
		@Param("id", ParseIntPipe) id: number,
		@CurrentUser("id", ParseIntPipe) userId: number
	): Promise<Task> {
		return await this.tasksService.deleteOne(id, userId)
	}
}

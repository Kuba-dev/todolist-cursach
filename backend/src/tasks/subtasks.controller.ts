import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	ParseIntPipe,
	Post,
	UseGuards
} from "@nestjs/common"
import { ApiBearerAuth } from "@nestjs/swagger"
import { Subtask } from "@prisma/client"
import { JwtAccessGuard } from "src/auth/guards/jwt-access.guard"
import { CurrentUser } from "src/utils/decorators/current-user"
import { CreateSubtaskDto } from "./dtos/create-subtask.dto"
import { UpdateSubtaskDto } from "./dtos/update-subtask.dto"
import { SubtasksService } from "./subtasks.service"

@UseGuards(JwtAccessGuard)
@Controller("tasks/:taskId/subtasks")
export class SubtasksController {
	constructor(private readonly subtasksService: SubtasksService) {}

	@Get()
	@ApiBearerAuth("JWT-auth")
	async getAll(
		@Param("taskId", ParseIntPipe) taskId: number,
		@CurrentUser("id", ParseIntPipe) userId: number
	): Promise<Subtask[]> {
		return await this.subtasksService.getAll(taskId, userId)
	}

	@Post()
	@ApiBearerAuth("JWT-auth")
	async createOne(
		@Param("taskId", ParseIntPipe) taskId: number,
		@Body() dto: CreateSubtaskDto,
		@CurrentUser("id", ParseIntPipe) userId: number
	): Promise<Subtask> {
		return await this.subtasksService.createOne(taskId, dto, userId)
	}

	@Patch(":id")
	@ApiBearerAuth("JWT-auth")
	async updateOne(
		@Param("taskId", ParseIntPipe) taskId: number,
		@Param("id", ParseIntPipe) id: number,
		@Body() dto: UpdateSubtaskDto,
		@CurrentUser("id", ParseIntPipe) userId: number
	): Promise<Subtask> {
		return await this.subtasksService.updateOne(taskId, id, dto, userId)
	}

	@Delete(":id")
	@ApiBearerAuth("JWT-auth")
	async deleteOne(
		@Param("taskId", ParseIntPipe) taskId: number,
		@Param("id", ParseIntPipe) id: number,
		@CurrentUser("id", ParseIntPipe) userId: number
	): Promise<Subtask> {
		return await this.subtasksService.deleteOne(taskId, id, userId)
	}
}
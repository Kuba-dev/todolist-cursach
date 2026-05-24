import { Injectable, NotFoundException } from "@nestjs/common"
import { Subtask } from "@prisma/client"
import { PrismaService } from "prisma/prisma.service"
import { CreateSubtaskDto } from "./dtos/create-subtask.dto"
import { UpdateSubtaskDto } from "./dtos/update-subtask.dto"

@Injectable()
export class SubtasksService {
	constructor(private readonly prismaService: PrismaService) {}

	async getAll(taskId: number, userId: number): Promise<Subtask[]> {
		await this.getTaskOrThrow(taskId, userId)

		return await this.prismaService.subtask.findMany({
			where: { taskId, userId },
			orderBy: { createdAt: "asc" }
		})
	}

	async createOne(taskId: number, dto: CreateSubtaskDto, userId: number): Promise<Subtask> {
		await this.getTaskOrThrow(taskId, userId)

		return await this.prismaService.subtask.create({
			data: {
				title: dto.title,
				taskId,
				userId
			}
		})
	}

	async updateOne(
		taskId: number,
		id: number,
		dto: UpdateSubtaskDto,
		userId: number
	): Promise<Subtask> {
		await this.getSubtaskOrThrow(taskId, id, userId)

		return await this.prismaService.subtask.update({
			where: { id },
			data: dto
		})
	}

	async deleteOne(taskId: number, id: number, userId: number): Promise<Subtask> {
		await this.getSubtaskOrThrow(taskId, id, userId)

		return await this.prismaService.subtask.delete({
			where: { id }
		})
	}

	private async getTaskOrThrow(taskId: number, userId: number) {
		const task = await this.prismaService.task.findFirst({
			where: { id: taskId, userId }
		})

		if (!task) {
			throw new NotFoundException(`Could not find any task. userId: ${userId}`)
		}

		return task
	}

	private async getSubtaskOrThrow(taskId: number, id: number, userId: number) {
		const subtask = await this.prismaService.subtask.findFirst({
			where: { id, taskId, userId }
		})

		if (!subtask) {
			throw new NotFoundException(`Could not find any subtask. userId: ${userId}`)
		}

		return subtask
	}
}
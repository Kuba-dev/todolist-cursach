import { Injectable, NotFoundException } from "@nestjs/common"
import { Prisma, Task } from "@prisma/client"
import { PrismaService } from "prisma/prisma.service"
import { CreateTaskDto } from "./dtos/create-task.dto"
import { UpdateTaskDto } from "./dtos/update-task.dto"

type TaskWithSubtasks = Prisma.TaskGetPayload<{
	include: { subtasks: true }
}>

@Injectable()
export class TasksService {
	constructor(private readonly prismaService: PrismaService) {}

	private normalizeTags(tags?: string[]) {
		return tags?.map(tag => tag.trim()).filter(Boolean) ?? []
	}

	private normalizeDeadline(deadline?: string | null) {
		if (deadline === undefined) return undefined
		if (deadline === null || deadline.trim() === "") return null

		return new Date(deadline)
	}

	async get(userId: number, search?: string): Promise<TaskWithSubtasks[]> {
		const normalizedSearch = search?.trim()

		return await this.prismaService.task.findMany({
			include: {
				subtasks: true
			},
			where: {
				userId,
				...(normalizedSearch
					? {
							OR: [
								{
									title: {
										contains: normalizedSearch,
										mode: "insensitive"
									}
								},
								{
									description: {
										contains: normalizedSearch,
										mode: "insensitive"
									}
								},
								{
									category: {
										contains: normalizedSearch,
										mode: "insensitive"
									}
								},
								{
									tags: {
										hasSome: [normalizedSearch]
									}
								}
							]
						}
					: {})
			}
		})
	}

	async createOne(dto: CreateTaskDto, userId: number) {
		const createdTask = await this.prismaService.task.create({
			data: {
				title: dto.title,
				description: dto.description?.trim() || undefined,
				category: dto.category?.trim() || undefined,
				tags: this.normalizeTags(dto.tags),
				priority: dto.priority,
				deadline: this.normalizeDeadline(dto.deadline),
				userId
			}
		})

		return createdTask
	}

	async updateOne(id: number, dto: UpdateTaskDto, userId: number) {
		await this.getOneOrThrow(id, userId)

		const deletedTask = await this.prismaService.task.update({
			where: { id, userId },
			data: {
				title: dto.title,
				description: dto.description?.trim() || undefined,
				category: dto.category?.trim() || undefined,
				tags: dto.tags ? this.normalizeTags(dto.tags) : undefined,
				priority: dto.priority,
				deadline: this.normalizeDeadline(dto.deadline),
				status: dto.status
			}
		})

		return deletedTask
	}

	async deleteOne(id: number, userId: number) {
		await this.getOneOrThrow(id, userId)

		const updatedTask = await this.prismaService.task.delete({
			where: { id, userId }
		})

		return updatedTask
	}

	// Private methods
	private async getOneOrThrow(id: number, userId: number): Promise<Task> {
		const task = await this.prismaService.task.findUnique({ where: { id } })

		if (!task) {
			throw new NotFoundException(`Could not find any task. userId: ${userId}`)
		}

		return task
	}
}

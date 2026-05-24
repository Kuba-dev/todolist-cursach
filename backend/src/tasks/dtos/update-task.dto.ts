import { TaskStatusEnum } from "@prisma/client"

export class UpdateTaskDto {
	title?: string

	description?: string

	category?: string

	tags?: string[]

	priority?: "low" | "medium" | "high"

	deadline?: string | null

	status?: TaskStatusEnum
}

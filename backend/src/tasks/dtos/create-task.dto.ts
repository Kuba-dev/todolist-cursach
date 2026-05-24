export class CreateTaskDto {
	title: string

	description?: string

	category?: string

	tags?: string[]

	priority?: "low" | "medium" | "high"

	deadline?: string
}

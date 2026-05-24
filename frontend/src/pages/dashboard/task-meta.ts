import type { TaskPriority } from "@/shared/api/tasks"

export const priorityLabels: Record<TaskPriority, string> = {
	low: "Low",
	medium: "Medium",
	high: "High",
}

export const priorityClasses: Record<TaskPriority, string> = {
	low: "border-cyan-400/30 bg-cyan-400/10 text-cyan-100",
	medium: "border-amber-400/30 bg-amber-400/10 text-amber-100",
	high: "border-rose-400/30 bg-rose-400/10 text-rose-100",
}

const taskDateFormatter = new Intl.DateTimeFormat("en", {
	month: "short",
	day: "numeric",
})

export const formatDeadline = (value?: string | Date | null) => {
	if (!value) return null

	return taskDateFormatter.format(value instanceof Date ? value : new Date(value))
}

export const isOverdue = (value?: string | Date | null) => {
	if (!value) return false

	return (value instanceof Date ? value : new Date(value)).getTime() < Date.now()
}

export const parseTags = (value: string) =>
	value
		.split(",")
		.map((tag) => tag.trim())
		.filter(Boolean)

export const deadlineToIso = (value?: Date) => value?.toISOString()

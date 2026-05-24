import { useState } from "react"
import { Sparkles, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DeadlinePicker } from "@/components/ui/deadline-picker"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { TaskPriority } from "@/shared/api/tasks"
import { formatDeadline, parseTags, priorityClasses, priorityLabels, deadlineToIso } from "./task-meta"

type AdvancedTaskInput = {
	title: string
	description?: string
	category?: string
	tags: string[]
	priority: TaskPriority
	deadline?: string
}

type TaskComposerProps = {
	onQuickCreate: (title: string) => void
	onAdvancedCreate: (data: AdvancedTaskInput) => void
}

export function TaskComposer({ onQuickCreate, onAdvancedCreate }: TaskComposerProps) {
	const [quickTitle, setQuickTitle] = useState("")
	const [advancedCreateOpen, setAdvancedCreateOpen] = useState(false)
	const [advancedTitle, setAdvancedTitle] = useState("")
	const [advancedDescription, setAdvancedDescription] = useState("")
	const [advancedCategory, setAdvancedCategory] = useState("")
	const [advancedTags, setAdvancedTags] = useState("")
	const [advancedPriority, setAdvancedPriority] = useState<TaskPriority>("medium")
	const [advancedDeadline, setAdvancedDeadline] = useState<Date | undefined>(undefined)

	const submitQuick = () => {
		if (!quickTitle.trim()) return

		onQuickCreate(quickTitle.trim())
		setQuickTitle("")
	}

	const submitAdvanced = () => {
		if (!advancedTitle.trim()) return

		onAdvancedCreate({
			title: advancedTitle.trim(),
			description: advancedDescription.trim() ? advancedDescription.trim() : undefined,
			category: advancedCategory.trim() || undefined,
			tags: parseTags(advancedTags),
			priority: advancedPriority,
			deadline: deadlineToIso(advancedDeadline),
		})

		setAdvancedTitle("")
		setAdvancedDescription("")
		setAdvancedCategory("")
		setAdvancedTags("")
		setAdvancedPriority("medium")
		setAdvancedDeadline(undefined)
		setAdvancedCreateOpen(false)
	}

	return (
		<>
			<Card className="dashboard-fade-up border-white/10 bg-white/10 backdrop-blur-xl shadow-xl shadow-black/20">
				<CardContent className="space-y-3 p-4">
					<div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-inner shadow-black/10">
						<div className="mb-2 flex items-center justify-between gap-3">
							<div>
								<div className="text-xs uppercase tracking-[0.24em] text-white/45">Quick create</div>
								<p className="text-sm text-white/55">Drop a title, ship it instantly, and refine it later.</p>
							</div>
							<div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/60">
								title only
							</div>
						</div>

						<div className="flex flex-col gap-3 md:flex-row">
							<Input
								placeholder="What needs to be done?"
								value={quickTitle}
								onChange={(event) => setQuickTitle(event.target.value)}
								className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
							/>

							<div className="flex gap-2 md:w-auto">
								<Button
									className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-[length:200%_200%] dashboard-shimmer hover:opacity-95 hover:shadow-lg hover:shadow-pink-500/20 md:min-w-36"
									disabled={!quickTitle.trim()}
									onClick={submitQuick}
								>
									Quick add
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => setAdvancedCreateOpen(true)}
									className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
								>
									Advanced
								</Button>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-2 text-xs text-white/45">
						<Sparkles size={14} />
						Advanced mode opens a cinematic builder for title, description, category, tags, priority and deadline.
					</div>
				</CardContent>
			</Card>

			{advancedCreateOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setAdvancedCreateOpen(false)} />
					<div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 text-white shadow-2xl shadow-black/60 backdrop-blur-2xl">
						<div className="pointer-events-none absolute inset-0">
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.22),transparent_32%),radial-gradient(circle_at_90%_10%,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.18),transparent_30%)]" />
							<div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:56px_56px]" />
						</div>

						<div className="relative space-y-6 p-6 md:p-8">
							<div className="space-y-3">
								<div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/70 backdrop-blur-xl">
									<Sparkles size={14} />
									advanced builder
								</div>
								<h2 className="text-3xl text-white md:text-4xl">Create a fully styled task</h2>
								<p className="max-w-2xl text-white/60">
									Capture the title, description, metadata and deadline in one place. The quick flow stays minimal, this one is for the full cinematic setup.
								</p>
							</div>

							<div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
								<div className="space-y-4">
									<div className="space-y-2">
										<div className="text-sm uppercase tracking-[0.24em] text-white/50">Title</div>
										<Input
											value={advancedTitle}
											onChange={(event) => setAdvancedTitle(event.target.value)}
											placeholder="Launch the release demo"
											className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
										/>
									</div>

									<div className="space-y-2">
										<div className="text-sm uppercase tracking-[0.24em] text-white/50">Description</div>
										<Textarea
											value={advancedDescription}
											onChange={(event) => setAdvancedDescription(event.target.value)}
											placeholder="Add enough context so the task is immediately actionable."
											className="min-h-36 border-white/20 bg-white/10 text-white placeholder:text-white/40"
										/>
									</div>

									<div className="rounded-3xl border border-white/10 bg-white/5 p-4">
										<div className="mb-3 flex items-center justify-between">
											<div>
												<div className="text-sm uppercase tracking-[0.24em] text-white/50">Live preview</div>
												<div className="text-sm text-white/60">This is how the task will feel on the board.</div>
											</div>
											<Tag size={16} className="text-cyan-200" />
										</div>

										<div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
											<div className="text-lg font-semibold text-white">{advancedTitle || "Untitled task"}</div>
											<div className="text-sm leading-6 text-white/60">
												{advancedDescription || "Your description, if you choose to add one, will appear here."}
											</div>
											<div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em]">
												<span className={`rounded-full border px-2.5 py-1 ${priorityClasses[advancedPriority]}`}>
													{priorityLabels[advancedPriority]}
												</span>
												{advancedCategory.trim() ? (
													<span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-white/75">
														{advancedCategory.trim()}
													</span>
												) : null}
												{advancedDeadline ? (
													<span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-cyan-100">
														{formatDeadline(advancedDeadline)}
													</span>
												) : null}
											</div>
										</div>
									</div>
								</div>

								<div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/20">
									<div className="space-y-2">
										<div className="text-sm uppercase tracking-[0.24em] text-white/50">Category</div>
										<Input
											value={advancedCategory}
											onChange={(event) => setAdvancedCategory(event.target.value)}
											placeholder="Design, launch, bug, research..."
											className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
										/>
									</div>

									<div className="space-y-2">
										<div className="text-sm uppercase tracking-[0.24em] text-white/50">Priority</div>
										<select
											value={advancedPriority}
											onChange={(event) => setAdvancedPriority(event.target.value as TaskPriority)}
											className="h-10 w-full rounded-md border border-white/20 bg-white/10 px-3 text-sm text-white outline-none transition focus:ring-2 focus:ring-white/20"
										>
											<option value="low" className="bg-slate-900 text-white">Low priority</option>
											<option value="medium" className="bg-slate-900 text-white">Medium priority</option>
											<option value="high" className="bg-slate-900 text-white">High priority</option>
										</select>
									</div>

									<div className="space-y-2">
										<div className="text-sm uppercase tracking-[0.24em] text-white/50">Tags</div>
										<Input
											value={advancedTags}
											onChange={(event) => setAdvancedTags(event.target.value)}
											placeholder="frontend, release, urgent"
											className="border-white/20 bg-white/10 text-white placeholder:text-white/40"
										/>
										<div className="text-xs text-white/45">Comma separated. These tags will be searchable later.</div>
									</div>

									<div className="space-y-2">
										<div className="text-sm uppercase tracking-[0.24em] text-white/50">Deadline</div>
										<DeadlinePicker value={advancedDeadline} onChange={setAdvancedDeadline} />
									</div>
								</div>
							</div>

							<div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
								<Button
									type="button"
									variant="outline"
									onClick={() => setAdvancedCreateOpen(false)}
									className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
								>
									Cancel
								</Button>
								<Button
									type="button"
									onClick={submitAdvanced}
									disabled={!advancedTitle.trim()}
									className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400 bg-[length:200%_200%] dashboard-shimmer hover:opacity-95 hover:shadow-lg hover:shadow-pink-500/20"
								>
									Create task
								</Button>
							</div>
						</div>
					</div>
				</div>
			) : null}
		</>
	)
}

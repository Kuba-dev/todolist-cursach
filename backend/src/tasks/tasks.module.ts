import { Module } from "@nestjs/common"
import { TasksService } from "./tasks.service"
import { TasksController } from "./tasks.controller"
import { SubtasksController } from "./subtasks.controller"
import { SubtasksService } from "./subtasks.service"

@Module({
	controllers: [TasksController, SubtasksController],
	providers: [TasksService, SubtasksService]
})
export class TasksModule {}

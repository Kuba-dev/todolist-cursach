"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dashboard = Dashboard;
const react_query_1 = require("@tanstack/react-query");
const tasks_1 = require("@/shared/api/tasks");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
function Dashboard() {
    const { data, refetch } = (0, react_query_1.useQuery)({
        queryKey: ["tasks"],
        queryFn: () => tasks_1.tasksApi.getAll().then(res => res.data)
    });
    return (<div className="mx-auto max-w-3xl p-10">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-3xl font-bold">My Tasks</h1>

				<button_1.Button onClick={() => refetch()}>
					Refresh
				</button_1.Button>
			</div>

			<div className="space-y-3">
				{data?.map((task) => (<card_1.Card key={task.id}>
						<card_1.CardContent className="flex justify-between p-4">
							<div>
								<div className="font-semibold">
									{task.title}
								</div>
								<div className="text-sm text-gray-500">
									{task.description}
								</div>
							</div>

							<button_1.Button variant="destructive">
								Delete
							</button_1.Button>
						</card_1.CardContent>
					</card_1.Card>))}
			</div>
		</div>);
}
//# sourceMappingURL=index.js.map
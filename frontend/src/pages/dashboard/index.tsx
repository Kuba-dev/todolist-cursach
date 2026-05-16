import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/shared/api/tasks";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CursorGlow } from "@/components/CursorGlow";

export function Dashboard() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => tasksApi.getAll().then((r) => r.data),
  });

  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const createTask = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setTitle("");
    },
  });

  const deleteTask = useMutation({
    mutationFn: tasksApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) =>
      tasksApi.update(id, { title }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const startEdit = (task: any) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const saveEdit = (id: number) => {
    if (!editingTitle.trim()) return;

    updateTask.mutate({
      id,
      title: editingTitle,
    });

    setEditingId(null);
    setEditingTitle("");
  };

  return (
    <div className="min-h-screen relative bg-slate-950 text-white overflow-hidden p-10">
	  <CursorGlow />
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-40" />
        <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[140px] opacity-30" />
        <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-pink-500 rounded-full blur-[120px] opacity-20" />
      </div>

      <div className="relative mx-auto max-w-2xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Tasks
          </h1>

          <Button
            variant="outline"
            onClick={() => navigate("/profile")}
            className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20"
          >
            Profile
          </Button>
        </div>

        <Card className="bg-white/10 border-white/10 backdrop-blur-xl shadow-xl">
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />

            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              disabled={!title.trim()}
              onClick={() => createTask.mutate({ title })}
            >
              Add task
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {data?.length === 0 && (
            <div className="text-center text-white/60 mt-10">
              No tasks yet. Create your first task ✨
            </div>
          )}

          {data?.map((task) => (
            <Card
              key={task.id}
              className="group bg-white/10 border-white/10 backdrop-blur-xl hover:bg-white/15 transition"
            >
              <CardContent className="p-4 flex justify-between items-center">
                {editingId === task.id ? (
                  <Input
                    value={editingTitle}
                    autoFocus
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => saveEdit(task.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(task.id);
                    }}
                    className="bg-white/10 border-white/20 text-white"
                  />
                ) : (
                  <div
                    onClick={() => startEdit(task)}
                    className="text-white font-medium text-lg cursor-pointer hover:text-purple-300 transition w-100"
                  >
                    {task.title}
                  </div>
                )}

                <Button
                  variant="ghost"
                  onClick={() => deleteTask.mutate(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition text-white hover:text-red-400"
                >
                  <Trash size={18} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { api } from "@/shared/api/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CursorGlow } from "@/components/CursorGlow";

export function Profile() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => navigate("/login"));
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white/60">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-slate-950 text-white overflow-hidden p-10">
      <CursorGlow />
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[140px] opacity-30" />
      </div>

      <div className="relative mx-auto max-w-2xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Profile
          </h1>

          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="bg-white/10 border-white/20 backdrop-blur-md hover:bg-white/20"
          >
            Go to Tasks
          </Button>
        </div>

        <Card className="bg-white/10 border-white/10 backdrop-blur-xl shadow-xl">
          <CardContent className="p-6 space-y-6">
            <div>
              <div className="text-sm text-white/50">Logged in as</div>

              <div className="text-2xl font-semibold mt-1 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                {user.email}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                onClick={() => navigate("/dashboard")}
              >
                Open Tasks
              </Button>

              <Button
                variant="ghost"
                className="text-white hover:text-red-400"
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

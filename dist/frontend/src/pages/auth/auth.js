"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthPage = AuthPage;
const react_1 = require("react");
const api_1 = require("@/shared/api/api");
const auth_1 = require("@/shared/auth");
const react_router_dom_1 = require("react-router-dom");
const input_1 = require("@/components/ui/input");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
function AuthPage() {
    const [email, setEmail] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [mode, setMode] = (0, react_1.useState)("login");
    const navigate = (0, react_router_dom_1.useNavigate)();
    const submit = async () => {
        if (mode === "register") {
            await api_1.api.post("/auth/register", { email, password });
        }
        const res = await api_1.api.post("/auth/login", { email, password });
        auth_1.auth.setUser(res.data.user);
        navigate("/profile");
    };
    return (<div className="flex min-h-screen items-center justify-center bg-slate-100">
			<card_1.Card className="w-[400px]">
				<card_1.CardContent className="space-y-4 pt-6">
					<h1 className="text-2xl font-bold">
						{mode === "login" ? "Login" : "Register"}
					</h1>

					<input_1.Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>

					<input_1.Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>

					<button_1.Button className="w-full" onClick={submit}>
						{mode === "login" ? "Login" : "Register"}
					</button_1.Button>

					<button_1.Button variant="ghost" className="w-full" onClick={() => setMode(mode === "login" ? "register" : "login")}>
						Switch to {mode === "login" ? "register" : "login"}
					</button_1.Button>
				</card_1.CardContent>
			</card_1.Card>
		</div>);
}
//# sourceMappingURL=auth.js.map
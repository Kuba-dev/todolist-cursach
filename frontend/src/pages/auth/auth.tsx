import { useState } from "react"
import { api } from "@/shared/api/api"
import { auth } from "@/shared/auth"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CursorGlow } from "@/components/CursorGlow"

export function AuthPage() {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [mode, setMode] = useState<"login" | "register">("login")
	const [loading, setLoading] = useState(false)

	const [touched, setTouched] = useState({
		email: false,
		password: false,
	})

	const [errors, setErrors] = useState<{
		email?: string
		password?: string
		form?: string
	}>({})

	const navigate = useNavigate()

	const validate = () => {
		const newErrors: typeof errors = {}

		if (!email) {
			newErrors.email = "Email is required"
		} else if (!/^\S+@\S+\.\S+$/.test(email)) {
			newErrors.email = "Enter a valid email"
		}

		if (!password) {
			newErrors.password = "Password is required"
		} else if (mode === "register" && password.length < 8) {
			newErrors.password = "Minimum 8 characters"
		} else if (mode === "register" && !/[A-Z]/.test(password)) {
			newErrors.password = "Must contain uppercase letter"
		} else if (mode === "register" && !/[0-9]/.test(password)) {
			newErrors.password = "Must contain number"
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const submit = async () => {
		try {
			setLoading(true)
			setErrors({})

			setTouched({
				email: true,
				password: true,
			})

			if (!validate()) return

			if (mode === "register") {
				await api.post("/auth/register", { email, password })
			}

			const res = await api.post("/auth/login", {
				email,
				password,
			})

			const token =
				typeof res.data === "string"
					? res.data
					: res.data?.accessToken

			if (!token) {
				setErrors({ form: "Invalid login response" })
				return
			}

			localStorage.setItem("token", token)
			auth.setUser(res.data.user)

			navigate("/profile")
		} catch (e: any) {
			setErrors({
				form:
					e?.response?.data?.message ||
					"Something went wrong",
			})
		} finally {
			setLoading(false)
		}
	}

	const inputClass = (hasError?: boolean) =>
		`bg-white/10 border text-white placeholder:text-white/40 transition
		${
			hasError
				? "border-red-500 focus:border-red-500"
				: "border-white/20 focus:border-purple-400"
		}`

	return (
		<div className="min-h-screen relative flex items-center justify-center bg-slate-950 text-white overflow-hidden p-6">
			<CursorGlow />

			<div className="absolute inset-0">
				<div className="absolute -top-40 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[120px] opacity-40" />
				<div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[140px] opacity-30" />
			</div>

			<Card className="relative w-[420px] bg-white/10 border-white/10 backdrop-blur-xl shadow-2xl">
				<CardContent className="space-y-4 pt-6">

					<h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
						{mode === "login"
							? "Welcome back"
							: "Create account"}
					</h1>

					{errors.form && (
						<div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-md">
							{errors.form}
						</div>
					)}

					<div>
						<Input
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							onBlur={() =>
								setTouched((p) => ({
									...p,
									email: true,
								}))
							}
							className={inputClass(
								touched.email && !!errors.email
							)}
						/>

						{touched.email && errors.email && (
							<p className="text-xs text-red-400 mt-1">
								{errors.email}
							</p>
						)}
					</div>

					<div>
						<Input
							placeholder="Password"
							type="password"
							value={password}
							onChange={(e) =>
								setPassword(e.target.value)
							}
							onBlur={() =>
								setTouched((p) => ({
									...p,
									password: true,
								}))
							}
							className={inputClass(
								touched.password &&
									!!errors.password
							)}
						/>

						{touched.password && errors.password && (
							<p className="text-xs text-red-400 mt-1">
								{errors.password}
							</p>
						)}
					</div>

					<Button
						className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
						onClick={submit}
						disabled={loading}
					>
						{loading
							? "Loading..."
							: mode === "login"
							? "Login"
							: "Register"}
					</Button>

					<Button
						variant="ghost"
						className="w-full text-white hover:text-pink-300"
						onClick={() => {
							setErrors({})
							setTouched({
								email: false,
								password: false,
							})
							setMode(
								mode === "login"
									? "register"
									: "login"
							)
						}}
					>
						{mode === "login"
							? "No account? Register"
							: "Already have account? Login"}
					</Button>
				</CardContent>
			</Card>
		</div>
	)
}
import { useEffect, useRef } from "react"

export function CursorGlow() {
	const glowRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		let x = window.innerWidth / 2
		let y = window.innerHeight / 2

		let targetX = x
		let targetY = y

		const move = (e: MouseEvent) => {
			targetX = e.clientX
			targetY = e.clientY
		}

		const animate = () => {
			x += (targetX - x) * 0.08
			y += (targetY - y) * 0.08

			if (glowRef.current) {
				glowRef.current.style.transform = `translate(${x - 300}px, ${y - 300}px)`
			}

			requestAnimationFrame(animate)
		}

		window.addEventListener("mousemove", move)
		animate()

		return () => window.removeEventListener("mousemove", move)
	}, [])

	return (
		<div
			ref={glowRef}
			className="
				pointer-events-none fixed top-0 left-0
				w-[600px] h-[600px] rounded-full
				opacity-40 blur-[120px]
				bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500
				transition-transform
			"
		/>
	)
}
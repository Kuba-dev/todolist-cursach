import { Controller, Get, Req } from "@nestjs/common"
import { Request } from "express"

@Controller("debug")
export class DebugController {
	@Get("headers")
	headers(@Req() req: Request) {
		// Return incoming request headers for debugging Swagger behaviour
		return req.headers
	}
}

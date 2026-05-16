import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import * as cookieParser from "cookie-parser"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	app.use(cookieParser())
	app.enableCors({
		origin: "http://localhost:5173",
		credentials: true
	})

	const config = new DocumentBuilder()
		.setTitle("API Swagger")
		.setDescription("TODO Swagger")
		.setVersion("1.0")
		.addTag("TODO")
		.addBearerAuth(
			{ type: "http", scheme: "bearer", bearerFormat: "JWT" },
			"JWT-auth" // matches @ApiBearerAuth('JWT-auth') in controllers
		)
		.build()
	const document = SwaggerModule.createDocument(app, config)

	// Apply global security so Swagger UI shows Authorize for Bearer token
	document.security = [{ "JWT-auth": [] }]

	SwaggerModule.setup("api", app, document, {
		swaggerOptions: {
			persistAuthorization: true
		}
	})

	await app.listen(3000)
}

bootstrap()

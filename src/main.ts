import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import * as cookieParser from "cookie-parser"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	app.use(cookieParser())

	const config = new DocumentBuilder()
		.setTitle("API Swagger")
		.setDescription("TODO Swagger")
		.setVersion("1.0")
		.addTag("TODO")
		.build()
	const documentFactory = () => SwaggerModule.createDocument(app, config)
	SwaggerModule.setup("api", app, documentFactory)

	await app.listen(3000)
}

bootstrap()

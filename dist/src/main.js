"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookieParser = require("cookie-parser");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(cookieParser());
    app.enableCors();
    const config = new swagger_1.DocumentBuilder()
        .setTitle("API Swagger")
        .setDescription("TODO Swagger")
        .setVersion("1.0")
        .addTag("TODO")
        .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" }, "JWT-auth")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    document.security = [{ "JWT-auth": [] }];
    swagger_1.SwaggerModule.setup("api", app, document, {
        swaggerOptions: {
            persistAuthorization: true
        }
    });
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map
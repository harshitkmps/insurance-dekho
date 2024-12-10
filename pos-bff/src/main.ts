require("dotenv").config();
if (process.env.NEW_RELIC_ENABLED === "true") {
  require("newrelic");
}
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Logger, ValidationPipe } from "@nestjs/common";
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from "@nestjs/swagger";
import express from "express";
import { WinstonModule } from "nest-winston";
import basicAuth from "express-basic-auth";
import { AppModule } from "./app.module";
import { createWinstonModuleOptions } from "./utils/logger";
import hpp from "hpp";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import requestMiddleware from "./middlewares/request.middleware";
import { join } from "path";
import { cwd } from "process";

class Main {
  private static instance: Main;

  public static getInstance() {
    if (!Main.instance) {
      Main.instance = new Main();
    }
    return Main.instance;
  }

  public async initServer() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: WinstonModule.createLogger(createWinstonModuleOptions()),
    });
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      })
    );
    this.bootstrap(app);
    const port = this.getAppPort(app);
    const env = this.getAppEnv(app);
    await app.listen(port);
    app.setBaseViewsDir(join(cwd(), "views"));
    app.setViewEngine("ejs");
    Logger.log(`BFF running on port ${port} and environment ${env}`);
  }

  private bootstrap(app: NestExpressApplication): void {
    this.initBodyParsing(app);
    this.enableCORS(app);
    this.initializeOtherMiddlewares(app);
    this.initSwagger(app);
  }

  private initBodyParsing(app: NestExpressApplication): void {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  }

  private getAppPort(app: NestExpressApplication): number {
    const configService = app.get(ConfigService);
    return configService.get("PORT");
  }

  private getAppEnv(app: NestExpressApplication): string {
    const configService = app.get(ConfigService);
    return configService.get("NODE_ENV");
  }

  private initSwagger(app: NestExpressApplication): void {
    app.use(
      "/api-doc",
      basicAuth({
        challenge: true,
        users: {
          pos: "pos",
        },
      })
    );

    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle("POS BFF")
      .setDescription("BFF Created for pos web and app")
      .setVersion("1.0.0")
      .build();
    const document = SwaggerModule.createDocument(app, config);

    const customOptions: SwaggerCustomOptions = {
      customSiteTitle: "POS BFF",
    };

    SwaggerModule.setup("/api-doc", app, document, customOptions);
  }

  private enableCORS(app: NestExpressApplication): void {
    app.enableCors({
      exposedHeaders: ["X-Total-Count", "Content-Type"],
      origin: "*",
    });
  }

  private initializeOtherMiddlewares(app: NestExpressApplication): void {
    app.use(hpp());
    app.use(helmet());
    app.use(compression());
    app.use(cookieParser());
    app.use(requestMiddleware);
  }
}

const main = Main.getInstance();
main.initServer();

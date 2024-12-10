import "reflect-metadata";
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import {
  useContainer as useContainerRoutingControllers,
  useExpressServer,
  getMetadataArgsStorage,
} from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import swaggerUi from "swagger-ui-express";
import {
  NODE_ENV,
  PORT,
  LOG_FORMAT,
  ORIGIN,
  CREDENTIALS,
  MONGO_URL,
} from "@config";
import errorMiddleware from "@middlewares/error.middleware";
import { logger, stream } from "@utils/logger";
import Container from "typedi";
import mongoose from "mongoose";
import connectRabbitMq from "@/config/rabbitMq";
import requestMiddleware from "./middlewares/request.middleware";
import setupEmailListener from "./usecase/mail/mail-service";

if (process.env.NODE_ENV === "production") {
  const newrelic = require("newrelic");
  newrelic.instrumentLoadedModule("express", express);
}

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(Controllers: Function[]) {
    this.app = express();
    this.env = NODE_ENV || "development";
    this.port = PORT || 3080;
    this.initializeMiddlewares();
    this.initializeRoutes(Controllers);
    this.initializeSwagger(Controllers);
    this.initializeErrorHandling();
    this.app.use(requestMiddleware);
  }

  public listen() {
    this.app.listen(this.port || 4000, () => {
      logger.info("=================================");
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info("=================================");
      this.connectMongo();
      connectRabbitMq();
      setupEmailListener();
    });
  }

  public connectMongo() {
    mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      keepAlive: true,
      bufferMaxEntries: 0,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    mongoose.connection.on("error", function (e) {
      logger.error("db: mongodb error ", e);
      // reconnect here
    });

    mongoose.connection.on("connected", function () {
      console.log("db: mongodb is connected: ", MONGO_URL);
    });

    mongoose.connection.on("disconnected", function () {
      console.log("db: mongodb is disconnected");
    });

    mongoose.connection.on("reconnected", function () {
      console.log("db: mongodb is reconnected: ", MONGO_URL);
    });

    mongoose.connection.on("timeout", function (e) {
      logger.error("db: mongodb timeout ", e);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json({ limit: "200mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "200mb" }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(controllers: Function[]) {
    useExpressServer(this.app, {
      cors: {
        origin: ORIGIN,
        credentials: CREDENTIALS,
      },
      routePrefix: "/api",
      controllers,
      defaultErrorHandler: false,
    });
    useContainerRoutingControllers(Container);
  }

  private initializeSwagger(controllers: Function[]) {
    const routingControllersOptions = {
      controllers: controllers,
      routePrefix: "/api",
    };

    const storage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(storage, routingControllersOptions, {
      components: {
        securitySchemes: {
          bearer: {
            scheme: "bearer",
            bearerFormat: "JWT",
            type: "http",
            routePrefix: "/api",
          },
        },
      },
      info: {
        description: "Download Service",
        title:
          "Download Service created for downloading bulk data from any service",
        version: "1.0.0",
      },
    });

    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;

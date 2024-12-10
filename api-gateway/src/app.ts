"use strict";

// https://stackoverflow.com/questions/35706164/typescript-import-as-vs-import-require
import cors from "cors";
import express from "express";
import helmet from "helmet";
// tslint:disable-next-line: no-var-requires
const robots = require("express-robots-txt");
import * as bodyParser from "body-parser";
import methodOverride from "method-override";
import * as path from "path";
import { MongoDB } from "./config/database/mongodb";
import { RedisClient } from "./config/database/redisClient";
import { ResponseMiddleware } from "./middlewares/commonMiddlewares/ResponseMiddleware";
import { RegisterRoutes } from "./routes";
import { Routes } from "./routes/index";
import { ConfigurationHelper } from "./helper/configurationHelper";
import cookieParser = require("cookie-parser");
import { C } from "./config/constants/constants";
export class App {

    public app: express.Express;
    public mongoDb: any;
    public redisClient: any;

    constructor() {
        this.app = express();
        this.mongoDb = new MongoDB();
        this.redisClient = new RedisClient();
        this.bootstrap();
    }

    public initServer(): void {

        this.app.listen(process.env.PORT, () => {

            let staticContentMaxAge = 0;
            if (process.env.NODE_ENV === "production") {
                staticContentMaxAge = 1000 * 60 * 60 * 24;
            }

            this.app.use(express.static(path.join(__dirname, "/public"), { maxAge: staticContentMaxAge }));

            console.log("API Gateway Service initializing in " + process.env.NODE_ENV + " environment");
            console.log("API Gateway Service server listening on port " + process.env.PORT);
        });
    }

    private bootstrap() {

        this.enableProxy();
        this.initHelmet();
        this.initBodyParser();
        this.initMethodOverride();
        this.enableCORS();
        this.app.use(cookieParser());

        this.generateRobotsFile();

        this.initRoutes();
        ConfigurationHelper.getApiGatewayConfiguration();
        // this.defineSwaggerDoc();

        // it's position should be at last, final middleware to return response with success/error
        this.sendResponse();
    }

    private enableProxy(): void {

        // if your server is behind a proxy,
        this.app.enable("trust proxy");
    }

    private initHelmet(): void {

        this.app.use(helmet());
    }

    private initBodyParser(): void {

        // Url Encoded Data
        this.app.use(bodyParser.urlencoded({
            extended: true,
            limit: "50mb",
        }));

        // to Support JSON Encoded Bodies
        this.app.use(bodyParser.json({
            type: "application/json", limit: "50mb",
        }));

        this.app.set("views", __dirname + "/views");
        this.app.engine("html", require("ejs").renderFile);
    }

    private initMethodOverride(): void {

        this.app.use(methodOverride("X-HTTP-Method-Override"));
    }

    private enableCORS(): void {

        const whitelist = C.WHITELISTED_ORIGINS;
        this.app.use(cors({
            exposedHeaders: ["X-Total-Count", "Content-Type"],
            origin(origin: any, callback) {
                let pass: any = false;
                // allow requests with no origin
                // (like mobile apps or curl requests)
                if (!origin) { return callback(null, true); }
                for (const domain of whitelist) {
                    if (origin && origin.includes(domain)) {
                        pass = true;
                    }
                }
                if (pass) {
                    callback(null, true);
                } else {
                    callback(new Error("The CORS policy does not allow access from the Origin : " + origin), false);
                }
            },
            credentials : true,
        }));
    }

    private generateRobotsFile(): void {

        this.app.use(robots({ UserAgent: "*", Disallow: "/" }));
    }

    private initRoutes(): void {

        const routes = new Routes(this.app);
        this.app.use(routes.router);
    }

    private sendResponse(): void {
        this.app.use(ResponseMiddleware.sendResponse);
    }

    private defineSwaggerDoc(): void {

        RegisterRoutes(this.app);
        const swaggerDocument = require("../swagger.json");
        // this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }
}

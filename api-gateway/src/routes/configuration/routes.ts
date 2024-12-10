import { Request, Response, Router } from "express";

import { ResponseFormatter } from "../../lib/ResponseFormatter";
import { MessagesConstants as msgConst } from "../../config/constants/messages.constants";

import { ConfigurationService } from "../../core/services/configuration/ConfigurationService";

import swaggerUi = require("swagger-ui-express");
import {swagger as swaggerDocument} from "../../../swagger/swagger";
import { LoggingMiddleware } from "../../middlewares/groupMiddlewares/LoggingMiddleware";
const loggingMiddleware = new LoggingMiddleware();
export class ConfigurationRoutes {

    public router: Router = Router();
    constructor(app: Router) {

        this.index(app);
    }

    /**
     * Define all routes here
     * @param app
     */
    public index(app: Router): void {

        this.router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        this.router.get("/serverHealth", (req: Request, res: Response) => {
            res.status(200).send({ data: "Server Health - OK" });
        });

        // this.router.use(loggingMiddleware.execute);
        this.router.get(`/`, async (req: Request, res: Response, next) => {
            try {
                const controller = new ConfigurationService();
                controller.getConfiguration(req, res).then((responseData) => {
                    next({ isSuccess: true, data: responseData });
                }).catch((Ex) => {
                    next({ data: Ex });
                });
            } catch (err) {
                const error = ResponseFormatter.getErrorResponseWithBody(500, "CONF001", msgConst.SOMETHING_WENT_WRONG, err);
                next({ data: error });
            }
        });

        this.router.post(`/`, async (req: Request, res: Response, next) => {
            try {
                const controller = new ConfigurationService();
                controller.setConfiguration(req, res).then((responseData) => {
                    next({ isSuccess: true, data: responseData });
                }).catch((Ex) => {
                    next({ data: Ex });
                });
            } catch (err) {
                const error = ResponseFormatter.getErrorResponseWithBody(500, "CONF002", msgConst.SOMETHING_WENT_WRONG, err);
                next({ data: error });
            }
        });

    }
}

import { Request, Response, Router } from "express";
import { C } from "../../config/constants/constants";

import { ResponseFormatter } from "../../lib/ResponseFormatter";
import { MessagesConstants as msgConst } from "../../config/constants/messages.constants";

import {configurableMiddleware} from "../../middlewares/commonMiddlewares/ConfigurableMiddleware";

import swaggerUi = require("swagger-ui-express");
import { RedirectionService } from "../../core/services/redirection/redirectionService";

export class GroupRoutes {

    public router: Router = Router();
    private baseRoute = "/api/v1";
    private iamRoute = "/iam";

    constructor(app: Router) {

        this.index(app);
    }

    /**
     * Define all routes here
     * @param app
     */
    public index(app: Router): void {

        this.router.use(configurableMiddleware);

        this.router.all(`/*`, async (req: Request, res: Response, next) => {
            try {
                const Redirection = new RedirectionService();
                Redirection.redirect(req, res).then((responseData: any) => {
                    console.log("Redirection Op Successful");
                    next({ isSuccess: true, data: responseData.apiResponse, version : responseData.version});
                }).catch((Ex) => {
                    next({ data: Ex });
                });
            } catch (err) {
                const error = ResponseFormatter.getErrorResponseWithBody(500, "DEMO001", msgConst.SOMETHING_WENT_WRONG, err);
                next({ data: error });
            }
        });

    }
}

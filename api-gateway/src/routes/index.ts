import { Request, Response, Router } from "express";

import { ConfigurationRoutes } from "./configuration/routes";

import { GroupRoutes } from "./group/routes";

export class Routes {

    public router: Router = Router();
    public configurationRoute: any;
    public groupRoute: any;

    private app: Router;

    constructor(app: Router) {
        this.configurationRoute = new ConfigurationRoutes(app);
        this.groupRoute = new GroupRoutes(app);

        this.app = app;
        this.index(app);
    }

    public index(app: Router): void {
        this.router.get("/serverHealth", (req: Request, res: Response) => {
            res.status(200).send({ data: "Server Health - OK" });
        });

        /**
         * Route for security purpose
         */
        this.router.get("/sureroute-test-object.html", (req: Request, res: Response) => {
            res.render("sureroute-test-object.html");
        });
        // this.app.use("/api/v1/group", this.groupRoute.router);

        this.app.use("/api/v1/configuration", this.configurationRoute.router);

        this.app.use("/*", this.groupRoute.router);

    }

}

import { Utils } from "../../lib/Utils";
export class MiddlewareIndexer {

    public static async getGroupMiddleware(middlewareName: string) {
        try {
            const middlewarePath = `../groupMiddlewares/${Utils.capitalize(middlewareName)}Middleware`;
            const middleware = (await import(middlewarePath))[Utils.capitalize(middlewareName) + "Middleware"];
            return Promise.resolve(middleware);
        } catch (err) {
            return Promise.reject(err);
        }
    }

    constructor() {
    }

}

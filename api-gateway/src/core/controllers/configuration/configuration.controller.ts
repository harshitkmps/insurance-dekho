import { Request, Response, Router } from "express";
import { ConfigurationService } from "../../services/configuration/ConfigurationService";

export class ConfigurationController {
    private configurationService = new ConfigurationService();
    constructor() { }

    public async getConfiguration(req: Request, res: Response) {

        try {
                const processData: any = await this.configurationService.getConfiguration(req, res);
                // return something here
                return Promise.resolve(processData);

        } catch (err) {
            return Promise.reject(err);
        }
    }

    public async setConfiguration(req: Request, res: Response) {

        try {
                const processData: any = await this.configurationService.setConfiguration(req, res);
                // return something here
                return Promise.resolve(processData);

        } catch (err) {
            return Promise.reject(err);
        }
    }
}

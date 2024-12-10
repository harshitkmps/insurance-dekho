import { any } from "superstruct";

class PlaceDetailsRedashLogger {
    baseCost: Number = 0;

    getCost(req: any, res: any, err: any): Number {
        if(this.getStatusCode(req, res, any) !== 200)
            return 0;

        return this.baseCost;
    }

    getStatusCode(req: any, res: any, err: any): Number {
        return (res?.data?.status || 'FAILED') === 'OK' ? 200 : 400;
    }
}

export default new PlaceDetailsRedashLogger();
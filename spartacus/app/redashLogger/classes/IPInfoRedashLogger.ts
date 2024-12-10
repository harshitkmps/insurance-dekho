class IPInfoRedashLogger {
    baseCost: Number = 0;

    getCost(req: any, res: any, err: any): Number {
        if(this.getStatusCode(req, res, err) !== 200)
            return 0;
        
        return this.baseCost;
    }

    getStatusCode(req: any, res: any, err: any): Number {
        if(err) 
            return err?.response?.status || 400;
        else 
            return res?.status || 400;
    }
}

export default new IPInfoRedashLogger();
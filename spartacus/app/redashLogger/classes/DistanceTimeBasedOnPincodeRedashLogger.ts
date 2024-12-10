class DistanceTimeBasedOnPincode {
    baseCost = 0.005;

    getCost(req: any, res: any, err: any): Number {
        if(this.getStatusCode(req, res, err) !== 200)
            return 0;

        const numberOfOrigins = req?.params?.origins?.split('|')?.length || 0;
        const numberOfDestinations= req?.params?.destinations?.split('|')?.length || 0;

        return numberOfDestinations * numberOfOrigins * this.baseCost;
    }

    getStatusCode(req: any, res: any, err: any): Number {
        return (res?.data?.status || 'FAILED') === 'OK' ? 200 : 400;
    }

}

export default new DistanceTimeBasedOnPincode();
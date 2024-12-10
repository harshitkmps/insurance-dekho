declare namespace Express {

    export interface Request {

        __apiLogRequestId?: string,
    }

    export interface Response {

        __responseData?: any,
        __path? : string,
        __body? : any
    }
}
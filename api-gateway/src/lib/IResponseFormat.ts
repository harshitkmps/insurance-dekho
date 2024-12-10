export interface IErrorResponseBodyOptionalParams {
    errCategory?: string;
    planId?: string;
    proposalStatus?: number;
    errorObj?: {};
}

export interface IErrorResponseBody extends IErrorResponseBodyOptionalParams {
    code: string;
    message: string;
    error: string;
}

export interface IErrorResponseFormat {
    status: number;
    body: IErrorResponseBody[];
}

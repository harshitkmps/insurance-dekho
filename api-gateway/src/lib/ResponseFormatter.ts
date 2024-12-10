import { IErrorResponseBody, IErrorResponseBodyOptionalParams, IErrorResponseFormat } from "./IResponseFormat";

export class ResponseFormatter {

    public static messageFormatter(message: string, options: string[]): string {

        // message = message.format.apply(message, options);
        // console.log(message.trim())
        // return message.trim();
        return message;
    }

    /**
     *
     * @param code
     * @param message
     * @param detail
     * @param displayMessage
     * @param options
     */
    public static getErrorResponseBody(code: string, message: string, error: any): IErrorResponseBody {

        const errorObject: IErrorResponseBody = {
            code: "", message: "Something Went Wrong", error: "",
        };

        errorObject.code = code;
        errorObject.message = message;
        errorObject.error = error;

        return errorObject;
    }

    /**
     * @returns IErrorResponseFormat
     * @param httpErrorCode number
     * @param errorObject IErrorResponseBody
     */
    public static getErrorResponse(httpErrorCode: number, errorObject: IErrorResponseBody): IErrorResponseFormat {

        const returnErrorObject: IErrorResponseFormat = {
            status: 0, body: [],
        };
        let errorArray: IErrorResponseBody[] = [];

        if (Array.isArray(errorObject)) {
            errorArray = errorObject;
        } else {
            errorArray.push(errorObject);
        }

        returnErrorObject.status = httpErrorCode;
        returnErrorObject.body = errorArray;

        return returnErrorObject;
    }

    /**
     * @param httpErrorCode
     * @param code
     * @param message
     * @param detail
     * @param displayMessage
     * @param options
     */
    public static getErrorResponseWithBody(httpErrorCode: number, code: string, message: string, error: any): IErrorResponseFormat {

            const errorObject = this.getErrorResponseBody(code, message, error);
            return this.getErrorResponse(httpErrorCode, errorObject);
    }
    constructor() {

    }
}

import { RedashRequestTypes } from "@app/enums/RedashRequstTypes";

export interface redash {
    requestType: RedashRequestTypes,
    cost: Number,
    statusCode?: Number, 
    created_at?: Date,
}
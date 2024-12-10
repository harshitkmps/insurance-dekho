/**
 * Author   -   Ankit Shukla
 * Usage    -   used for storing x-correlation-id in async local storage
 */

// below comment states that this file is ignored during testing using jest
/* istanbul ignore file */

import { v4 } from "uuid";
const { AsyncLocalStorage } = require("async_hooks");
import _ from "lodash";

const storage = new AsyncLocalStorage();

const getCorrelationId = async () => {
    if(storage.getStore()) {
        return { "x-correlation-id" : await storage.getStore().get("x-correlation-id") };
    }
    return { "x-correlation-id" : v4() };
}

const getMetaData = async () => {
    if(storage.getStore()) {
        return { "x-meta-data" : await storage.getStore().get("x-meta-data") };
    }
    return { "x-meta-data" : {} };
}

const getStackTraceData = async () => {
    if(storage.getStore()) {
        return { "x-log-trace" : await storage.getStore().get("x-log-trace") };
    }
    return { "x-log-trace" : {} };
}

const setCorrelationId = async(x_correlation_id: any, store: any, next: any) => {
    storage.run(store, () => {
        store.set("x-correlation-id", x_correlation_id);
        next();
    });
}

const setMetaData = async(data:any) => {
    const store = await storage.getStore();
    if(!store) return;
    const metaData = await storage.getStore().get("x-meta-data");
    await storage.run(store, () => {
        store.set("x-meta-data", {...metaData, ...data});
    });
    return;
}

const setStackTraceData = async(data:any) => {
    const store = await storage.getStore();
    if(!store) return;
    let stackTraceData = await storage.getStore().get("x-log-trace");
    if(!stackTraceData) stackTraceData = [];
    await storage.run(store, () => {
        store.set("x-log-trace", _.concat(data,stackTraceData));
    });
    return;
}

export default { setCorrelationId, getCorrelationId, storage, setMetaData, getMetaData, setStackTraceData, getStackTraceData }
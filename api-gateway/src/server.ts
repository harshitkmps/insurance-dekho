// tslint:disable-next-line: no-var-requires
import dotnev = require("dotenv");
dotnev.config();
if (process.env.NODE_ENV === "production") {
    // tslint:disable-next-line: no-var-requires
    require("newrelic");
}
import { App } from "./app";

const app = new App();
app.initServer();

export default app.app;
/******************************** Application level handling : Start *********************/
// Log uncaught exception as well
process.on("uncaughtException", (exception) => {

    console.log("########## SERVER CRASHED WITH UNCAUGHT EXCEPTION ##########");

    const err = exception;
    if (typeof err === "object") {
        if (err.message) {
            console.log("\nMessage: " + err.message);
        }
        if (err.stack) {
            console.log("\nStacktrace:");
            console.log("====================");
            console.log(err.stack);
        }
    } else {

        console.log("dumpError :: argument is not an object");
    }
});

process.on("warning", (warning) => {
    console.log("########## APPLICATION WARNING START ##########");
    console.log(warning);
    console.log("########## APPLICATION WARNING END ##########");
});

// Or run project with : node --trace-warnings app.js
process.on("unhandledRejection", (reason: any, p: any) => {
    console.log("Unhandled Rejection at: Promise", p, "reason:", reason.stack);
    console.dir(reason.stack);
    // application specific logging, throwing an error, or other logic here
});

/******************************** Application level handling : End *********************/

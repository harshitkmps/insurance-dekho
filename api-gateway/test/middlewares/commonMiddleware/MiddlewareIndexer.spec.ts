import chai from "chai";
const expect = chai.expect;
import sinon from "sinon";
import { MiddlewareIndexer } from "../../../src/middlewares/commonMiddlewares/MiddlewareIndexer"
import { Utils } from "../../../src/lib/Utils";

describe("Test: MiddlewareIndexer()", () => {

    beforeEach(function () {
        sinon.restore();
    });

    it(" should fetch the correct group Middleware successfully ", async function () {

        const response: any = await MiddlewareIndexer.getGroupMiddleware("Logging");
        // console.log('response==>', response,typeof(response));
        expect(response).to.exist;
        expect(response).to.be.an("function");
    });

    it(" should throw error  ", async function () {

        const stub = sinon.stub(Utils, "capitalize").throws(Error);
        const response: any = await expect(MiddlewareIndexer.getGroupMiddleware("Authentication")).to.be.rejected;
        // console.log('response==>', response);
        expect(response).to.be.an("error");

    });

});
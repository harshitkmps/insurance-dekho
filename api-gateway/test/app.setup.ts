import chai from 'chai';
import { should } from 'chai'
import chaiHttp from 'chai-http';
import app from '../src/server'

should();
chai.use(chaiHttp);

before(function (done) {

    this.timeout(10000);
    /**
     * To check server readiness
     */
    chai.request(app)
        .get('/api/v1/configuration/serverHealth')
        .end(function (err, res) {
            console.log("Server health is okay");
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            done();
        });
});

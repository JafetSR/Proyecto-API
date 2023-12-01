const chai = require('chai');
const expect = require('chai').expect;
const { app } = require('../index.js')
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe("Pruebas Con ChaiHttp a las rutas del servidor", () => {
    it("Prueba método GET a la ruta /oceano, debe devolver un status 200", () => {
        chai.request(app)
            .get('/oceano')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });
    it("Prueba método GET a la ruta /oceano/cat/:category, debe devolver un status 200", () => {
        chai.request(app)
            .get('/oceano/cat/5')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
            });
    });
});
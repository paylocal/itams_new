const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const deleteTranslation = require('./deleteTranslation'); // Adjust the path accordingly

describe('deleteTranslation', () => {
    let req;
    let res;
    let deleteTranslationById;

    beforeEach(() => {
        req = { params: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
            send: sinon.stub()
        };
        deleteTranslationById = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return 400 for invalid translation ID (empty)', () => {
        req.params.id = '';
        deleteTranslation(req, res);
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.args[0][0]).to.deep.equal({ error: 'Invalid translation ID' });
    });

    it('should return 400 for invalid translation ID (negative)', () => {
        req.params.id = '-1';
        deleteTranslation(req, res);
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.args[0][0]).to.deep.equal({ error: 'Invalid translation ID' });
    });

    it('should return 400 for invalid translation ID (zero)', () => {
        req.params.id = '0';
        deleteTranslation(req, res);
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.args[0][0]).to.deep.equal({ error: 'Invalid translation ID' });
    });

    it('should return 400 for invalid translation ID (large)', () => {
        req.params.id = '12345678901234567890';
        deleteTranslation(req, res);
        expect(res.status.calledWith(400)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.args[0][0]).to.deep.equal({ error: 'Invalid translation ID' });
    });

    it('should handle successful deletion', () => {
        req.params.id = 123;
        deleteTranslationById.resolves();
        deleteTranslation(req, res);
        expect(deleteTranslationById.calledOnceWith(123)).to.be.true;
        expect(res.status.calledWith(204)).to.be.true;
        expect(res.send.calledOnce).to.be.true;
    });

    it('should handle deletion error', () => {
        req.params.id = 123;
        deleteTranslationById.rejects(new Error('Database error'));
        deleteTranslation(req, res);
        expect(deleteTranslationById.calledOnceWith(123)).to.be.true;
        expect(console.error.calledOnce).to.be.true;
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledOnce).to.be.true;
        expect(res.json.args[0][0]).to.deep.equal({ error: 'Internal server error' });
    });
});
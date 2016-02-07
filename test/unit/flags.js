import flags from '../../src/middleware/flags';
import {expect} from 'chai';
import Request from 'mock-express-request';
import Response from 'mock-express-response';
import sinon from 'sinon';

async function getFlagsFromHeaders(headers) {
    const req = new Request({
        headers: headers || {}
    });
    const res = new Response();
    const next = sinon.spy();
    flags(req, res, next);
    next.should.have.been.calledOnce.and.calledWith();
    return req.flags;
}

describe('flags', function() {
    it('should be a function', function() {
        expect(flags).to.exist
            .and.to.be.a('function');
    });

    it('defaults', async function() {
        (await getFlagsFromHeaders()).should.deep.equal({
            preferSingular: false,
            preferCount: true,
            preferRepresentation: 'headersOnly'
        });
    });

    it('Prefer: plurality=singular', async function() {
        (await getFlagsFromHeaders({Prefer: 'plurality=singular'}))
        .should.deep.equal({
            preferSingular: true,
            preferCount: true,
            preferRepresentation: 'headersOnly'
        });
    });

    it('Prefer: count=none', async function() {
        (await getFlagsFromHeaders({Prefer: 'count=none'}))
        .should.deep.equal({
            preferSingular: false,
            preferCount: false,
            preferRepresentation: 'headersOnly'
        });
    });

    it('Prefer: return=representation', async function() {
        (await getFlagsFromHeaders({Prefer: 'return=representation'}))
        .should.deep.equal({
            preferSingular: false,
            preferCount: true,
            preferRepresentation: 'full'
        });
    });

    it('Prefer: return=minimal', async function() {
        (await getFlagsFromHeaders({Prefer: 'return=minimal'}))
        .should.deep.equal({
            preferSingular: false,
            preferCount: true,
            preferRepresentation: 'none'
        });
    });

    it('Unknown prefer header', async function() {
        (await getFlagsFromHeaders({Prefer: 'something=else'})).should.deep.equal({
            preferSingular: false,
            preferCount: true,
            preferRepresentation: 'headersOnly'
        });
    });

});

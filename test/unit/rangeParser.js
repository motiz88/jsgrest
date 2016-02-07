import rangeParser from '../../src/middleware/rangeParser';
import {expect} from 'chai';
import Request from 'mock-express-request';
import Response from 'mock-express-response';
import sinon from 'sinon';

async function parseWithRangeParser(unit, range) {
    const req = new Request({
        headers: {
            'Range-Unit': unit || undefined,
            Range: range
        }
    });
    const res = new Response();
    const next = sinon.spy();
    rangeParser(req, res, next);
    next.should.have.been.calledOnce.and.calledWith();
    return req.range;
}

describe('rangeParser', function() {
    it('should be a function', function() {
        expect(rangeParser).to.exist
            .and.to.be.a('function');
    });

    it('should treat malformed range as items 0-', async function() {
        const rangeAll = {unit: 'items', first: 0, last: Infinity};
        (await parseWithRangeParser('', '')).should.deep.equal(rangeAll);
        (await parseWithRangeParser()).should.deep.equal(rangeAll);
        (await parseWithRangeParser(null, null)).should.deep.equal(rangeAll);
        (await parseWithRangeParser(null, false)).should.deep.equal(rangeAll);
        (await parseWithRangeParser(null, '')).should.deep.equal(rangeAll);
    });

    it('should use the given unit', async function() {
        (await parseWithRangeParser('ni', '')).should.have.property('unit', 'ni');
    });

    it('items 0-1', async function() {
        (await parseWithRangeParser('items', '0-1')).should.deep.equal(
            {unit: 'items', first: 0, last: 1}
        );
    });

    it('items 5-', async function() {
        (await parseWithRangeParser('items', '5-'))
            .should.deep.equal({unit: 'items', first: 5, last: Infinity});
    });

    it('should fail with 416 if first > last', async function() {
        const req = new Request({
            headers: {
                'Range-Unit': 'items',
                Range: '1-0'
            }
        });
        let res = {};
        const next = sinon.spy();
        await new Promise(resolve => {
            res = new Response({finish: resolve});

            rangeParser(req, res, next);
        });
        res.should.have.property('statusCode', 416);
        next.should.not.have.been.called;
        return req.range;
    });
});

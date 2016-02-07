import requestToOffsetLimit from '../../src/query/requestToOffsetLimit';
import {expect} from 'chai';

describe('requestToOffsetLimit', function() {
    it('should be a function', function() {
        expect(requestToOffsetLimit).to.exist
            .and.to.be.a('function');
    });

    it('should return empty object if range unspecified', function() {
        requestToOffsetLimit({})
            .should.deep.equal({});
        requestToOffsetLimit({range: {}})
            .should.deep.equal({});
    });

    it('should return empty object if unit is not "items"', function() {
        requestToOffsetLimit({range: {unit: 'bytes'}})
            .should.deep.equal({});
    });

    it('items 0-1', function() {
        requestToOffsetLimit({
            range: {
                unit: 'items',
                first: 0,
                last: 1
            }
        }).should.deep.equal({offset: 0, limit: 2});
    });

    it('items 5-', function() {
        requestToOffsetLimit({
            range: {
                unit: 'items',
                first: 5
            }
        }).should.deep.equal({offset: 5, limit: undefined});
    });
});

import parseUnitAndRange from '../../src/parseUnitAndRange';
import {expect} from 'chai';

describe('parseUnitAndRange', function() {
    it('should be a function', function() {
        expect(parseUnitAndRange).to.exist
            .and.to.be.a('function');
    });

    it('should treat malformed range as items 0-', function() {
        parseUnitAndRange('', '').should.deep.equal({unit: 'items', first: 0, last: Infinity});
        parseUnitAndRange().should.deep.equal({unit: 'items', first: 0, last: Infinity});
        parseUnitAndRange(null, null).should.deep.equal({unit: 'items', first: 0, last: Infinity});
        parseUnitAndRange(null, false).should.deep.equal({unit: 'items', first: 0, last: Infinity});
        parseUnitAndRange(null, '').should.deep.equal({unit: 'items', first: 0, last: Infinity});
    });

    it('should use the given unit', function() {
        parseUnitAndRange('ni', '').should.have.property('unit', 'ni');
    });

    it('items 0-1', function() {
        parseUnitAndRange('items', '0-1').should.deep.equal({unit: 'items', first: 0, last: 1});
    });

    it('items 5-', function() {
        parseUnitAndRange('items', '5-')
            .should.deep.equal({unit: 'items', first: 5, last: Infinity});
    });
});

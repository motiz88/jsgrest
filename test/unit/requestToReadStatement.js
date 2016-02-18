import requestToReadStatement from '../../src/query/requestToReadStatement';
import {isFragment as isSqlFragment} from '../../src/sqlTemplate';

import {expect} from 'chai';

describe('requestToReadStatement', function() {
    it('should be a function', function() {
        expect(requestToReadStatement).to.exist
            .and.to.be.a('function');
    });

    it('sanity check', function() {
        const stmt = requestToReadStatement({
            flags: {},
            range: {
                unit: 'items',
                first: 0,
                last: 1
            },
            query: {
                order: 'ColA.asc,ColB.desc',
                col: 'eq.0'
            },
            dbConfig: {
                schema: 'public'
            },
            params: {
                relation: 'aTable'
            }
        });
        stmt.should.satisfy(isSqlFragment);
        stmt.text.should.match(/SELECT/i) ;
        stmt.values.should.be.an('array');
    });
});

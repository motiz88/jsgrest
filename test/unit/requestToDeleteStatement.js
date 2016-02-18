import requestToDeleteStatement from '../../src/query/requestToDeleteStatement';
import {isFragment as isSqlFragment} from '../../src/sqlTemplate';

import {expect} from 'chai';

describe('requestToDeleteStatement', function() {
    it('should be a function', function() {
        expect(requestToDeleteStatement).to.exist
            .and.to.be.a('function');
    });

    it('sanity check', function() {
        const stmt = requestToDeleteStatement({
            flags: {},
            query: {
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
        stmt.text.should.match(/DELETE/i) ;
        stmt.values.should.be.an('array');
    });
});

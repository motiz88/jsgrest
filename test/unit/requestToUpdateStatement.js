import requestToUpdateStatement from '../../src/query/requestToUpdateStatement';
import {isFragment as isSqlFragment} from '../../src/sqlTemplate';

import {expect} from 'chai';

describe('requestToUpdateStatement', function() {
    it('should be a function', function() {
        expect(requestToUpdateStatement).to.exist
            .and.to.be.a('function');
    });

    it('sanity check', function() {
        const stmt = requestToUpdateStatement({
            flags: {},
            query: {
                col: 'eq.0'
            },
            dbConfig: {
                schema: 'public'
            },
            params: {
                relation: 'aTable'
            },
            body: {
                col: '123'
            }
        });
        stmt.should.satisfy(isSqlFragment);
        stmt.text.should.match(/UPDATE/i) ;
        stmt.values.should.be.an('array');
    });

    it('should fail if body is empty', function() {
        (() => requestToUpdateStatement({flags: {},
            query: {
                col: 'eq.0'
            },
            dbConfig: {
                schema: 'public'
            },
            params: {
                relation: 'aTable'
            },
            body: {}}))
        .should.throw;

        (() => requestToUpdateStatement({flags: {},
            query: {
                col: 'eq.0'
            },
            dbConfig: {
                schema: 'public'
            },
            params: {
                relation: 'aTable'
            },
            body: null}))
        .should.throw;
    });
});

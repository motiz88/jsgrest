import parse from '../../../src/cli/parse';
import {expect} from 'chai';

describe('parse', function() {
    it('should be defined', function() {
        parse.should.exist;
        parse.should.be.a.function;
    });

    const required = ['postgres://'];

    it('should NOT splice off argv[0], argv[1]', function() {
        parse(['-P', ...required])
            .should.have.property('pure', true);
    });

    it('should throw if connection-string is missing', function() {
        (() => parse(['--schema', 'public'])).should.throw(Error);
    });

    it('should not throw if all required options are provided', function() {
        parse(required);
    });

    it('-h, --help should return null', function() {
        expect(parse(['--help'])).to.be.null;
        expect(parse(['-h'])).to.be.null;
    });

    it('-v, --version should return null', function() {
        expect(parse(['--version'])).to.be.null;
        expect(parse(['-v'])).to.be.null;
    });

    it('connection-string', function() {
        parse(required)
            .should.have.property('connectionString','postgres://');
    });

    it('-P, --pure <-> options.pure', function() {
        parse([...required])
            .should.have.property('pure', false);
        parse([...required,'--pure'])
            .should.have.property('pure', true);
        parse([...required,'-P'])
            .should.have.property('pure', true);
    });

    describe('-p, --port', function() {
        it('should be 80 if not specified', function() {
            parse([...required])
                .should.have.property('port', 80);
        });
        it('should be explicitly specifiable as 81', function() {
            parse([...required, '--port', '81'])
                .should.have.property('port', 81);
            parse([...required, '-p', '81'])
                .should.have.property('port', 81);
        });
        it('should be explicitly specifiable as 80', function() {
            parse([...required, '--port', '80'])
                .should.have.property('port', 80);
            parse([...required, '-p', '80'])
                .should.have.property('port', 80);
        });
        it('should be explicitly specifiable as 8080', function() {
            parse([...required, '--port', '8080'])
                .should.have.property('port', 8080);
            parse([...required, '-p', '8080'])
                .should.have.property('port', 8080);
        });
    });

    describe('--schema', function() {
        it('should be wav if not specified', function() {
            parse([...required])
                .should.have.property('schema', 'public');
        });
        it('should be explicitly specifiable as public', function() {
            parse([...required, '--schema', 'public'])
                .should.have.property('schema', 'public');
        });
        it('should be explicitly specifiable as 1', function() {
            parse([...required, '--schema', '1'])
                .should.have.property('schema', '1');
        });
        it('should be explicitly specifiable as my_Schema', function() {
            parse([...required, '--schema', 'my_Schema'])
                .should.have.property('schema', 'my_Schema');
        });
    });
});

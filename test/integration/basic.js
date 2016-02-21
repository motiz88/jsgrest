import chai, {expect} from 'chai';
import createApp from '../../src/app';
import dbFixtures from '../utils/dbFixtures';

describe('App', function() {
    before(async function() {
        this.timeout(60000);
        await dbFixtures.setup();
    });

    after(async function() {
        await dbFixtures.teardown();
    });


    it('factory (createApp) should be a function', function() {
        expect(createApp).to.exist
            .and.to.be.a('function');
    });

    describe('instance', function() {
        let app;

        before(function() {
            app = createApp({connectionString: dbFixtures.connectionString, schema: 'public'});
        });

        it('should respond to HTTP requests', async function() {
            await chai.request(app)
                .get('/');
        });

        it('should respond with success to "GET /"', async function() {
            const res = await chai.request(app)
                .get('/');
            res.should.have.status(200);
        });
    });

    describe('instance with bad connection string', function() {
        let app;

        before(function() {
            app = createApp({connectionString: 'postgres://nosuchhost', schema: 'public'});
        });

        it('should respond to GET / with failure', function() {
            return chai.request(app)
                .get('/')
                .should.eventually.be.rejected;
        });
    });
});

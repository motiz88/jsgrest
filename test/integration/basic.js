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

        describe('/rpc', function() {
            // TODO: implement rpc routes. In the mean time let's check that they're reserved.
            it('should not allow requests while feature is not implemented', async function() {
                await chai.request(app)
                    .get('/rpc')
                    .should.eventually.be.rejected;
                await chai.request(app)
                    .get('/rpc/whatever')
                    .should.eventually.be.rejected;
            });
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

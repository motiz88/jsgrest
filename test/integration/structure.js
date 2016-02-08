import chai from 'chai';
import createApp from '../../src/app';
import dbFixtures from '../utils/dbFixtures';

describe('GET --> SELECT', function() {
    before(async function() {
        this.timeout(60000);
        await dbFixtures.setup();
    });

    after(async function() {
        await dbFixtures.teardown();
    });

    let app;
    before(function() {
        app = createApp({
            connectionString: dbFixtures.connectionString,
            schema: 'test'
        });
    });

    describe('GET /', function() {
        it('lists views in schema', async function() {
            const res = await chai.request(app).get('/');
            res.should.have.status(200);
            res.body.should.deep.equal([
                {schema: 'test', name: 'Escap3e;', insertable: true},
                {schema: 'test', name: 'articleStars', insertable: true},
                {schema: 'test', name: 'articles', insertable: true},
                {schema: 'test', name: 'authors_only', insertable: true},
                {schema: 'test', name: 'auto_incrementing_pk', insertable: true},
                {schema: 'test', name: 'clients', insertable: true},
                {schema: 'test', name: 'comments', insertable: true},
                {schema: 'test', name: 'complex_items', insertable: true},
                {schema: 'test', name: 'compound_pk', insertable: true},
                {schema: 'test', name: 'empty_table', insertable: true},
                {schema: 'test', name: 'ghostBusters', insertable: true},
                {schema: 'test', name: 'has_count_column', insertable: false},
                {schema: 'test', name: 'has_fk', insertable: true},
                {schema: 'test', name: 'insertable_view_with_join', insertable: true},
                {schema: 'test', name: 'insertonly', insertable: true},
                {schema: 'test', name: 'items', insertable: true},
                {schema: 'test', name: 'json', insertable: true},
                {schema: 'test', name: 'materialized_view', insertable: false},
                {schema: 'test', name: 'menagerie', insertable: true},
                {schema: 'test', name: 'no_pk', insertable: true},
                {schema: 'test', name: 'nullable_integer', insertable: true},
                {schema: 'test', name: 'projects', insertable: true},
                {schema: 'test', name: 'projects_view', insertable: true},
                {schema: 'test', name: 'simple_pk', insertable: true},
                {schema: 'test', name: 'tasks', insertable: true},
                {schema: 'test', name: 'tsearch', insertable: true},
                {schema: 'test', name: 'users', insertable: true},
                {schema: 'test', name: 'users_projects', insertable: true},
                {schema: 'test', name: 'users_tasks', insertable: true},
                {schema: 'test', name: 'withUnique', insertable: true}
            ]);
        });

        it('TODO: lists only views user has permission to see', async function() {
            const res = await chai.request(app).get('/')
                .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
                    + '.eyJyb2xlIjoicG9zdGdyZXN0X3Rlc3RfYXV0aG9yIiwiaWQiOiJqZG9lIn0'
                    + '.y4vZuu1dDdwAl0-S00MCRWRYMlJ5YAMSir6Es6WtWx0');
            res.should.have.status(200);
            res.body.should.deep.equal([
                {schema: 'test', name: 'authors_only', insertable: true}
            ]);
        });
    });

    describe('TODO: Table info', function() {
        it('is available with OPTIONS verb', async function() {
            const res = await chai.request(app).options('/menagerie');
            res.should.have.status(200);
            res.body.should.deep.equal({
                pkey: ['integer'],
                columns: [{
                    default: null,
                    precision: 32,
                    updatable: true,
                    schema: 'test',
                    name: 'integer',
                    type: 'integer',
                    maxLen: null,
                    enum: [],
                    nullable: false,
                    position: 1,
                    references: null
                }, {
                    default: null,
                    precision: 53,
                    updatable: true,
                    schema: 'test',
                    name: 'double',
                    type: 'double precision',
                    maxLen: null,
                    enum: [],
                    nullable: false,
                    references: null,
                    position: 2
                }, {
                    default: null,
                    precision: null,
                    updatable: true,
                    schema: 'test',
                    name: 'varchar',
                    type: 'character varying',
                    maxLen: null,
                    enum: [],
                    nullable: false,
                    position: 3,
                    references: null
                }, {
                    default: null,
                    precision: null,
                    updatable: true,
                    schema: 'test',
                    name: 'boolean',
                    type: 'boolean',
                    maxLen: null,
                    enum: [],
                    nullable: false,
                    references: null,
                    position: 4
                }, {
                    default: null,
                    precision: null,
                    updatable: true,
                    schema: 'test',
                    name: 'date',
                    type: 'date',
                    maxLen: null,
                    enum: [],
                    nullable: false,
                    references: null,
                    position: 5
                }, {
                    default: null,
                    precision: null,
                    updatable: true,
                    schema: 'test',
                    name: 'money',
                    type: 'money',
                    maxLen: null,
                    enum: [],
                    nullable: false,
                    position: 6,
                    references: null
                }, {
                    default: null,
                    precision: null,
                    updatable: true,
                    schema: 'test',
                    name: 'enum',
                    type: 'USER-DEFINED',
                    maxLen: null,
                    enum: [
                        'foo',
                        'bar'
                    ],
                    nullable: false,
                    position: 7,
                    references: null
                }]
            });
        });

        it('it includes primary and foreign keys for views', async function() {
            const res = await chai.request(app).options('/projects_view');
            res.should.have.status(200);
            res.body.should.deep.equal({
                pkey: ['id'],
                columns: [{
                    references: null,
                    default: null,
                    precision: 32,
                    updatable: true,
                    schema: 'test',
                    name: 'id',
                    type: 'integer',
                    maxLen: null,
                    enum: [],
                    nullable: true,
                    position: 1
                }, {
                    references: null,
                    default: null,
                    precision: null,
                    updatable: true,
                    schema: 'test',
                    name: 'name',
                    type: 'text',
                    maxLen: null,
                    enum: [],
                    nullable: true,
                    position: 2
                }, {
                    references: {
                        schema: 'test',
                        column: 'id',
                        table: 'clients'
                    },
                    default: null,
                    precision: 32,
                    updatable: true,
                    schema: 'test',
                    name: 'client_id',
                    type: 'integer',
                    maxLen: null,
                    enum: [],
                    nullable: true,
                    position: 3
                }]
            });
        });

        it('includes foreign key data', async function() {
            const res = await chai.request(app).options('/has_fk');
            res.should.have.status(200);
            res.body.should.deep.equal({
                pkey: ['id'],
                columns: [{
                    default: "nextval('test.has_fk_id_seq'::regclass)",
                    precision: 64,
                    updatable: true,
                    schema: 'test',
                    name: 'id',
                    type: 'bigint',
                    maxLen: null,
                    nullable: false,
                    position: 1,
                    enum: [],
                    references: null
                }, {
                    default: null,
                    precision: 32,
                    updatable: true,
                    schema: 'test',
                    name: 'auto_inc_fk',
                    type: 'integer',
                    maxLen: null,
                    nullable: true,
                    position: 2,
                    enum: [],
                    references: {
                        schema: 'test',
                        table: 'auto_incrementing_pk',
                        column: 'id'
                    }
                }, {
                    default: null,
                    precision: null,
                    updatable: true,
                    schema: 'test',
                    name: 'simple_fk',
                    type: 'character varying',
                    maxLen: 255,
                    nullable: true,
                    position: 3,
                    enum: [],
                    references: {
                        schema: 'test',
                        table: 'simple_pk',
                        column: 'k'
                    }
                }]
            });
        });

        it('includes all information on views for renamed columns, '
            + 'and raises relations to correct schema', async function() {
            const res = await chai.request(app).options('/articleStars');
            res.should.have.status(200);
            res.body.should.deep.equal({
                pkey: [
                    'articleId',
                    'userId'
                ],
                columns: [{
                    references: {
                        schema: 'test',
                        column: 'id',
                        table: 'articles'
                    },
                    default: null,
                    precision: 32,
                    updatable: true,
                    schema: 'test',
                    name: 'articleId',
                    type: 'integer',
                    maxLen: null,
                    enum: [],
                    nullable: true,
                    position: 1
                }, {
                    references: {
                        schema: 'test',
                        column: 'id',
                        table: 'users'
                    },
                    default: null,
                    precision: 32,
                    updatable: true,
                    schema: 'test',
                    name: 'userId',
                    type: 'integer',
                    maxLen: null,
                    enum: [],
                    nullable: true,
                    position: 2
                }, {
                    references: null,
                    default: null,
                    precision: null,
                    updatable: true,
                    schema: 'test',
                    name: 'createdAt',
                    type: 'timestamp without time zone',
                    maxLen: null,
                    enum: [],
                    nullable: true,
                    position: 3
                }]
            });
        });
    });

});

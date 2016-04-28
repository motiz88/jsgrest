import express from 'express';
import sendSelectQuery from './res/sendSelectQuery';
import execQuery from './res/execQuery';
import rootHandler from './handlers/root';
import invokeHandler from './handlers/invoke';
import selectHandler from './handlers/select';
import insertHandler from './handlers/insert';
import updateHandler from './handlers/update';
import deleteHandler from './handlers/delete';
import errorHandler from './middleware/error';
import sendResult from './middleware/sendResult';
import bodyParser from 'body-parser';
import rangeParser from './middleware/rangeParser';
import flagParser from './middleware/flags';
import actionParser from './middleware/actions';

type AppInitArgs = {connectionString: string, schema: string, pure: boolean};

export default function createApp({connectionString, schema, pure}: AppInitArgs) {
    const app = express();

    const parseJson = bodyParser.json({limit: Infinity});


    app.use((req, res, next) => {
        req.dbConfig = {schema, pure};
        res.dbConfig = {connectionString, schema};
        res.execQuery = execQuery;
        res.sendSelectQuery = sendSelectQuery;
        next();
    });

    app.use(actionParser);
    app.use(flagParser);
    app.use(rangeParser);

    app.get('/', rootHandler);

    app.use('/rpc/:relation', parseJson, invokeHandler);

    app.get('/:relation', selectHandler);
    app.post('/:relation', parseJson, insertHandler);
    app.patch('/:relation', parseJson, updateHandler);
    app.delete('/:relation', deleteHandler);

    app.use(sendResult);
    app.use(errorHandler);

    return app;
}

import NonExitingArgumentParser, {ParserSuccessfulExit} from './NonExitingArgumentParser';

import packageJson from '../../package.json';
import coerce from './coerce';


type ParsedArguments = {
    port: number,
    connectionString: string,
    schema: string,
    otherArgs?: any
};

export default function parse(argv: Array<string>): ?ParsedArguments
{
    const parser = new NonExitingArgumentParser({
        version: packageJson.version,
        addHelp: true,
        description: 'Batch processing of approved KnowsMe speech renditions',
        debug: false
    });
    parser.addArgument(['connection-string'], {
        help: 'Postgres connection string',
        type: coerce('URL')
    });
    parser.addArgument(['-p', '--port'], {
        help: 'Port to listen on (default: 80)',
        type: 'int',
        defaultValue: 80,
    });
    parser.addArgument(['--schema'], {
        help: 'Database schema (default: public)',
        type: 'string',
        defaultValue: 'public',
    });

    let args = {};
    try {
        args = parser.parseArgs(argv);
    }
    catch(e) {
        if (e instanceof ParserSuccessfulExit)
            return null;
        else
            throw e;
    }
    const {port, 'connection-string': connectionString, schema, ...otherArgs} = args;

    return {port, connectionString, schema, otherArgs};
}

import {ArgumentParser} from 'argparse';
import {format} from 'util';

export class ParserSuccessfulExit {
    constructor(message) {
        this.message = message;
    }
}

/* istanbul ignore next */
export default class NonExitingArgumentParser extends ArgumentParser {
    constructor(options) {
        super(options);
    }

    exit(status, message) {
        if (message) {
            let err;
            if (message instanceof Error)
                err = message;
            if (status === 0) {
                this._printMessage(message);
                throw err || new ParserSuccessfulExit(message);
            } else {
                this._printMessage(message, process.stderr);
                throw err || new Error(message);
            }
        }

        throw new ParserSuccessfulExit(status);
    }

    error(err) {
        if (err instanceof ParserSuccessfulExit)
            throw err;
        var message;
        if (err instanceof Error) {
                throw err;
        } else {
            message = err;
        }
        var msg = format('%s: error: %s', this.prog, message) + '\n';

        this.printUsage(process.stderr);

        return this.exit(2, msg);

    }
}

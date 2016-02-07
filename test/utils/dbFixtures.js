
import pg from '@motiz88/pg';
import testConfig from '../config.json';
import {exec} from 'mz/child_process';
import shellEscape from 'shell-escape-tag';

function logAndExec(command) {
    console.log(command);
    return exec(command);
}

async function execSqlFile(file, connectionString) {
    const [stdout, stderr] = await logAndExec(shellEscape `${testConfig.database.psql} --file=${file}`
        + ' --quiet --set client_min_messages=warning'
        + shellEscape ` ${connectionString || testConfig.database.connectionStringWithDatabase}`);
    if (stdout)
        console.log(stdout);
    if (stderr)
        throw new Error(stderr);
    return stdout;
}

class TestDb {
    constructor() {

    }


    async setup() {
        await new Promise(
            (resolve, reject) => pg.connect(testConfig.database.connectionString, (err, client, done) => {
                if (err) {
                    done();
                    return reject(err);
                }
                done();

                resolve();
            }));

        if (this.firstSetup) {
            this.firstSetup = false;

            const psqlBanner = await logAndExec(shellEscape `${testConfig.database.psql} --version`);

            if (psqlBanner[0])
                console.log(psqlBanner[0]);
            if (psqlBanner[1])
                console.error(psqlBanner[1]);
            await execSqlFile(require.resolve('../fixtures/database.sql'),
                testConfig.database.connectionString);
            for (const script of ['roles.sql', 'schema.sql', 'privileges.sql'])
                await execSqlFile(require.resolve(`../fixtures/${script}`));
        }


        ++this.setupCount;

        if (this.setupCount === 1) {
            await execSqlFile(require.resolve('../fixtures/data.sql'));
        }

        return this.connectionString;
    }

    teardown() {
        --this.setupCount;
    }

    connectionString = testConfig.database.connectionStringWithDatabase;
    setupCount = 0;
    firstSetup = true;
}

export default new TestDb();

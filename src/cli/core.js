if (process.env.NODE_ENV !== 'production') {
    require('longjohn');
}
import parse from './parse';
import createApp from '../app';

export default async function main(argv) {
    argv = argv || process.argv.slice(2);
    const parsedArgs = parse(argv);
    if (parsedArgs) {
        const app = createApp(parsedArgs);
        console.log(`Listening on port ${parsedArgs.port}`);
        await new Promise(resolve => {
            app.on('close', resolve);
            app.listen(parsedArgs.port);
        });
    }
}

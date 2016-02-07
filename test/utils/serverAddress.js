import http from 'http';
import https from 'https';

export default function serverAddress(app, path) {
    if ('string' === typeof app) {
        return app + path;
    }

    const server = ('function' === typeof app) ? http.createServer(app) : app;

    var addr = server.address();
    if (!addr) {
        server.listen(0);
        addr = server.address();
    }
    const protocol = (server instanceof https.Server) ? 'https' : 'http';
    // If address is "unroutable" IPv4/6 address, then set to localhost
    if (addr.address === '0.0.0.0' || addr.address === '::') {
        addr.address = '127.0.0.1';
    }
    return protocol + '://' + addr.address + ':' + addr.port + path;
}

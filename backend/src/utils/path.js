const app_name = 'farrukhanwar.site';
export function buildPath(route) {
    if (process.env.NODE_ENV != 'development') {
        return 'https://' + app_name + '/' + route;
    }
    else {
        return 'http://localhost:5001/' + route;
    }
}
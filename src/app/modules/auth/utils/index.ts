export function parseUrl (href: string): any {
    let match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
    };
}
export function parseQueryString(queryString: string): any {
    let dictionary: any = {};
    if (queryString.indexOf('?') === 0) {
        queryString = queryString.substr(1);
    }
    let parts = queryString.split('&');
    for (let i = 0; i < parts.length; i++) {
        let p = parts[i];
        let keyValuePair = p.split('=');
        if (keyValuePair.length === 2) {
          let key = keyValuePair[0];
          let value = keyValuePair[1];
          // decode URI encoded string
          value = decodeURIComponent(value);
          value = value.replace(/\+/g, ' ');
          dictionary[key] = value;
        }
    }
    return dictionary;
}

export function copyProperties(source: any, target: any): void {
    for (let prop in source) {
        if (target[prop] !== undefined) {
            target[prop] = source[prop];
        } else {
            console.error('Cannot set undefined property: ' + prop);
        }
    }
}

export * from './jwt-helper';

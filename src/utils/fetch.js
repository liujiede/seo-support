import http from 'http';
import Promise from './promise';

function JsonToQueryString(json) {
    let queryString = [];

    for (let name in json) {
        queryString.push([name, json[name]].join("="));
    }

    return queryString.join("&");
}

export default function Fetch(url, options) {
    options = options || {};
    options.method = (options.method || "GET").toUpperCase();
    options.params = options.params || {};
    options.dataType = options.dataType || 'json';

    return new Promise(function (resolve, reject) {
        var key = (url.indexOf("?") === -1 ? "?" : "&") + url + JsonToQueryString(options.params);
        if (Fetch.cache[key]) {
            resolve(Fetch.cache[key]);
            delete Fetch.cache[key];
        } else {
            Fetch.list.push({
                key: key,
                url: url,
                options: options
            });
        }
    });
}

Fetch.cache = {};
Fetch.list = [];
Fetch.get = function (item) {
    var option = item.option;
    return new Promise(function (resolve, reject) {
        http.get('http://localhost:8080' + item.url, (res) => {
            const statusCode = res.statusCode;
            const contentType = res.headers['content-type'];
            let error;
            if (statusCode !== 200) {
                error = new Error(`请求失败.\n` +
                    `Status Code: ${statusCode}`);
            } else if (!/^application\/json/.test(contentType)) {
                error = new Error('接口返回非 json 格式数据, contentType = ' + contentType);
            }
            if (error) {
                reject(error.message);
                return;
            }
            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => rawData += chunk);
            res.on('end', () => {
                console.log(rawData)
                try {
                    let parsedData = JSON.parse(rawData);
                    resolve(Fetch.cache[item.key] = parsedData);
                } catch (e) {
                    reject(e.message);
                }
            });
        }).on('error', (e) => {
            reject(error.message);
        });
    });
}
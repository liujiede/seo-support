import http from 'http';
import fetch from 'node-fetch';

import Promise from './promise';
global.Promise = fetch.Promise = Promise;

function JsonToQueryString(json) {
    let queryString = [];
    for (let name in json) {
        queryString.push([name, json[name]].join("="));
    }
    return queryString.join("&");
}
function Fetch(url, options = {}) {
    if (!url.includes('//')) {//本地测试用
        url = 'http://localhost:8080' + url;
    }
    options.method = (options.method || "GET").toUpperCase();
    options.params = options.params || {};
    return new Promise((resolve, reject) => {
        var key = url,
            queryStr = JsonToQueryString(options.params);
        if (queryStr) {
            key += (key.includes("?") ? "&" : "?") + queryStr;
        }
        if (Fetch.cache[key] !== undefined) {
            resolve(Fetch.cache[key]);
            delete Fetch.cache[key];
        } else {
            Fetch.list.push(new Promise((resolve, reject) => {
                fetch(url, {
                    method: options.method,
                    mode: options.mode || "cors",
                    headers: options.headers || {},
                    body: options.method === "GET" ? undefined : queryStr,
                    credentials: options.credentials || "same-origin",
                }).then((resp) => {
                    if (resp.ok || resp.status >= 200 && resp.status < 300) {
                        resp.json().then(function (data) {
                            try {
                                data = JSON.parse(data);
                            } catch (e) {
                                data = data.toString();
                            }
                            resolve(Fetch.cache[key] = data);
                            return data;//返回给当前 promise 的下一个 then
                        });
                    } else {
                        console.error('fetch sesponse error :;', resp);
                        resolve(Fetch.cache[key] = '');//吃掉
                    }
                }).catch((error) => {
                    console.error('fetch catch error :;', error);
                    resolve(Fetch.cache[key] = '');//吃掉
                });
            }));
        }
    });
}
Fetch.list = [];
Fetch.cache = {};
Fetch.all = (list = Fetch.list) => Promise.all(list).then(arr => {
    Fetch.list = [];
    return arr;
});

export default Fetch;
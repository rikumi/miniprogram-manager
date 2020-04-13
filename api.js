const path = require('path');
const fs = require('fs');
const qs = require('querystring');
const axios = require('axios').default;
const CookieJar = require('tough-cookie').CookieJar;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
axiosCookieJarSupport(axios);

const jsonPath = path.join(__dirname, 'cookies.json');

/**
 * @type {CookieJar}
 */
let cookieJar;
try {
    cookieJar = CookieJar.fromJSON(fs.readFileSync(jsonPath).toString());
} catch (e) {
    cookieJar = new CookieJar();
}

process.on('exit', () => {
    fs.writeFileSync(jsonPath, JSON.stringify(cookieJar.toJSON()));
});

const baseURL = 'https://mp.weixin.qq.com/';

const api = axios.create({
    baseURL: baseURL,
    jar: cookieJar,
    validateStatus: s => s < 400,
    headers: {
        'referer': baseURL,
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36',
    },
    proxy: {
        host: '127.0.0.1',
        port: 8899
    },
    withCredentials: true,
    transformRequest: (req) => {
        if (typeof req === 'object') {
            return qs.stringify(req);
        }
        return req;
    }
});

const getCookie = (key) => {
    return (cookieJar.getCookiesSync(baseURL).find(cookie => cookie.key === key) || {}).value;
}

module.exports = {
    api,
    jsonPath,
    getCookie,
    cookieJar,
};
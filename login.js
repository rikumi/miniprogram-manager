/**
 * 预登录，获取二维码，得到临时 cookie 并保存
 */
const fs = require('fs');
const crypto = require('crypto');
const qs = require('querystring');
const { resp } = require('./resp');
const { api, jsonPath, cookieJar } = require('./api');
const { MemoryCookieStore } = require('tough-cookie');
const sleep = t => new Promise(r => setTimeout(r, t));

const md5pwd = (password) => {
    return crypto.createHash('md5').update(password.substr(0, 16)).digest().toString('hex');
}

const getSessionToken = async () => {
    // 检查是否已登录
    // 这里需要使用一个克隆的 Cookie Jar，因为返回的 Cookie 会导致登录态失效，这里克隆一个新的 Jar 消除其影响
    const { headers } = await api.get('/', {
        maxRedirects: 0,
        jar: cookieJar.cloneSync(new MemoryCookieStore())
    });
    if (headers.location) {
        return qs.parse(headers.location.split('?')[1]).token;
    }
    return false;
}

const getQR = async (username, password, qrcodePath) => {
    try {
        fs.unlinkSync(qrcodePath);
    } catch (e) {}

    // 已有登录态不再登录
    let token = await getSessionToken();
    if (token) {
        return;
    }

    // 预登录
    await api.post('/cgi-bin/bizlogin?action=startlogin', {
        username,
        pwd: md5pwd(password),
    });

    // 获取二维码
    const res = await api.get('/cgi-bin/loginqrcode?action=getqrcode&param=4300&rd=300', {
        responseType: 'stream'
    });

    res.data.pipe(fs.createWriteStream(qrcodePath));
};

const awaitLogin = async () => {
    // 已有登录态不再登录
    let token = await getSessionToken();
    if (token) {
        return;
    }

    // 轮询扫码登录状态
    while (true) {
        const { status } = resp(await api.get('/cgi-bin/loginqrcode?action=ask&token=&lang=zh_CN&f=json&ajax=1'));

        // 二维码过期
        if (status === 3) {
            throw Error('二维码过期');
        }

        if (status === 1) {
            break;
        }

        await sleep(3);
    }

    // 扫码成功拿登录态
    await api.post('/cgi-bin/bizlogin?action=login');
}

const logout = () => {
    try {
        fs.unlinkSync(jsonPath);
    } catch (e) {}
}

module.exports = {
    getQR,
    getSessionToken,
    awaitLogin,
    logout,
};
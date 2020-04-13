const qs = require('querystring');
const { api } = require('./api');
const { resp } = require('./resp');
const { getSessionToken } = require('./login');

const searchVersion = async (name, search_field = 'describe') => {
    const token = await getSessionToken();
    if (!token) {
        throw Error('登录态失效');
    }

    // 获取小程序版本列表
    const res = resp(await api.get('/wxamp/cgi/route?' + qs.stringify({
        path: encodeURIComponent('/wxopen/wacodepage?' + qs.stringify({
            action: 'getcodepage',
            f: 'json',
            token,
            lang: 'zh_CN',
        })),
        token,
        lang: 'zh_CN',
        random: Math.random()
    })));

    const versionList = JSON.parse(res['code_data'])['develop_info']['info_list']
        .map(v => v.basic_info)
        .filter(k => k[search_field] === name);
    
    // 符合要求的版本只能有一个，否则认为有问题
    if (versionList.length > 1) {
        throw Error(`存在 ${versionList.length} 个符合条件的开发版，请手动去除重复后再试`);
    }
    if (versionList.length < 1) {
        console.log(JSON.parse(res['code_data'])['develop_info']['info_list'])
        throw Error('找不到符合条件的开发版');
    }
    
    return versionList[0];
};

const getExperienceVersion = async () => {
    const token = await getSessionToken();
    if (!token) {
        throw Error('登录态失效');
    }

    // 获取小程序版本列表
    const res = resp(await api.get('/wxamp/cgi/route?' + qs.stringify({
        path: encodeURIComponent('/wxopen/wacodepage?' + qs.stringify({
            action: 'getcodepage',
            f: 'json',
            token,
            lang: 'zh_CN',
        })),
        token,
        lang: 'zh_CN',
        random: Math.random()
    })));

    return (JSON.parse(res['code_data'])['develop_info']['info_list']
        .filter(k => k.is_exper)[0] || {})['basic_info'];
};

const setExperienceVersion = async (versionId) => {
    const token = await getSessionToken();
    if (!token) {
        throw Error('登录态失效');
    }

    const expVersion = await getExperienceVersion();

    if (expVersion) {
        // 清除已有的体验版
        await api.post('/wxamp/cgi/route?' + qs.stringify({
            path: encodeURIComponent('/wxopen/wadevelopcode?action=delete_exper'),
            token,
            lang: 'zh_CN',
            random: Math.random()
        }), {
            openid: expVersion.open_id,
            version: expVersion.version,
        });
    }

    // 根据 openid 找到语义化版本号
    const { version } = await searchVersion(versionId, 'open_id');

    // 设置体验版
    const res = await api.post('/wxamp/cgi/route?' + qs.stringify({
        path: encodeURIComponent('/wxopen/wadevelopcode?action=sumit_exper'),
        token,
        lang: 'zh_CN',
        random: Math.random()
    }), {
        openid: versionId,
        version
    });

    if (res.data.ret !== 0) {
        console.log(res.data);
        throw Error('设置体验版失败');
    }
};

const submitVersion = async (versionId, desc) => {
    const token = await getSessionToken();
    if (!token) {
        throw Error('登录态失效');
    }

    // 提交审核
    const res = await api.post('/wxamp/cgi/route?' + qs.stringify({
        path: encodeURIComponent('/wxopen/wadevelopcode?action=submit_check'),
        token,
        lang: 'zh_CN',
        random: Math.random()
    }), {
        ticket: 'qrcheckTicket',
        openid: versionId,
        auto_id: 30,
        version_desc: desc,
        speedup_audit: 0,
        speedup_type: '其他',
        speedup_desc: '',
        encrypted_username: '',
        encrypted_password: '',
        remark: '',
        feedback_info: '',
        feedback_status: 1,
        preview_info: '{"pic_id_list":[],"video_id_list":[]}',
        feedback_stuff: '',
    });

    if (res.data.ret !== 0) {
        throw Error('提交审核失败');
    }
};

module.exports = {
    searchVersion,
    getExperienceVersion,
    setExperienceVersion,
    submitVersion,
};
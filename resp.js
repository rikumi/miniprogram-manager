const resp = (res) => {
    if (!res.data) {
        res.data = {};
    }

    const data = res.data;
    const ret = data.base_resp && data.base_resp.ret || data.ret || 0;
    const err = data.base_resp && data.base_resp.err_msg;

    if (!ret) {
        delete res.data.base_resp;
        delete res.data.ret;
        return res.data;
    } else {
        throw Error(err || '未知错误');
    }
}

module.exports = { resp };
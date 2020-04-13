const resp = (res) => {
    const base_resp = res && res.data && res.data.base_resp || {};
    if (!base_resp.ret) {
        delete res.data.base_resp;
        return res.data;
    } else {
        throw Error(base_resp.err_msg || 'request fail');
    }
}

module.exports = { resp };
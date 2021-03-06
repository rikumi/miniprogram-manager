const { getQR, awaitLogin, logout } = require('./login');
const { searchVersion, getExperienceVersion, setExperienceVersion, deleteExperienceVersion, submitVersion } = require('./version');
const argv = process.argv.slice(2);

const usage = (length, usage) => {
    if (argv.length < length) {
        console.log(`Usage: mpman ${usage}`);
        process.exit();
    }
};

(async () => {
    if (argv[0] === 'get-qr') {
        usage(4, 'get-qr <username> <password> <qrcode-path>');
        getQR(...argv.slice(1));
    }
    
    if (argv[0] === 'await-login') {
        awaitLogin();
    }
    
    if (argv[0] === 'logout') {
        logout();
    }
    
    if (argv[0] === 'search-version') {
        usage(2, `search-version <version-desc> [search-field] [grep-field]
            search-field: default "describe"
              grep-field: default "open_id"`);
        console.log((await searchVersion(...argv.slice(1)))[argv[3] || 'open_id']);
    }
    
    if (argv[0] === 'get-exp') {
        usage(1, `get-exp [grep-field]
            grep-field: default "open_id"`);
        console.log((await getExperienceVersion())[argv[1] || 'open_id']);
    }
    
    if (argv[0] === 'set-exp') {
        usage(2, 'set-exp <version-id>');
        setExperienceVersion(argv[1]);
    }
    
    if (argv[0] === 'del-exp') {
        deleteExperienceVersion();
    }
    
    if (argv[0] === 'submit') {
        usage(3, 'submit <version-id> <desciption>');
        submitVersion(...argv.slice(1));
    }
})();
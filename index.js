const { getQR, awaitLogin } = require('./login');
const { searchVersion, getExperienceVersion, setExperienceVersion, submitVersion } = require('./version');
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
    
    if (argv[0] === 'search-version') {
        usage(2, `search-version <version-desc> [search-field]
            search-field: default "describe"`);
        console.log((await searchVersion(...argv.slice(1))).open_id);
    }
    
    if (argv[0] === 'get-exp') {
        console.log((await getExperienceVersion()).open_id);
    }
    
    if (argv[0] === 'set-exp') {
        usage(2, 'set-exp <version-id>');
        setExperienceVersion(argv[1]);
    }
    
    if (argv[0] === 'submit') {
        usage(3, 'submit <version-id> <desciption>');
        submitVersion(...argv.slice(1));
    }
})();
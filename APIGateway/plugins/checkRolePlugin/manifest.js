module.exports = {
    version: '1.0.0',
    init: function (pluginContext) {
        console.log('Initializing checkRole plugin');
        let policy = require('./policies/checkRole');
        pluginContext.registerPolicy(policy);
        console.log('checkRole policy registered');
    }
};

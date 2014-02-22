var auth = require('./auth');

module.exports = {
    basicAuth: [ auth.api, auth.app ],
    adminAuth: [ auth.api, auth.app, auth.admin ],
    uploadFile: function () {
        return function (req, res, next) {
            // TODO handle uploaded file
        };
    }
};

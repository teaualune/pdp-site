var auth = require('./auth');

module.exports = {
    auth: {
        basic: [ auth.api, auth.app ],
        admin: [ auth.api, auth.app, auth.admin ],
        self: [auth.api, auth.app, auth.self ]
    },
    uploadFile: function () {
        return function (req, res, next) {
            // TODO handle uploaded file
        };
    },
    defaultHandler: function (res) {
        return function (err, resource) {
            if (err) {
                res.send(500);
            } else if (resource) {
                res.send(resource);
            } else {
                res.send(404);
            }
        };
    },
    destroyHandler: function (res) {
        return function (err) {
            if (err) {
                res.send(500);
            } else {
                res.send(200);
            }
        };
    }
};

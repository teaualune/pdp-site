var multiparty = require('multiparty'),
    path = require('path'),
    auth = require('./auth'),
    settings = require('../settings.json');

module.exports = {
    auth: {
        basic: [ auth.api, auth.app ],
        admin: [ auth.api, auth.app, auth.admin ],
        self: [auth.api, auth.app, auth.self ]
    },
    uploadFile: function (folder) {
        return function (req, res, next) {
            (new multiparty.Form({
                autoFiles: true,
                uploadDir: path.join(__dirname, '..', settings.uploadDir, folder)
            })).parse(req, function (err, fields, files) {
                var body, v;
                if (err) {
                    res.send(500);
                } else {
                    body = {};
                    for (v in fields) {
                        if (fields.hasOwnProperty(v)) {
                            body[v] = fields[v][0];
                        }
                    }
                    body.filePath = files[0].path;
                    req.body = body;
                    next();
                }
            });
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

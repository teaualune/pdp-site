var multiparty = require('multiparty'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    ObjectId = require('mongoose').Types.ObjectId,
    auth = require('./auth'),
    settings = require('../settings.json'),
    uploadDir = function () {
        return path.join(__dirname, '..', settings.uploadDir.root);
    };

module.exports = {
    auth: {
        basic: [ auth.api, auth.app ],
        admin: [ auth.api, auth.app, auth.admin ],
        self: [auth.api, auth.app, auth.self ]
    },
    uploadDir: uploadDir,
    uploadFile: function (folder) {
        return function (req, res, next) {
            (new multiparty.Form({
                autoFiles: true,
                uploadDir: path.join(uploadDir(), folder)
            })).parse(req, function (err, fields, files) {
                var body, v;
                if (err) {
                    res.send(500);
                } else {
                    body = {};
                    _.each(fields, function (value, key) {
                        body[key] = value[0];
                    });
                    try {
                        v = _.sample(files);
                        body.file = {
                            path: v[0].path,
                            extension: path.extname(v[0].path)
                        };
                    } catch (e) {
                        body.file = null;
                    }
                    req.body = body;
                    next();
                }
            });
        };
    },
    isSubmissionExpired: function (deadline, callback) {
        var now = (new Date()).getTime();
        if (now > deadline) {
            callback('submission has missed the deadline');
        } else {
            callback(null);
        }
    },
    defaultHandler: function (res, plugin) {
        return function (err, resource) {
            if (err) {
                console.log(err)
                res.send(500, err);
            } else if (resource) {
                if (plugin) {
                    resource = plugin(resource);
                }
                res.send(resource);
            } else {
                res.send(400);
            }
        };
    },
    emptyHandler: function (res) {
        return function (err) {
            if (err) {
                res.send(500, err);
            } else {
                res.send(200);
            }
        };
    }
};

var multiparty = require('multiparty'),
    fs = require('fs'),
    path = require('path'),
    ObjectId = require('mongoose').Types.ObjectId,
    auth = require('./auth'),
    settings = require('../settings.json'),
    uploadDir = function () {
        return path.join(__dirname, '..', settings.uploadDir);
    },
    extension = /(\.[0-9a-z]+)$/i;

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
                    for (v in fields) {
                        if (fields.hasOwnProperty(v)) {
                            body[v] = fields[v][0];
                        }
                    }
                    try {
                        for (v in files) {
                            if (files.hasOwnProperty(v)) {
                                body.file = {
                                    path: files[v][0].path,
                                    extension: extension.exec(files[v][0].path)[1]
                                };
                                break;
                            }
                        }
                    } catch (e) {
                        body.file = null;
                    }
                    req.body = body;
                    next();
                }
            });
        };
    },
    filePathToFileURL: function (filePath) {
        ;
    },
    defaultHandler: function (res) {
        return function (err, resource) {
            if (err) {
                console.log(err)
                res.send(500);
            } else if (resource) {
                res.send(resource);
            } else {
                res.send(400);
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

var async = require('async'),
    mongoose = require('mongoose'),
    path = require('path'),
    fs = require('fs'),
    H = require('../model/homework'),
    utils = require('./routes-utils'),
    emailValidation = require('../config/email-validation'),
    getSubmissionFilePath = function (submissionFileName, extension) {
        return path.join(utils.uploadDir(), 'hws', submissionFileName + extension);
    }
    Homework = H.Homework,
    HomeworkSubmission = H.HomeworkSubmission;

module.exports = function (app) {

    // GET /api/hw
    // get all homeworks
    app.get('/api/hw', utils.auth.basic, function (req, res) {
        Homework.find({}, utils.defaultHandler(res));
    });

    // POST /api/hw
    // create a new homework
    app.post('/api/hw', utils.auth.admin.concat(utils.uploadFile('hw')), function (req, res) {
        var filePath;
        if (req.body.file) {
            filePath = req.body.file.path;
        } else {
            filePath = '';
        }
        Homework.create({
            title: req.body.title,
            description: req.body.description,
            manualFilePath: filePath
        }, utils.defaultHandler(res));
    });

    // GET /api/hw/:hwid
    // get homework by id
    app.get('/api/hw/:hwid', utils.auth.basic, function (req, res) {
        Homework.findById(req.params.hwid, utils.defaultHandler(res));
    });

    // PUT /api/hw/:hwid
    // update homework
    app.put('/api/hw/:hwid', utils.auth.admin.concat(utils.uploadFile('hw')), function (req, res) {
        async.waterfall([
            function (callback) {
                Homework.findById(req.params.hwid, callback);
            },
            function (hw, callback) {
                if (!hw) {
                    callback('attempt to update unexist homework');
                } else if (req.body.file) {
                    if (hw.manualFilePath == '') {
                        hw.manualFilePath = req.body.file.path;
                        callback(null, hw);
                    } else {
                        fs.unlink(hw.manualFilePath, function (err) {
                            // ignore this error
                            console.log(err);
                            hw.manualFilePath = req.body.file.path;
                            callback(null, hw);
                        });
                    }
                } else {
                    callback(null, hw);
                }
            },
            function (hw, callback) {
                hw.title = req.body.title || hw.title;
                hw.description = req.body.description || hw.description;
                hw.save(callback);
            }
        ], utils.defaultHandler(res));
    });

    // DELETE /api/hw/:hwid
    // delete homework
    app.delete('/api/hw/:hwid', utils.auth.admin, function (req, res) {
        Homework.findByIdAndRemove(req.params.hwid, utils.destroyHandler(res));
    });

    // GET /api/hws
    // get all homework submissions
    app.get('/api/hws', utils.auth.admin, function (req, res) {
        HomeworkSubmission.find({}, utils.defaultHandler(res));
    });

    // GET /api/hw/:hwid/hws
    // get all homework submissions of a homework
    app.get('/api/hw/:hwid/hws', utils.auth.admin, function (req, res) {
        HomeworkSubmission.findByHomework(req.params.hwid, utils.defaultHandler(res));
    });

    // GET /api/user/:uid/hw
    // get all {homework, homework submission} of a user
    // hws is put under hw
    app.get('/api/user/:uid/hw', utils.auth.self, function (req, res) {
        Homework.find({}, function (err, homeworks) {
            if (err) {
                res.send(500);
            } else if (homeworks) {
                async.map(homeworks, function (hw, callback) {
                    HomeworkSubmission.findOne({
                        author: req.params.uid,
                        target: hw._id
                    }, function (err, hws) {
                        if (err) {
                            callback(err);
                        } else if (hws) {
                            hw.submision = hws;
                            callback(null, hw);
                        } else {
                            callback(null, hw);
                        }
                    });
                }, utils.defaultHandler(res));
            } else {
                res.send(400);
            }
        });
    });

    // POST /api/user/:uid/hw
    // create or update a homework submission
    app.post('/api/user/:uid/hw', utils.auth.self.concat(utils.uploadFile('hws')), function (req, res) {
        if (req.body.file) {
            HomeworkSubmission.findByAuthorAndHomework(req.params.uid, req.body.hwid, function (err, hws) {
                var studentID = emailValidation.getStudentID(req.user.email),
                    fileName = HomeworkSubmission.submissionFileName(studentID, req.body.hwid),
                    filePath = getSubmissionFilePath(fileName, req.body.file.extension);
                if (err) {
                    res.send(500);
                } else if (hws) {
                    // update
                    fs.unlink(hws.filePath, function (err) {
                        // ignore err
                        fs.rename(req.body.file.path, filePath, function (err) {
                            // ignore err
                            hws.filePath = filePath;
                            hws.save(utils.defaultHandler(res));
                        });
                    });
                } else {
                    // create
                    fs.rename(req.body.file.path, filePath, function (err) {
                        var hwid = parseInt(req.body.hwid, 10);
                        HomeworkSubmission.create({
                            _id: new mongoose.Types.ObjectId,
                            author: req.params.uid,
                            target: hwid,
                            filePath: filePath
                        }, utils.defaultHandler(res));
                    });
                }
            });
        } else {
            res.send(400);
        }
    });

    // GET /api/user/:uid/hws/:hwsid
    // get homework submission by id
    app.get('/api/user/:uid/hws/:hwsid', utils.auth.self, function (req, res) {
        HomeworkSubmission.findById(req.params.hwsid, utils.defaultHandler(res));
    });

    // GET /api/user/:uid/hw/:hwid
    // get homework submission by user and homework id
    // hws is put under hw
    app.get('/api/user/:uid/hw/:hwid', utils.auth.self, function (req, res) {
        HomeworkSubmission.findByAuthorAndHomework(req.params.uid, req.params.hwid, utils.defaultHandler(res));
    });

    // PUT /api/hws/:hwsid
    // grades a homework submission (admin only)
    app.put('/api/hws/:hwsid', utils.auth.admin, function (req, res) {
        HomeworkSubmission.findById(req.params.hwsid, function (err, hws) {
            if (err) {
                res.send(500);
            } else if (hws) {
                hws.grading = req.body.grading || hws.grading;
                hws.comment = req.body.comment || hws.comment;
                hws.save(utils.defaultHandler(res));
            } else {
                res.send(404);
            }
        });
    });

};

var async = require('async'),
    mongoose = require('mongoose'),
    path = require('path'),
    fs = require('fs'),
    _H = require('../model/homework'),
    User = require('../model/user'),
    Grading = require('../model/grading'),
    CrossGrading = require('../model/cross-grading'),
    utils = require('./routes-utils'),
    emailValidation = require('../config/email-validation'),
    _UD = require('../settings.json').uploadDir,
    hwFolder = _UD.homework,
    hwsFolder = _UD.homeworkSubmission,
    getSubmissionFilePath = function (submissionFileName, extension) {
        return path.join(utils.uploadDir(), 'hws', submissionFileName + extension);
    },
    Homework = _H.Homework,
    HomeworkSubmission = _H.HomeworkSubmission,

    stripOne = function (one) {
        return one.strip();
    },
    stripAllHomeworks = function (homeworks) {
        return Homework.stripHomeworks(homeworks);
    },
    stripAllHomeworkSubmissions = function (submissions) {
        return HomeworkSubmission.stripSubmissions(submissions);
    },

    showHomeworkSubmission = function (req, res) {
        HomeworkSubmission.findById(req.params.hwsid).populate('grading author').exec(function (err, hws) {
            var data, grading, author;
            if (err) {
                data = 500;
            } else if (hws) {
                author = hws.author.strip();
                if (hws.grading) {
                    grading = hws.grading.strip();
                }
                data = hws.strip();
                data.author = author;
                if (grading) {
                    data.grading.grading;
                }
            } else {
                data = 400;
            }
            res.send(data);
        });
    };

module.exports = function (app) {

    // GET /api/hw
    // get all homeworks
    app.get('/api/hw', utils.auth.basic, function (req, res) {
        Homework.find({}, utils.defaultHandler(res, stripAllHomeworks));
    });

    // POST /api/hw
    // create a new homework
    app.post('/api/hw', utils.auth.admin.concat(utils.uploadFile(hwFolder)), function (req, res) {
        var filePath,
            deadline = (new Date(req.body.deadline)).getTime();
        if (req.body.file) {
            filePath = req.body.file.path;
        } else {
            filePath = '';
        }
        if (!deadline) {
            return res.send(400, 'invalid deadline date format');
        }
        Homework.create({
            title: req.body.title,
            description: req.body.description,
            deadline: deadline,
            manualFilePath: filePath
        }, utils.defaultHandler(res, stripOne));
    });

    // GET /api/hw/:hwid
    // get homework by id
    app.get('/api/hw/:hwid', utils.auth.basic, function (req, res) {
        Homework.findById(req.params.hwid, utils.defaultHandler(res, stripOne));
    });

    // PUT /api/hw/:hwid
    // update homework
    app.put('/api/hw/:hwid', utils.auth.admin.concat(utils.uploadFile(hwFolder)), function (req, res) {
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
                var deadline = new Date(req.body.deadline);
                hw.title = req.body.title || hw.title;
                hw.description = req.body.description || hw.description;
                hw.deadline = deadline.getTime() || hw.deadline;
                hw.save(callback);
            }
        ], utils.defaultHandler(res, stripOne));
    });

    // DELETE /api/hw/:hwid
    // delete homework
    app.delete('/api/hw/:hwid', utils.auth.admin, function (req, res) {
        Homework.findByIdAndRemove(req.params.hwid, utils.emptyHandler(res));
    });

    // GET /api/hws
    // get all homework submissions
    app.get('/api/hws', utils.auth.admin, function (req, res) {
        HomeworkSubmission.find({}, utils.defaultHandler(res, stripAllHomeworkSubmissions));
    });

    // GET /api/hw/:hwid/hws
    // get all homework submissions of a homework
    // return an array of { author: User, submission: HomeworkSubmission } objects
    app.get('/api/hw/:hwid/hws', utils.auth.admin, function (req, res) {
        async.parallel({
            authors: function (callback) {
                User.findStudents(callback);
            },
            submissions: function (callback) {
                HomeworkSubmission.findByHomework(req.params.hwid, callback);
            }
        }, function (err, results) {
            var data, i, j;
            if (err) {
                res.send(500);
            } else if (results.authors && results.submissions) {
                data = [];
                for (i = 0; i < results.authors.length; i = i + 1) {
                    data[i] = {
                        author: results.authors[i].strip(),
                        submission: null
                    };
                    for (j = 0; j < results.submissions.length; j = j + 1) {
                        if (data[i].author._id.equals(results.submissions[j].author)) {
                            data[i].submission = results.submissions[j].strip();
                            results.submissions.splice(j, 1);
                            break;
                        }
                    }
                }
                res.send(data);
            } else {
                res.send(400);
            }
        });
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
                    var stripped = hw.strip();
                    HomeworkSubmission.findOne({
                        author: req.params.uid,
                        target: hw._id
                    }, function (err, hws) {
                        if (err) {
                            callback(err);
                        } else if (hws) {
                            stripped.submision = hws.strip();
                            callback(null, stripped);
                        } else {
                            callback(null, stripped);
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
    app.post('/api/user/:uid/hw', utils.auth.self.concat(utils.uploadFile(hwsFolder)), function (req, res) {
        var studentID = emailValidation.getStudentID(req.user.email),
            fileName = HomeworkSubmission.submissionFileName(studentID, req.body.hwid),
            filePath = getSubmissionFilePath(fileName, req.body.file.extension);
        async.waterfall([
            function (callback) {
                if (req.body.file) {
                    callback(null);
                } else {
                    callback('missing file');
                }
            },
            function (callback) {
                Homework.findById(req.body.hwid, callback);
            },
            function (hw, callback) {
                utils.isSubmissionExpired(hw.deadline, callback);
            },
            function (callback) {
                HomeworkSubmission.findByAuthorAndHomework(req.params.uid, req.body.hwid, callback);
            },
            function (hws, callback) {
                if (hws) {
                    // update
                    fs.unlink(hws.filePath, function (err) {
                        // ignore err
                        fs.rename(req.body.file.path, filePath, function (err) {
                            // ignore err
                            hws.filePath = filePath;
                            hws.save(callback);
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
                        }, callback);
                    });
                }
            }
        ], utils.defaultHandler(res, stripOne));
    });

    // GET /api/user/:uid/hws/:hwsid
    // GET /api/hws/:hwsid (admin only)
    // get homework submission by id
    app.get('/api/user/:uid/hws/:hwsid', utils.auth.self, showHomeworkSubmission);
    app.get('/api/hws/:hwsid', utils.auth.admin, showHomeworkSubmission);

    // GET /api/user/:uid/hw/:hwid
    // get homework submission by user and homework id
    // hws is put under hw
    app.get('/api/user/:uid/hw/:hwid', utils.auth.self, function (req, res) {
        var questions;
        async.waterfall([
            function (callback) {
                Homework.findById(req.params.hwid, callback);
            },
            function (hw, callback) {
                questions = { crossGradingQuestions: hw.crossGradingQuestions };
                callback(null, hw.strip());
            },
            function (hw, callback) {
                HomeworkSubmission.findOne({
                    author: req.params.uid,
                    target: req.params.hwid
                }).populate('grading').exec(function (err, hws) {
                    if (err) {
                        callback(err);
                    } else if (hws) {
                        hw.submission = hws.strip();
                        if (hw.submission.grading) {
                            hw.submission.grading = hws.grading.strip();
                        }
                        callback(null, hw);
                    } else {
                        callback(null, hw);
                    }
                });
            },
            function (hw, callback) {
                if (hw.submission) {
                    CrossGrading.findBySubmission(hw.submission._id, function (err, cgs) {
                        var i;
                        if (err) {
                            callback(err);
                        } else if (cgs && cgs.length !== 0) {
                            for (i = 0; i < cgs.length; i = i + 1) {
                                cgs[i].content = cgs[i].pair(questions);
                            }
                            hw.cgs = cgs;
                            callback(null, hw);
                        } else {
                            callback(null, hw);
                        }
                    });
                } else {
                    callback(null, hw);
                }
            }
        ], utils.defaultHandler(res));
    });

    // PUT /api/hws/:hwsid
    // grades a homework submission (admin only)
    app.put('/api/hws/:hwsid', utils.auth.admin, function (req, res) {
        HomeworkSubmission.findById(req.params.hwsid, function (err, hws) {
            if (err) {
                res.send(500);
            } else if (hws) {
                async.waterfall([
                    function (callback) {
                        Grading.findById(hws.grading, callback);
                    },
                    function (grading, callback) {
                        if (!grading) {
                            grading = new Grading();
                            grading._id = new mongoose.Types.ObjectId;
                        }
                        grading.author = req.body.grading.author;
                        grading.score = req.body.grading.score;
                        grading.comment = req.body.grading.comment;
                        grading.save(callback);
                    },
                    function (grading, affects, callback) {
                        hws.grading = grading._id;
                        hws.save(callback);
                    }
                ], function (err, results) {
                    res.send(200);
                });
            } else {
                res.send(400);
            }
        });
    });

    // PUT /api/hw/:hwid/questions
    // edit crossGradingQuestions
    app.put('/api/hw/:hwid/questions', utils.auth.admin, function (req, res) {
        async.waterfall([
            function (callback) {
                Homework.findById(req.params.hwid, callback);
            },
            function (hw, callback) {
                // 1. save hw (use markModified)
                hw.crossGradingQuestions = req.body.questions;
                hw.markModified('crossGradingQuestions');
                hw.save(callback);
            },
            function (hw, affects, callback) {
                // 2. find all cgs by hwid
                CrossGrading.findByHomework(req.params.hwid, callback);
            },
            function (cgs, callback) {
                // 3. update content keys (cg.updateContentQuestions)
                async.map(cgs, function (cg, cb) {
                    cg.updateContentQuestions(req.body.questions, cb);
                }, callback);
            }
        ], utils.emptyHandler(res));
    });

};

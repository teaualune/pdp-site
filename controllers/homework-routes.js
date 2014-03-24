var async = require('async'),
    mongoose = require('mongoose'),
    path = require('path'),
    fs = require('fs'),
    _H = require('../model/homework'),
    User = require('../model/user'),
    Team = require('../model/team'),
    Grading = require('../model/grading'),
    CrossGrading = require('../model/cross-grading'),
    utils = require('./routes-utils'),
    emailValidation = require('../config/email-validation'),
    _UD = require('../settings.json').uploadDir,
    hwFolder = _UD.homework,
    hwsFolder = _UD.homeworkSubmission,
    getSubmissionFilePath = function (submissionFileName, extension) {
        return path.join(utils.uploadDir(), hwsFolder, submissionFileName + extension);
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
        HomeworkSubmission.findById(req.params.hwsid).populate('grading author team').exec(function (err, hws) {
            var data, grading, author, team;
            if (err) {
                data = 500;
            } else if (hws) {
                if (hws.grading) {
                    grading = hws.grading.strip();
                }
                if (hws.author) {
                    author = hws.author.strip();
                }
                if (hws.team) {
                    team = hws.team;
                }
                data = hws.strip();
                if (grading) {
                    data.grading = grading;
                }
                if (author) {
                    data.author = author;
                }
                if (team) {
                    data.team = team;
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
            manualFilePath: filePath,
            isGroup: req.body.isGroup === '1' ? true : false
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
    // or return an array of { team: Team, submission: HomeworkSubbmision } objects for isGroup homeworks
    app.get('/api/hw/:hwid/hws', utils.auth.admin, function (req, res) {
        async.waterfall([
            function (callback) {
                Homework.findById(req.params.hwid, callback);
            },
            function (hw, callback) {
                var parallel = {};
                parallel.submissions = function (cb) {
                    HomeworkSubmission.findByHomework(req.params.hwid).populate('grading').exec(cb);
                };
                if (hw.isGroup) {
                    parallel.teams = function (cb) {
                        Team.find({}, cb);
                    };
                } else {
                    parallel.authors = function (cb) {
                        User.find({ admin: false }, cb);
                    };
                }
                async.parallel(parallel, callback);
            }
        ], function (err, results) {
            if (err) {
                res.send(500);
            } else if (results.authors && results.submissions) {
                res.send(utils.createAuthorSubmissionArray(results.authors, results.submissions, 'author'));
            } else if (results.teams && results.submissions) {
                res.send(utils.createAuthorSubmissionArray(results.teams, results.submissions, 'team'));
            } else {
                res.send(400);
            }
        });
    });

    // GET /api/user/:uid/hw
    // get all {homework, homework submission} of a user
    // hws is put under hw
    app.get('/api/user/:uid/hw', utils.auth.self, function (req, res) {
        var team;
        async.waterfall([
            function (callback) {
                User.findById(req.params.uid, callback);
            },
            function (user, callback) {
                team = user.team;
                Homework.find({}, callback);
            },
            function (homeworks, callback) {
                async.map(homeworks, function (hw, cb) {
                    var stripped = hw.strip(),
                        query = {
                            target: hw._id
                        };
                    if (hw.isGroup) {
                        query.team = team;
                    } else {
                        query.author = req.params.uid;
                    }
                    HomeworkSubmission.findOne(query, function (err, hws) {
                        if (hws) {
                            stripped.submission = hws.strip();
                        }
                        cb(err, stripped);
                    });
                }, callback);
            }
        ], utils.defaultHandler(res));
    });

    // POST /api/user/:uid/hw
    // create or update a homework submission
    app.post('/api/user/:uid/hw', utils.auth.self.concat(utils.uploadFile(hwsFolder)), function (req, res) {
        var isGroup = false;
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
                isGroup = hw.isGroup;
                utils.isSubmissionExpired(hw.deadline, callback);
            },
            function (callback) {
                if (isGroup) {
                    HomeworkSubmission.findByTeamAndHomework(req.user.team, req.body.hwid, callback);
                } else {
                    HomeworkSubmission.findByAuthorAndHomework(req.params.uid, req.body.hwid, callback);
                }
            },
            function (hws, callback) {
                var authorID = isGroup ? 'team' + req.user.team : emailValidation.getStudentID(req.user.email),
                    fileName = HomeworkSubmission.submissionFileName(authorID, req.body.hwid),
                    filePath = getSubmissionFilePath(fileName, req.body.file.extension);
                if (hws) {
                    // update
                    fs.unlink(hws.filePath, function (err) {
                        // ignore err
                        fs.rename(req.body.file.path, filePath, function (err) {
                            // ignore err
                            hws.filePath = filePath;
                            hws.revision = hws.revision + 1;
                            hws.save(callback);
                        });
                    });
                } else {
                    // create
                    fs.rename(req.body.file.path, filePath, function (err) {
                        var hwid = parseInt(req.body.hwid, 10),
                            newSubmission;
                        newSubmission = {
                            _id: new mongoose.Types.ObjectId,
                            target: hwid,
                            filePath: filePath,
                            revision: 0
                        };
                        if (isGroup) {
                            newSubmission.team = req.user.team;
                        } else {
                            newSubmission.author = req.params.uid;
                        }
                        HomeworkSubmission.create(newSubmission, callback);
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
        var questions, team;
        async.waterfall([
            function (callback) {
                User.findById(req.params.uid, callback);
            },
            function (user, callback) {
                team = user.team;
                Homework.findById(req.params.hwid, callback);
            },
            function (hw, callback) {
                questions = { crossGradingQuestions: hw.crossGradingQuestions };
                callback(null, hw.strip());
            },
            function (hw, callback) {
                var query = { target: req.params.hwid };
                if (hw.isGroup) {
                    query.team = team;
                } else {
                    query.author = req.params.uid;
                }
                HomeworkSubmission.findOne(query).populate('grading').exec(function (err, hws) {
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

var async = require('async'),
    mongoose = require('mongoose'),
    path = require('path'),
    fs = require('fs'),
    P = require('../model/problem'),
    User = require('../model/user'),
    Team = require('../model/team'),
    Grading = require('../model/grading'),
    utils = require('./routes-utils'),
    _UD = require('../settings.json').uploadDir,
    problemFolder = _UD.problem,
    psFolder = _UD.problemSubmission,
    emailValidation = require('../config/email-validation'),
    getSubmissionFilePath = function (submissionFileName, extension) {
        return path.join(utils.uploadDir(), psFolder, submissionFileName + extension);
    },
    Problem = P.Problem,
    ProblemSubmission = P.ProblemSubmission,

    stripOne = function (one) {
        return one.strip();
    },
    stripAllProblems = function (problems) {
        return Problem.stripProblems(problems);
    },
    stripAllProblemSubmissions = function (submissions) {
        return ProblemSubmission.stripProblems(submissions);
    },

    showProblemSubmission = function (req, res) {
        ProblemSubmission.findById(req.params.psid).populate('grading author team').exec(function (err, ps) {
            var data, grading, author;
            if (err) {
                data = 500;
            } else if (ps) {
                if (ps.grading) {
                    grading = ps.grading.strip();
                }
                if (ps.author) {
                    author = ps.author.strip();
                }
                if (ps.team) {
                    team = ps.team;
                }
                data = ps.strip();
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

    // GET /api/problem
    // get all problems
    app.get('/api/problem', utils.auth.basic, function (req, res) {
        Problem.find({}, utils.defaultHandler(res, stripAllProblems));
    });

    // POST /api/problem
    // create a new problem
    app.post('/api/problem', utils.auth.admin.concat(utils.uploadFile(problemFolder)), function (req, res) {
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
        Problem.create({
            title: req.body.title,
            description: req.body.description,
            sampleInput: req.body.sampleInput,
            sampleOutput: req.body.sampleOutput,
            deadline: deadline,
            manualFilePath: filePath,
            isGroup: req.body.isGroup === '1' ? true : false
        }, utils.defaultHandler(res, stripOne));
    });

    // GET /api/problem/:pid
    // get problem by id
    app.get('/api/problem/:pid', utils.auth.basic, function (req, res) {
        Problem.findById(req.params.pid, utils.defaultHandler(res, stripOne));
    });

    // PUT /api/problem/:pid
    // update problem
    app.put('/api/problem/:pid', utils.auth.admin.concat(utils.uploadFile(problemFolder)), function (req, res) {
        async.waterfall([
            function (callback) {
                Problem.findById(req.params.pid, callback);
            },
            function (problem, callback) {
                if (!problem) {
                    callback('attempt to update unexist problem');
                } else if (req.body.file) {
                    if (problem.manualFilePath == '') {
                        problem.manualFilePath = req.body.file.path;
                        callback(null, problem);
                    } else {
                        fs.unlink(problem.manualFilePath, function (err) {
                            // ignore this error
                            console.log(err);
                            problem.manualFilePath = req.body.file.path;
                            callback(null, problem);
                        });
                    }
                } else {
                    callback(null, problem);
                }
            },
            function (problem, callback) {
                var deadline = new Date(req.body.deadline);
                problem.title = req.body.title || problem.title;
                problem.description = req.body.description || problem.description;
                problem.sampleInput = req.body.sampleInput || problem.sampleInput;
                problem.sampleOutput = req.body.sampleOutput || problem.sampleOutput;
                problem.deadline = deadline.getTime() || problem.deadline;
                problem.save(callback);
            }
        ], utils.defaultHandler(res, stripOne));
    });

    // DELETE /api/problem/:pid
    // delete problem
    app.delete('/api/problem/:pid', utils.auth.admin, function (req, res) {
        Problem.findByIdAndRemove(req.params.pid, utils.emptyHandler(res));
    });

    // GET /api/ps
    // get all problem submissions
    app.get('/api/ps', utils.auth.admin, function (req, res) {
        Submission.find({}, utils.defaultHandler(res, stripAllProblemSubmissions));
    });

    // GET /api/problem/:pid/ps
    // get all problem submissions of a problem
    // return an array of { author: User, submission: ProblemSubmission } objects
    // or return an array of { team: Team, submission: ProblemSubmission } objects for isGroup problems
    app.get('/api/problem/:pid/ps', utils.auth.admin, function (req, res) {
        async.waterfall([
            function (callback) {
                Problem.findById(req.params.pid, callback);
            },
            function (problem, callback) {
                var parallel = {};
                parallel.submissions = function (cb) {
                    ProblemSubmission.findByProblem(req.params.pid).populate('grading').exec(cb);
                };
                if (problem.isGroup) {
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

    // GET /api/user/:uid/ps
    // get all {problem, problem submission} of a user
    // ps is put under problem
    app.get('/api/user/:uid/problem', utils.auth.self, function (req, res) {
        var team;
        async.waterfall([
            function (callback) {
                User.findById(req.params.uid, callback);
            },
            function (user, callback) {
                team = user.team;
                Problem.find({}, callback);
            },
            function (problems, callback) {
                async.map(problems, function (problem, cb) {
                    var stripped = problem.strip(),
                        query = {
                            target: problem._id
                        };
                    if (problem.isGroup) {
                        query.team = team;
                    } else {
                        query.author = req.params.uid;
                    }
                    ProblemSubmission.findOne(query, function (err, ps) {
                        if (ps) {
                            stripped.submission = ps.strip();
                        }
                        cb(err, stripped);
                    });
                }, callback);
            }
        ], utils.defaultHandler(res));
    });

    // POST /api/user/:uid/ps
    // create or update a problem submission
    // nupdated submission does not overwrite previous file, thus forms a series of submissions
    app.post('/api/user/:uid/problem', utils.auth.self.concat(utils.uploadFile(psFolder)), function (req, res) {
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
                Problem.findById(req.body.pid, callback);
            },
            function (problem, callback) {
                isGroup = problem.isGroup;
                utils.isSubmissionExpired(problem.deadline, callback);
            },
            function (callback) {
                if (isGroup) {
                    ProblemSubmission.findByTeamAndProblem(req.user.team, req.body.pid, callback);
                } else {
                    ProblemSubmission.findByAuthorAndProblem(req.params.uid, req.body.pid, callback);
                }
            },
            function (ps, callback) {
                var authorID = isGroup ? 'team' + req.user.team : emailValidation.getStudentID(req.user.email),
                    fileName = ProblemSubmission.submissionFileName(authorID, req.body.pid, ps ? ps.revision + 1 : 0),
                    filePath = getSubmissionFilePath(fileName, req.body.file.extension);
                if (ps) {
                    // update
                    fs.rename(req.body.file.path, filePath, function (err) {
                        ps.filePaths.push(filePath);
                        ps.revision = ps.revision + 1;
                        ps.state = 0;
                        ps.save(callback);
                    });
                } else {
                    // create
                    fs.rename(req.body.file.path, filePath, function (err) {
                        var pid = parseInt(req.body.pid, 10),
                            newSubmission;
                        newSubmission = {
                            _id: new mongoose.Types.ObjectId,
                            target: pid,
                            filePaths: [ filePath ],
                            revision: 0,
                            state: 0,
                            times: [],
                            result: '',
                            judgeHead:0
                        };
                        if (isGroup) {
                            newSubmission.team = req.user.team;
                        } else {
                            newSubmission.author = req.params.uid;
                        }
                        ProblemSubmission.create(newSubmission, callback);
                    });
                }
            }
        ], utils.defaultHandler(res, stripOne));
    });

    // GET /api/user/:uid/ps/:psid
    // GET /api/ps/:psid (admin only)
    // get problem submission by id
    app.get('/api/user/:uid/ps/:psid', utils.auth.self, showProblemSubmission);
    app.get('/api/ps/:psid', utils.auth.admin, showProblemSubmission);

    // GET /api/user/:uid/problem/:pid
    // get problem submission by user and problem id
    // ps is under problem
    app.get('/api/user/:uid/problem/:pid', utils.auth.self, function (req, res) {
        var team;
        async.waterfall([
            function (callback) {
                User.findById(req.params.uid, callback);
            },
            function (user, callback) {
                team = user.team;
                Problem.findById(req.params.pid, callback);
            },
            function (problem, callback) {
                callback(null, problem.strip());
            },
            function (problem, callback) {
                var query = { target: req.params.pid };
                if (problem.isGroup) {
                    query.team = team;
                } else {
                    query.author = req.params.uid;
                }
                ProblemSubmission.findOne(query).populate('grading').exec(function (err, ps) {
                    if (err) {
                        callback(err);
                    } else if (ps) {
                        problem.submission = ps.strip();
                        if (problem.submission.grading) {
                            problem.submission.grading = ps.grading.strip();
                        }
                        callback(null, problem);
                    } else {
                        callback(null, problem);
                    }
                });
            }
        ], utils.defaultHandler(res));
    });

    // PUT /api/ps/:psid
    // grades a problem submission (admin only)
    app.put('/api/ps/:psid', utils.auth.admin, function (req, res) {
        ProblemSubmission.findById(req.params.psid, function (err, ps) {
            if (err) {
                res.send(500);
            } else if (ps) {
                async.waterfall([
                    function (callback) {
                        Grading.findById(ps.grading, callback);
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
                        ps.grading = grading._id;
                        ps.save(callback);
                    }
                ], function (err, results) {
                    res.send(200);
                });
            } else {
                res.send(400);
            }
        });
    });

};

var async = require('async'),
    mongoose = require('mongoose'),
    path = require('path'),
    fs = require('fs'),
    P = require('../model/problem'),
    utils = require('./routes-utils'),
    emailValidation = require('../config/email-validation'),
    getSubmissionFilePath = function (submissionFileName, extension) {
        return path.join(utils.uploadDir(), 'ps', submissionFileName + extension);
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
    };

module.exports = function (app) {

    // GET /api/problem
    // get all problems
    app.get('/api/problem', utils.auth.basic, function (req, res) {
        Problem.find({}, utils.defaultHandler(res, stripAllProblems));
    });

    // POST /api/problem
    // create a new problem
    app.post('/api/problem', utils.auth.admin.concat(utils.uploadFile('problem')), function (req, res) {
        var filePath;
        if (req.body.file) {
            filePath = req.body.file.path;
        } else {
            filePath = '';
        }
        Problem.create({
            title: req.body.title,
            description: req.body.description,
            sampleInput: req.body.sampleInput,
            sampleOutput: req.body.sampleOutput,
            manualFilePath: filePath
        }, utils.defaultHandler(res, stripOne));
    });

    // GET /api/problem/:pid
    // get problem by id
    app.get('/api/problem/:pid', utils.auth.basic, function (req, res) {
        Problem.findById(req.params.pid, utils.defaultHandler(res, stripOne));
    });

    // PUT /api/problem/:pid
    // update problem
    app.put('/api/problem/:pid', utils.auth.admin.concat(utils.uploadFile('problem')), function (req, res) {
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
                problem.title = req.body.title || problem.title;
                problem.description = req.body.description || problem.description;
                problem.sampleInput = req.body.sampleInput || problem.sampleInput;
                problem.sampleOutput = req.body.sampleOutput || problem.sampleOutput;
                problem.save(callback);
            }
        ], utils.defaultHandler(res, stripOne));
    });

    // DELETE /api/problem/:pid
    // delete problem
    app.delete('/api/problem/:pid', utils.auth.admin, function (req, res) {
        Problem.findByIdAndRemove(req.params.pid, utils.destroyHandler(res));
    });

    // GET /api/ps
    // get all problem submissions
    app.get('/api/ps', utils.auth.admin, function (req, res) {
        Submission.find({}, utils.defaultHandler(res, stripAllProblemSubmissions));
    });

    // GET /api/problem/:pid/ps
    // get all problem submissions of a problem
    app.get('/api/problem/:pid/ps', utils.auth.admin, function (req, res) {
        ProblemSubmission.findByProblem(req.params.pid, utils.defaultHandler(res, stripAllProblemSubmissions));
    });

    // GET /api/user/:uid/ps
    // get all {problem, problem submission} of a user
    // ps is put under problem
    app.get('/api/user/:uid/problem', utils.auth.self, function (req, res) {
        Problem.find({}, function (err, problems) {
            if (err) {
                res.send(500);
            } else if (problems) {
                async.map(problems, function (problem, callback) {
                    var stripped = problem.strip();
                    ProblemSubmission.findOne({
                        author: req.params.uid,
                        target: problem._id
                    }, function (err, ps) {
                        if (err) {
                            callback(err);
                        } else if (ps) {
                            stripped.submision = ps.strip();
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

    // POST /api/user/:uid/ps
    // create or update a problem submission
    app.post('/api/user/:uid/problem', utils.auth.self.concat(utils.uploadFile('ps')), function (req, res) {
        if (req.body.file) {
            ProblemSubmission.findByAuthorAndProblem(req.params.uid, req.body.pid, function (err, ps) {
                var studentID = emailValidation.getStudentID(req.user.email),
                    fileName = ProblemSubmission.submissionFileName(studentID, req.body.pid),
                    filePath = getSubmissionFilePath(fileName, req.body.file.extension);
                if (err) {
                    res.send(500);
                } else if (ps) {
                    // update
                    fs.unlink(ps.filePath, function (err) {
                        // ignore err
                        fs.rename(req.body.file.path, filePath, function (err) {
                            // ignore err
                            ps.filePath = filePath;
                            ps.save(utils.defaultHandler(res, stripOne));
                        });
                    });
                } else {
                    // create
                    fs.rename(req.body.file.path, filePath, function (err) {
                        var pid = parseInt(req.body.pid, 10);
                        ProblemSubmission.create({
                            _id: new mongoose.Types.ObjectId,
                            author: req.params.uid,
                            target: pid,
                            filePath: filePath
                        }, utils.defaultHandler(res, stripOne));
                    });
                }
            });
        } else {
            res.send(400);
        }
    });

    // GET /api/user/:uid/ps/:psid
    // get problem submission by id
    app.get('/api/user/:uid/ps/:psid', utils.auth.self, function (req, res) {
        ProblemSubmission.findById(req.params.psid, utils.defaultHandler(res, stripOne));
    });

    // GET /api/user/:uid/problem/:pid
    // get problem submission by user and problem id
    app.get('/api/user/:uid/problem/:pid', utils.auth.self, function (req, res) {
        ProblemSubmission.findByAuthorAndProblem(req.params.uid, req.params.pid, utils.defaultHandler(res, stripOne));
    });

    // PUT /api/ps/:psid
    // grades a problem submission (admin only)
    app.put('/api/ps/:psid', utils.auth.admin, function (req, res) {
        ProblemSubmission.findById(req.params.psid, function (err, ps) {
            if (err) {
                res.send(500);
            } else if (ps) {
                ps.grading = req.body.grading || ps.grading;
                ps.comment = req.body.comment || ps.comment;
                ps.save(utils.defaultHandler(res, stripOne));
            } else {
                res.send(404);
            }
        });
    });

};

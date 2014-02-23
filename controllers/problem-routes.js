var P = require('../model/problem'),
    utils = require('./routes-utils'),
    Problem = P.Problem,
    ProblemSubmission = P.ProblemSubmission;

module.exports = function (app) {

    // GET /api/problem
    // get all problems
    app.get('/api/problem', utils.auth.basic, function (req, res) {
        Problem.find({}, utils.defaultHandler(res));
    });

    // POST /api/problem
    // create a new problem
    app.post('/api/problem', utils.auth.admin.concat(utils.uploadFile), function (req, res) {
        Problem.create({
            title: req.body.title,
            description: req.body.description,
            sampleInput: req.body.sampleInput,
            sampleOutput: req.body.sampleOutput,
            manualFilePath: req.manualFilePath || ''
        }, utils.defaultHandler(res));
    });

    // GET /api/problem/:pid
    // get problem by id
    app.get('/api/problem/:pid', utils.auth.basic, function (req, res) {
        Problem.findById(req.params.pid, utils.defaultHandler(res));
    });

    // PUT /api/problem/:pid
    // update problem
    app.put('/api/problem/:pid', utils.auth.admin, function (req, res) {
        Problem.findById(req.params.pid, function (err, problem) {
            if (err) {
                res.send(500);
            } else if (problem) {
                problem.title = req.body.title || problem.title;
                problem.description = req.body.description || problem.description;
                problem.sampleInput = req.body.sampleInput || problem.sampleInput;
                problem.sampleOutput = req.body.sampleOutput || problem.sampleOutput;
                problem.manualFilePath = req.manualFilePath || problem.manualFilePath;
                problem.save(utils.defaultHandler(res));
            } else {
                res.send(404);
            }
        });
    });

    // DELETE /api/problem/:pid
    // delete problem
    app.delete('/api/problem/:pid', utils.auth.admin, function (req, res) {
        Problem.findByIdAndRemove(req.params.pid, utils.destroyHandler(res));
    });

    // GET /api/ps
    // get all problem submissions
    app.get('/api/ps', utils.auth.admin, function (req, res) {
        Submission.find({}, utils.defaultHandler(res));
    });

    // GET /api/problem/:pid/ps
    // get all problem submissions of a problem
    app.get('/api/problem/:pid/ps', utils.auth.admin, function (req, res) {
        ProblemSubmission.findByProblem(req.params.pid, utils.defaultHandler(res));
    });

    // GET /api/user/:uid/ps
    // get all problem submissions of a user
    app.get('/api/user/:uid/ps', utils.auth.self, function (req, res) {
        ProblemSubmission.findByAuthor(req.params.uid, utils.defaultHandler(res));
    });

    // POST /api/user/:uid/ps
    // create or update a problem submission
    app.post('/api/user/:uid/ps', utils.auth.self.concat(utils.uploadFile), function (req, res) {
        ProblemSubmission.findByProblem(req.body.pid, function (err, ps) {
            if (err) {
                res.send(500);
            } else if (ps) {
                // update
                // no attributes are changed, only file uploaded
                res.send(ps);
            } else {
                // create
                ProblemSubmission.create({
                    author: req.params.uid,
                    target: req.body.pid,
                    filePath: req.filePath
                }, utils.defaultHandler(res));
            }
        });
    });

    // GET /api/user/:uid/ps/:psid
    // get problem submission by id
    app.get('/api/user/:uid/ps/:psid', utils.auth.self, function (req, res) {
        ProblemSubmission.findById(req.params.psid, utils.defaultHandler(res));
    });

    // GET /api/ps/:uid/:pid
    // get problem submission by user and problem id
    app.get('/api/ps/:uid/:psid', utils.auth.self, function (req, res) {
        ProblemSubmission.findOne({
            author: req.params.uid,
            target: req.params.pid
        }, utils.defaultHandler(res));
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
                ps.save(utils.defaultHandler(res));
            } else {
                res.send(404);
            }
        });
    });

};

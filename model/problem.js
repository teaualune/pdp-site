var mongoose = require('mongoose'),
    utils = require('./model-utils'),
    submission = require('./submission'),
    Schema = mongoose.Schema,

    problemSchema = {
        _id: Schema.Types.ObjectId,
        title: String,
        description: String,
        sampleInput: String,
        sampleOutput: String,
        manualFilePath: String
    },
    Problem = mongoose.model('Problem', new Schema(problemSchema)),
    ProblemSubmission = mongoose.model('ProblemSubmission', new Schema(submission('Problem'))),
    findOne = function (req) {
        return {
            _id: req.params.problemID
        };
    };

exports.problem = {
    Model: Problem,

    index: function (req, res) {
        Problem.find({}, utils.defaultHandler(res));
    },

    create: function (req, res) {
        Problem.create({
            title: req.body.title,
            description: req.body.description,
            sampleInput: req.body.sampleInput,
            sampleOutput: req.body.sampleOutput,
            manualFilePath: req.manualFilePath || ''
        }, utils.defaultHandler(res));
    },

    show: function (req, res) {
        Problem.findOne(findOne(req), utils.defaultHandler(res));
    },

    update: function (req, res) {
        Problem.findOne(findOne(req), function (err, problem) {
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
    },

    destroy: function (req, res) {
        Problem.remove(findOne(req), utils.destroyHandler(res));
    }
};

exports.problemSubmission = {
    Model: ProblemSubmission,

    index: function (req, res) {
        ProblemSubmission.find({}, utils.defaultHandler(res));
    },

    indexByAuthor: function (req, res) {
        ProblemSubmission.find({
            author: req.params.userID
        }, utils.defaultHandler(res));
    },

    indexByTarget: function (req, res) {
        ProblemSubmission.find({
            target: req.params.problemID
        }, utils.defaultHandler(res));
    },

    create: function (req, res) {
        ProblemSubmission.create({
            author: req.body.userID,
            target: req.body.hwID,
            filePath: req.filePath
        }, utils.defaultHandler(res));
    },

    show: function (req, res) {
        ProblemSubmission.findOne({
            _id: req.params.psID
        }, utils.defaultHandler(res));
    },

    showByAuthorAndTarget: function (req, res) {
        ProblemSubmission.findOne({
            author: req.params.userID,
            target: req.params.hwID
        }, utils.defaultHandler(res));
    },

    update: function (req, res) {
        ProblemSubmission.findOne({
            _id: req.params.psID
        }, function (err, ps) {
            if (err) {
                res.send(500);
            } else if (hws) {
                ps.grading = req.body.grading || ps.grading;
                ps.comment = req.body.comment || ps.comment;
                ps.save(utils.defaultHandler(res));
            } else {
                res.send(404);
            }
        });
    }
};

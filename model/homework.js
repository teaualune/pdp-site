var mongoose = require('mongoose'),
    utils = require('./model-utils'),
    submission = require('./submission'),
    Schema = mongoose.Schema,

    hwSchema = {
        _id: Schema.Types.ObjectId,
        title: String,
        description: String,
        manualFilePath: String
    },
    hwSubmissionSchema = submission('Homework'),
    Homework = mongoose.model('Homework', new Schema(hwSchema)),
    HomeworkSubmission,
    findOne = function (req) {
        return {
            _id: req.params.hwID
        };
    };

hwSubmissionSchema.crossGradings = [{
    type: Schema.Types.ObjectId,
    ref: 'Grading'
}];

HomeworkSubmission = mongoose.model('HomeworkSubmission', new Schema(hwSubmissionSchema));

exports.homework = {
    Model: Homework,

    index: function (req, res) {
        Homework.find({}, utils.defaultHandler(res));
    },

    create: function (req, res) {
        Homework.create({
            title: req.body.title,
            description: req.body.description,
            manualFilePath: req.manualFilePath || ''
        }, utils.defaultHandler(res));
    },

    show: function (req, res) {
        Homework.findOne(findOne(req), utils.defaultHandler(res));
    },

    update: function (req, res) {
        Homework.findOne(findOne(req), function (err, hw) {
            if (err) {
                res.send(500);
            } else if (hw) {
                hw.title = req.body.title || hw.title;
                hw.description = req.body.description || hw.description;
                hw.manualFilePath = req.manualFilePath || hw.manualFilePath;
                hw.save(utils.defaultHandler(res));
            } else {
                res.send(404);
            }
        });
    },

    destroy: function (req, res) {
        Homework.remove(findOne(req), utils.destroyHandler(res));
    }
};

exports.homeworkSubmission = {
    Model: HomeworkSubmission,

    index: function (req, res) {
        HomeworkSubmission.find({}, utils.defaultHandler(res));
    },

    indexByAuthor: function (req, res) {
        HomeworkSubmission.find({
            author: req.params.userID
        }, utils.defaultHandler(res));
    },

    indexByHomework: function (req, res) {
        HomeworkSubmission.find({
            target: req.params.hwID
        }, utils.defaultHandler(res));
    },

    create: function (req, res) {
        HomeworkSubmission.create({
            author: req.body.userID,
            target: req.body.hwID,
            filePath: req.filePath
        }, utils.defaultHandler(res));
    },

    show: function (req, res) {
        HomeworkSubmission.findOne({
            _id: req.params.hwsID
        }, utils.defaultHandler(res));
    },

    showByAuthorAndHomework: function (req, res) {
        HomeworkSubmission.findOne({
            author: req.params.userID,
            target: req.params.hwID
        }, utils.defaultHandler(res));
    },

    update: function (req, res) {
        HomeworkSubmission.findOne({
            _id: req.params.hwsID
        }, function (err, hw) {
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
    }
};

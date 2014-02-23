var mongoose = require('mongoose'),
    Schema = mongoose.Schema,

    gradingSchema = new Schema({
        _id: Schema.Types.ObjectId,
        homeworkSubmission: {
            type: Schema.Types.ObjectId,
            ref: 'HomeworkSubmission'
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: Number,
        comment: String
    }),
    Grading;

exports.Model = Grading = mongoose.model('Grading', gradingSchema);

/*
exports.index = function (req, res) {
    Grading.find({}, utils.defaultHandler(res));
};

exports.indexByAuthor = function (req, res) {
    Grading.find({
        author: req.params.userID
    }, utils.defaultHandler(res));
};

exports.indexByHomeworkSubmission = function (req, res) {
    Grading.find({
        homeworkSubmission: req.params.hwsID
    }, utils.defaultHandler(res));
};

exports.create = function (req, res) {
    Grading.create({
        author: req.body.userID,
        homeworkSubmission: req.body.hwsID,
        rating: req.body.rating,
        comment: req.body.comment
    }, utils.defaultHandler(res));
};

exports.show = function (req, res) {
    Grading.findOne({
        _id: req.params.gradingID
    }, utils.defaultHandler(res));
};

exports.showByAuthorAndHomeworkSubmission = function (req, res) {
    Grading.findOne({
        author: req.params.userID,
        homeworkSubmission: req.params.hwsID
    }, utils.defaultHandler(res));
};

exports.update = function (req, res) {
    Grading.findOne({
        _id: req.params.gradingID
    }, function (err, grading) {
        if (err) {
            res.send(500);
        } else if (grading) {
            grading.rating = req.body.rating || grading.rating;
            grading.comment = req.body.comment || grading.comment;
            grading.save(utils.defaultHandler(res));
        } else {
            res.send(404);
        }
    });
};
*/

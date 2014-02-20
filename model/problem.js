var mongoose = require('mongoose'),
    submission = require('./submission'),
    Schema = mongoose.Schema,

    problemSchema = new Schema({
        _id: Schema.Types.ObjectId,
        title: String,
        description: String,
        sampleInput: String,
        sampleOutput: String,
        manualFilePath: String
    });

exports.ProblemModel = mongoose.model('Problem', problemSchema);
exports.ProblemSubmissionModel = mongoose.model('ProblemSubmission', submission('Problem'));

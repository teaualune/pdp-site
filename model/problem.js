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
    }),
    problemSubmissionSchema = new Schema(submission.schema('Problem'));

problemSubmissionSchema.statics.findByAuthor = submission.findByAuthor();
problemSubmissionSchema.statics.findByProblem = submission.findByTarget();

exports.Problem = mongoose.model('Problem', problemSchema);
exports.ProblemSubmission = mongoose.model('ProblemSubmission', problemSubmissionSchema);

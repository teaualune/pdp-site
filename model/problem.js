var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    submission = require('./submission'),
    path2url = require('../config/path2url'),
    formatDate = require('../config/DateHelper').format,
    Schema = mongoose.Schema,

    problemSchema = new Schema({
        title: String,
        description: String,
        sampleInput: String,
        sampleOutput: String,
        deadline: Number, // Unix timestamp
        manualFilePath: String,
        isGroup: Boolean,
    }),
    problemSubmissionSchema = new Schema(submission.schema('Problem'));

problemSchema.plugin(autoIncrement.plugin, {
    model: 'Problem',
    startAt: 1
});

problemSchema.methods.strip = function () {
    return {
        _id: this._id,
        title: this.title,
        description: this.description,
        sampleInput: this.sampleInput,
        sampleOutput: this.sampleOutput,
        deadline: formatDate(this.deadline),
        manualFilePath: path2url.one(this.manualFilePath),
        isGroup: this.isGroup
    };
};

problemSchema.statics.stripProblems = function (problems) {
    var stripped = [], i = 0;
    for (i; i < problems.length; i = i + 1) {
        stripped[i] = problems[i].strip();
    }
    return stripped;
};

problemSubmissionSchema.statics.findByAuthor = submission.findByAuthor();
problemSubmissionSchema.statics.findByProblem = submission.findByTarget();
problemSubmissionSchema.statics.findByAuthorAndProblem = submission.findByAuthorAndTarget();
problemSubmissionSchema.statics.findByTeamAndProblem = submission.findByTeamAndTarget();

problemSubmissionSchema.statics.submissionFileName = function (studentID, pid, revision) {
    return 'problem' + pid + '-' + studentID + '-v' + revision;
};

problemSubmissionSchema.methods.strip = submission.strip();

problemSubmissionSchema.statics.stripSubmissions = submission.stripSubmissions();

exports.Problem = mongoose.model('Problem', problemSchema);
exports.ProblemSubmission = mongoose.model('ProblemSubmission', problemSubmissionSchema);

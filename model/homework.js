var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    submission = require('./submission'),
    path2url = require('../config/path2url'),
    formatDate = require('../config/DateHelper').format,
    Schema = mongoose.Schema,

    homeworkSchema = new Schema({
        title: String,
        description: String,
        deadline: Number, // Unix timestamp
        manualFilePath: String,
        isGroup: Boolean,

        // mixed type
        // {
        //    questionID: {
        //      question: "question description",
        //      type: "comment"
        //    },
        //    ...
        // }
        crossGradingQuestions: Schema.Types.Mixed
    }),
    _hwSubmissionSchema = submission.schema('Homework'),
    homeworkSubmissionSchema;

homeworkSchema.plugin(autoIncrement.plugin, {
    model: 'Homework',
    startAt: 1
});

homeworkSchema.methods.strip = function () {
    return {
        _id: this._id,
        title: this.title,
        description: this.description,
        deadline: formatDate(this.deadline),
        manualFilePath: path2url.one(this.manualFilePath),
        isGroup: this.isGroup
    };
};

homeworkSchema.statics.stripHomeworks = function (homeworks) {
    var stripped = [], i = 0;
    for (i; i < homeworks.length; i = i + 1) {
        stripped[i] = homeworks[i].strip();
    }
    return stripped;
};

homeworkSubmissionSchema = new Schema(_hwSubmissionSchema);

homeworkSubmissionSchema.statics.findByAuthor = submission.findByAuthor();
homeworkSubmissionSchema.statics.findByHomework = submission.findByTarget();
homeworkSubmissionSchema.statics.findByAuthorAndHomework = submission.findByAuthorAndTarget();
homeworkSubmissionSchema.statics.findByTeamAndHomework = submission.findByTeamAndTarget();

homeworkSubmissionSchema.statics.submissionFileName = function (studentID, hwid) {
    return 'hw' + hwid + '-' + studentID;
};

homeworkSubmissionSchema.methods.strip = submission.strip();

homeworkSubmissionSchema.statics.stripSubmissions = submission.stripSubmissions();

exports.Homework = mongoose.model('Homework', homeworkSchema);
exports.HomeworkSubmission = mongoose.model('HomeworkSubmission', homeworkSubmissionSchema);

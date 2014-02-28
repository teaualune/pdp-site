var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    submission = require('./submission'),
    Schema = mongoose.Schema,

    homeworkSchema = new Schema({
        title: String,
        description: String,
        manualFilePath: String
    }),
    _hwSubmissionSchema = submission.schema('Homework'),
    homeworkSubmissionSchema;

autoIncrement.initialize(mongoose.connection);

homeworkSchema.plugin(autoIncrement.plugin, {
    model: 'Homework',
    startAt: 1
});

_hwSubmissionSchema.crossGradings = [{
    type: Schema.Types.ObjectId,
    ref: 'Grading'
}];

homeworkSubmissionSchema = new Schema(_hwSubmissionSchema);

homeworkSubmissionSchema.statics.findByAuthor = submission.findByAuthor();
homeworkSubmissionSchema.statics.findByHomework = submission.findByTarget();
homeworkSubmissionSchema.statics.findByAuthorAndHomework = submission.findByAuthorAndTarget();

homeworkSubmissionSchema.statics.submissionFileName = function (studentID, hwid) {
    return 'hw' + hwid + '-' + studentID;
}

exports.Homework = mongoose.model('Homework', homeworkSchema);
exports.HomeworkSubmission = mongoose.model('HomeworkSubmission', homeworkSubmissionSchema);

var mongoose = require('mongoose'),
    submission = require('./submission'),
    Schema = mongoose.Schema,

    homeworkSchema = new Schema({
        _id: Schema.Types.ObjectId,
        title: String,
        description: String,
        manualFilePath: String
    }),
    _hwSubmissionSchema = submission.schema('Homework'),
    homeworkSubmissionSchema;

_hwSubmissionSchema.crossGradings = [{
    type: Schema.Types.ObjectId,
    ref: 'Grading'
}];

homeworkSubmissionSchema = new Schema(_hwSubmissionSchema);

homeworkSubmissionSchema.statics.findByAuthor = submission.findByAuthor();
homeworkSubmissionSchema.statics.findByHomework = submission.findByTarget();

exports.Homework = mongoose.model('Homework', homeworkSchema);
exports.HomeworkSubmission = mongoose.model('HomeworkSubmission', homeworkSubmissionSchema);

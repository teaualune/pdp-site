var mongoose = require('mongoose'),
    submission = require('./submission'),
    Schema = mongoose.Schema,

    hwSchema = new Schema({
        _id: Schema.Types.ObjectId,
        title: String,
        description: String,
        manualFilePath: String,
        gradings: [{
            type: Schema.Types.ObjectId,
            ref: 'Grading'
        }]
    });

exports.HomeworkModel = mongoose.model('Homework', hwSchema);
exports.HomeworkSubmissionModel = mongoose.model('HomeworkSubmission', submission('Homework'));

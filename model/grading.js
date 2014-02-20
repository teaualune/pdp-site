var mongoose = require('mongoose'),
    Schema = mongoose.Schema,

    gradingSchema = new Schema({
        _id: Schema.Types.ObjectId,
        hw: {
            type: Schema.Types.ObjectId,
            ref: 'Homework'
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        rate: Number,
        comment: String
    });

exports.Model = mongoose.model('Grading', gradingSchema);

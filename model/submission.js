var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = function (targetType) {
    return {
        _id: Schema.Types.ObjectId,
        target: {
            type: Schema.Types.ObjectId,
            ref: targetType
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        filePath: String,
        grading: Number, // teacher's grading
        comment: String // teacher's comment
    };
};

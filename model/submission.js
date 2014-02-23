var ObjectId = require('mongoose').Schema.Types.ObjectId;

module.exports = {
    schema: function (targetType) {
        return {
            _id: ObjectId,
            target: {
                type: ObjectId,
                ref: targetType
            },
            author: {
                type: ObjectId,
                ref: 'User'
            },
            filePath: String,
            grading: Number, // teacher's grading
            comment: String // teacher's comment
        };
    },
    findByAuthor: function () {
        return function (authorID, callback) {
            this.find({ author: authorID }, callback);
        };
    },
    findByTarget: function () {
        return function (targetID, callback) {
            this.find({ target: targetID }, callback);
        };
    }
};

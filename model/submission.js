var ObjectId = require('mongoose').Schema.Types.ObjectId,
    path2url = require('../config/path2url');

module.exports = {
    schema: function (targetType) {
        return {
            _id: ObjectId,
            target: {
                type: Number,
                ref: targetType
            },
            author: {
                type: ObjectId,
                ref: 'User'
            },
            filePath: String,
			state: Number,
			result: String,
            grading: { // teacher's grading
                type: ObjectId,
                ref: 'Grading'
            }
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
    },
    findByAuthorAndTarget: function () {
        return function (authorID, targetID, callback) {
            this.findOne({
                author: authorID,
                target: targetID
            }, callback);
        };
    },
    strip: function () {
        return function () {
            this.filePath = path2url.one(this.filePath);
            return this;
        };
    },
    stripSubmissions: function () {
        return function (submissions) {
            var stripped = [], i = 0;
            for (i; i < submissions.length; i = i + 1) {
                stripped[i] = submissions[i].strip();
            }
            return stripped;
        };
    }
};

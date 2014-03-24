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
            team: {
                type: Number,
                ref: 'Team'
            },
            filePath: String,
            filePaths: [String], // multiple revision
            revision: Number, // revision number
            state: Number,
            result: String,
            time: Number,
            grading: { // teacher's grading
                type: ObjectId,
                ref: 'Grading'
            }
        };
    },
    findByAuthor: function () {
        return function (authorID, callback) {
            return this.find({ author: authorID }, callback);
        };
    },
    findByTarget: function () {
        return function (targetID, callback) {
            return this.find({ target: targetID }, callback);
        };
    },
    findByAuthorAndTarget: function () {
        return function (authorID, targetID, callback) {
            return this.findOne({
                author: authorID,
                target: targetID
            }, callback);
        };
    },
    findByTeamAndTarget: function () {
        return function (teamID, targetID, callback) {
            return this.findOne({
                team: teamID,
                target: targetID
            }, callback);
        };
    },
    strip: function () {
        return function () {
            var filePaths, i;
            if (this.filePath) {
                this.filePath = path2url.one(this.filePath);
            }
            if (this.filePaths) {
                filePaths = [];
                for (i = 0; i < this.filePaths.length; i = i + 1) {
                    filePaths.push(path2url.one(this.filePaths[i]));
                }
                this.filePaths = filePaths;
            }
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

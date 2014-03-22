var _ = require('underscore'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,

    crossGradingSchema = new Schema({
        _id: Schema.Types.ObjectId,
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        homework: {
            type: Number,
            ref: 'Homework'
        },
        submission: {
            type: Schema.Types.ObjectId,
            ref: 'HomeworkSubmission'
        },

        // mixed type
        // {
        //    questionID: "answer to this question",
        //    ...
        // }
        content: Schema.Types.Mixed
    });

crossGradingSchema.methods.strip = function () {
    return {
        _id: this._id,
        content: this.content,
        author: this.author,
        homework: this.homework,
        submission: this.submission
    };
};

crossGradingSchema.methods.pair = function (homework) {
    var that = this,
        data = {};
    _.each(homework.crossGradingQuestions, function (v, k) {
        var d = {
                question: v.question,
                type: v.type
            };
        if (that.content.hasOwnProperty(k)) {
            d.answer = that.content[k];
        } else {
            d.answer = '';
        }
        data[k] = d;
    });
    return data;
};

crossGradingSchema.statics.stripCrossGradings = function (gradings, includeAuthor) {
    var stripped = [], i = 0;
    for (i; i < gradings.length; i = i + 1) {
        stripped[i] = gradings[i].strip(includeAuthor);
    }
    return stripped;
};

crossGradingSchema.methods.updateContentQuestions = function (questions, callback) {
    var newContent = {};
    _.each(questions, function (v, k) {
        if (this.content && this.content.hasOwnProperty(k)) {
            newContent[k] = this.content[k];
        } else {
            if (v.type === 'score') {
                newContent[k] = 0;
            } else if (v.type === 'comment') {
                newContent[k] = '';
            }
        }
    });
    this.content = newContent;
    this.markModified('content');
    this.save(callback);
};

crossGradingSchema.statics.findBySubmission = function (hwsid, callback) {
    return this.find({ submission: hwsid }, callback);
};

crossGradingSchema.statics.findByHomework = function (hwid, callback) {
    return this.find({ homework: hwid }, callback);
};

crossGradingSchema.statics.findByAuthor = function (uid, callback) {
    return this.find({ author: uid }, callback);
};

// return array of created cross gradings
crossGradingSchema.statics.bucketing = function (submissions, students, replicaCount) {
    var CrossGrading = this,
        shuffled = _.shuffle(students),
        bucket = (function (s) {
            var b = [];
            _.each(s, function (e) {
                b.push({
                    student: e,
                    submissions: []
                });
            });
            return b;
        }(shuffled)),
        cgs = [],
        r = 0,
        containsId = function (array, id) {
            var i = 0,
                contains = false;
            for (i; i < array.length; i = i + 1) {
                if (array[i].equals(id)) {
                    contains = true;
                    break;
                }
            }
            return contains;
        };
    for (r; r < replicaCount; r = r + 1) {
        _.each(submissions, function (submission, i) {
            var j, k;
            for (j = 0; j < bucket.length; j = j + 1) {
                k = (i + j + r) % bucket.length;
                if (!bucket[k].student.equals(submission.author) && bucket[k].submissions.length < replicaCount && !containsId(bucket[k].submissions, submission._id)) {
                    bucket[k].submissions.push(submission._id);
                    break;
                }
            }
        });
    }
    console.log(bucket);
    _.each(bucket, function (b) {
        var i, cg;
        for (i = 0; i < b.submissions.length; i = i + 1) {
            cg = new CrossGrading();
            cg._id = new mongoose.Types.ObjectId;
            cg.author = b.student;
            cg.submission = b.submissions[i];
            cgs.push(cg);
        }
    });
    return cgs;
};

module.exports = mongoose.model('CrossGrading', crossGradingSchema);

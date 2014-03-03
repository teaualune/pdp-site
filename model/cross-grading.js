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

crossGradingSchema.methods.strip = function (includeAuthor) {
    var stripped = {
            _id: this._id,
            content: this.content
        };
    if (includeAuthor) {
        stripped.author = this.author;
    }
    return stripped;
};

crossGradingSchema.statics.stripCrossGradings = function (gradings, includeAuthor) {
    var stripped = [], i = 0;
    for (i; i < gradings.length; i = i + 1) {
        stripped[i] = gradings[i].strip(includeAuthor);
    }
    return stripped;
};

crossGradingSchema.methods.updateContentQuestions = function (questions, callback) {
    var newContent = {},
        q;
    for (q in questions) {
        if (questions.hasOwnProperty(q)) {
            if (this.content.hasOwnProperty(q)) {
                newContent[q] = this.content[q];
            } else {
                if (questions[q].type === 'score') {
                    newContent[q] = 0;
                } else if (questions[q].type === 'comment') {
                    newContent[q] = '';
                }
            }
        }
    }
    this.content = newContent;
    this.markModified('content');
    this.save(callback);
};

crossGradingSchema.statics.findBySubmission = function (hwsid, callback) {
    this.find({ submission: hwsid }, callback);
};

crossGradingSchema.static.findByHomework = function (hwid, callback) {
    this.find({ homework: hwid }, callback);
};

crossGradingSchema.statics.findByAuthor = function (uid, callback) {
    this.find({ author: uid }, callback);
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
        }(students)),
        cgs = [];
    _.each(submissions, function (submission, i) {
        var j, k;
        for (j = i; j < bucket.length; j = j + 1) {
            k = j % bucket.length;
            if (!bucket[k].student.equals(submission._id) && bucket[k].submissions.length < replicaCount) {
                bucket[k].submissions.push(submission._id);
                break;
            }
        }
    });
    console.log(bucket);
    _.each(bucket, function (b) {
        var i, cg;
        for (i = 0; i < b.submissions.length; i = i + 1) {
            cg = new CrossGrading();
            cg._id = new Schema.Types.ObjectId;
            cg.author = b.student;
            cg.submission = b.submissions[i]._id;
        }
        cgs.push(cg);
    });
    console.log(cgs);
    return cgs;
};

module.exports = mongoose.model('CrossGrading', crossGradingSchema);

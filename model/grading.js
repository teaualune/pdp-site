var mongoose = require('mongoose'),
    Schema = mongoose.Schema,

    gradingSchema = new Schema({
        _id: Schema.Types.ObjectId,
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        score: Number,
        comment: String
    });

gradingSchema.methods.strip = function (includeAuthor) {
    var stripped = {
            _id: this._id,
            score: this.score,
            comment: this.comment
        };
    if (includeAuthor) {
        stripped.author = this.author;
    }
    return stripped;
};

gradingSchema.statics.stripGradings = function (gradings, includeAuthor) {
    var stripped = [], i = 0;
    for (i; i < gradings.length; i = i + 1) {
        stripped[i] = gradings[i].strip(includeAuthor);
    }
    return stripped;
};

module.exports = mongoose.model('Grading', gradingSchema);

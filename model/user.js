var mongoose = require('mongoose'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt-nodejs'),
    Schema = mongoose.Schema,

    userSchema = new Schema({
        _id: Schema.Types.ObjectId,
        email: String,
        nickname: String,
        password: String,
        admin: {
            type: Boolean,
            default: false
        }
    });

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.strip = function () {
    return {
        _id: this._id,
        email: this.email,
        nickname: this.nickname
    };
};

userSchema.statics.stripUsers = function (users) {
    var stripped = [], i = 0;
    for (i; i < users.length; i = i + 1) {
        stripped[i] = users[i].strip();
    }
    return stripped;
};

userSchema.statics.findByEmail = function (email, callback) {
    this.findOne({ email: email } ,callback);
};

userSchema.statics.findStudents = function (callback) {
    this.find({ admin: false }, callback);
};

module.exports = mongoose.model('User', userSchema);

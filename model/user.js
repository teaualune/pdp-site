var mongoose = require('mongoose'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt-nodejs'),
    Schema = mongoose.Schema,

    userSchema = new Schema({
        _id: Schema.Types.ObjectId,
        email: String,
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

exports.Model = mongoose.model('User', userSchema);
var mongoose = require('mongoose'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt-nodejs'),
    utils = require('./model-utils'),
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
    }),
    User,
    findOne = function (req) {
        return {
            _id: req.params.userID
        };
    };

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

exports.Model = User = mongoose.model('User', userSchema);

exports.index = function (req, res) {
    User.find({}, utils.defaultHandler(res));
};

exports.show = function (req, res) {
    User.find(findOne(req), utils.defaultHandler(res));
};

exports.update = function (req, res) {
    User.find(findOne(req), function (err, user) {
        if (err) {
            res.send(500);
        } else if (user) {
            user.nickname = req.body.nickname;
            user.save(function (err, user) {
                if (err || !user) {
                    res.send(500);
                } else {
                    res.send(user);
                }
            })
        } else {
            res.send(404);
        }
    });
};

exports.destroy = function (req, res) {
    User.remove(findOne(req), utils.destroyHandler(res));
};

var mongoose = require('mongoose'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema,

    teamSchema = new Schema({
        name: String
    });

teamSchema.plugin(autoIncrement.plugin, {
    model: 'Team',
    startAt: 1
});

module.exports = mongoose.model('Team', teamSchema);

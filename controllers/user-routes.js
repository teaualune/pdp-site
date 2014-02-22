var utils = require('./routes-utils'),
    user = require('../model/user');

module.exports = function (app) {
    var root = '/api/user',
        id = 'userID';

    app.get(root, utils.adminAuth, user.index);

    app.get(root + '/:' + id, utils.basicAuth, user.show);

    app.put(root + '/:' + id, utils.basicAuth, user.update);

    app.delete(root + '/:' + id, utils.adminAuth, user.destroy);
};

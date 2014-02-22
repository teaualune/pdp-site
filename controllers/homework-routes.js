var H = require('../model/homework'),
    utils = require('./routes-utils'),
    homework = H.homework,
    submission = H.homeworkSubmission;

module.exports = function (app) {
    var hwRoot = '/api/hw',
        hwID = 'hwID',
        hwsRoot = '/api/hws',
        hwsID = 'hwsID';

    // homework

    app.get(hwRoot, utils.basicAuth, homework.index);

    app.post(hwRoot, utils.adminAuth.concat(utils.uploadFile), homework.create);

    app.get(hwRoot + '/:' + hwID, utils.basicAuth, homework.show);

    app.put(hwRoot + '/:' + hwID, utils.adminAuth, homework.update);

    app.delete(hwRoot + '/:' + hwID, utils.adminAuth, homework.destroy);

    // homeworkSubmission

    app.get(hwsRoot, utils.adminAuth, submission.index);

    app.get('/api/user/:userID/hw', utils.basicAuth, submission.indexByAuthor);

    app.get(hwRoot + '/:' + hwID + '/submission', utils.adminAuth, submission.indexByTarget);

    app.post('/api/user/:userID/hw/:' + hwID, utils.basicAuth.concat(utils.uploadFile), submission.create);

    app.get(hwsRoot + '/:' + hwsID, utils.basicAuth, submission.show);

    app.get('/api/user/:userID/hw/:' + hwID, utils.basicAuth, submission.showByAuthorAndTarget);

    app.put(hwsRoot + '/:' + hwsID, utils.basicAuth, submission.update);
};

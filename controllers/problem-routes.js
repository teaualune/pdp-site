var P = require('../model/problem'),
    utils = require('./routes-utils'),
    problem = P.problem,
    submission = P.problemSubmission;

module.exports = function (app) {
    var pRoot = '/api/problem',
        pID = 'pID',
        psRoot = '/api/ps',
        psID = 'psID';

    // problem

    app.get(pRoot, utils.basicAuth, problem.index);

    app.post(pRoot, utils.adminAuth.concat(utils.uploadFile), problem.create);

    app.get(pRoot + '/:' + pID, utils.basicAuth, problem.show);

    app.put(pRoot + '/:' + pID, utils.adminAuth, problem.update);

    app.delete(pRoot + '/:' + pID, utils.adminAuth, problem.destroy);

    // problemSubmission

    app.get(psRoot, utils.adminAuth, submission.index);

    app.get('/api/user/:userID/problem', utils.basicAuth, submission.indexByAuthor);

    app.get(pRoot + '/:' + pID + '/submission', utils.adminAuth, submission.indexByTarget);

    app.post('/api/user/:userID/problem/:' + pID, utils.basicAuth.concat(utils.uploadFile), submission.create);

    app.get(psRoot + '/:' + psID, utils.basicAuth, submission.show);

    app.get('/api/user/:userID/problem/:' + pID, utils.basicAuth, submission.showByAuthorAndTarget);

    app.put(psRoot + '/:' + psID, utils.basicAuth, submission.update);
};

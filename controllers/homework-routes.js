var H = require('../model/homework'),
    utils = require('./routes-utils'),
    Homework = H.Homework,
    HomeworkSubmission = H.HomeworkSubmission;

module.exports = function (app) {

    // GET /api/hw
    // get all homeworks
    app.get('/api/hw', utils.auth.basic, function (req, res) {
        Homework.find({}, utils.defaultHandler(res));
    });

    // POST /api/hw
    // create a new homework
    app.post('/api/hw', utils.auth.admin.concat(utils.uploadFile('hw')), function (req, res) {
        Homework.create({
            title: req.body.title,
            description: req.body.description,
            manualFilePath: req.body.filePath || ''
        }, utils.defaultHandler(res));
    });

    // GET /api/hw/:hwid
    // get homework by id
    app.get('/api/hw/:hwid', utils.auth.basic, function (req, res) {
        Homework.findById(req.params.hwid, utils.defaultHandler(res));
    });

    // PUT /api/hw/:hwid
    // update homework
    app.put('/api/hw/:hwid', utils.auth.admin, function (req, res) {
        Homework.findById(req.params.hwid, function (err, hw) {
            if (err) {
                res.send(500);
            } else if (hw) {
                hw.title = req.body.title || hw.title;
                hw.description = req.body.description || hw.description;
                hw.save(utils.defaultHandler(res));
            } else {
                res.send(404);
            }
        });
    });

    // DELETE /api/hw/:hwid
    // delete homework
    app.delete('/api/hw/:hwid', utils.auth.admin, function (req, res) {
        Homework.findByIdAndRemove(req.params.hwid, utils.destroyHandler(res));
    });

    // GET /api/hws
    // get all homework submissions
    app.get('/api/hws', utils.auth.admin, function (req, res) {
        HomeworkSubmission.find({}, utils.defaultHandler(res));
    });

    // GET /api/hw/:hwid/hws
    // get all homework submissions of a homework
    app.get('/api/hw/:hwid/hws', utils.auth.admin, function (req, res) {
        HomeworkSubmission.findByHomework(req.params.hwid, utils.defaultHandler(res));
    });

    // GET /api/user/:uid/hw
    // get all homework submissions of a user
    app.get('/api/user/:uid/hw', utils.auth.self, function (req, res) {
        HomeworkSubmission.findByAuthor(req.params.uid, utils.defaultHandler(res));
    });

    // POST /api/user/:uid/hw
    // create or update a homework submission
    app.post('/api/user/:uid/hw', utils.auth.self.concat(utils.uploadFile('hws')), function (req, res) {
        HomeworkSubmission.findByHomework(req.body.hwid, function (err, hws) {
            if (err) {
                res.send(500);
            } else if (hws) {
                // update
                // no attributes are changed, only file uploaded
                res.send(hws);
            } else {
                // create
                HomeworkSubmission.create({
                    author: req.params.uid,
                    target: req.body.hwid,
                    filePath: req.body.filePath
                }, utils.defaultHandler(res));
            }
        });
    });

    // GET /api/user/:uid/hws/:hwsid
    // get homework submission by id
    app.get('/api/user/:uid/hws/:hwsid', utils.auth.self, function (req, res) {
        HomeworkSubmission.findById(req.params.hwsid, utils.defaultHandler(res));
    });

    // GET /api/hw/:uid/:hwid
    // get homework submission by user and homework id
    app.get('/api/hw/:uid/:hwid', utils.auth.self, function (req, res) {
        HomeworkSubmission.findOne({
            author: req.params.uid,
            target: req.params.hwid
        }, utils.defaultHandler(res));
    });

    // PUT /api/hws/:hwsid
    // grades a homework submission (admin only)
    app.put('/api/hws/:hwsid', utils.auth.admin, function (req, res) {
        HomeworkSubmission.findById(req.params.hwsid, function (err, hws) {
            if (err) {
                res.send(500);
            } else if (hws) {
                hws.grading = req.body.grading || hws.grading;
                hws.comment = req.body.comment || hws.comment;
                hws.save(utils.defaultHandler(res));
            } else {
                res.send(404);
            }
        });
    });

};

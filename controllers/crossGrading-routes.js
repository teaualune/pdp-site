var async = require('async'),
    mongoose = require('mongoose'),
    utils = require('./routes-utils'),
    CrossGrading = require('../model/cross-grading'),
    _H = require('../model/homework'),
    Homework = _H.Homework,
    HomeworkSubmission = _H.HomeworkSubmission,
    stripCrossGradingsHandler = function (res) {
        return utils.defaultHandler(res, function (cgs) {
            return CrossGrading.stripCrossGradings(cgs);
        });
    };

module.exports = function (app) {

    // GET /api/cgs/hws/:hwsid
    // get all cgs by hwsid
    app.get('/api/cgs/hws/:hwsid', utils.auth.admin, function (req, res) {
        CrossGrading.findBySubmission(req.params.hwsid, stripCrossGradingsHandler(res));
    });

    // GET /api/cgs/hw/:hwid
    // get all cgs by hwid
    app.get('/api/cgs/hw/:hwid', utils.auth.admin, function (req, res) {
        async.parallel({
            hw: function (callback) {
                Homework.findById(req.params.hwid, callback);
            },
            cgs: function (callback) {
                CrossGrading.find({ homework: req.params.hwid }).populate('author submission').exec(callback);
            }
        }, function (err, results) {
            var cgs = results.cgs,
                hw = results.hw,
                author,
                submission,
                content,
                i;
            if (err) {
                res.send(500, err);
            } else if (cgs) {
                for (i = 0; i < cgs.length; i = i + 1) {
                    author = cgs[i].author.strip();
                    submission = cgs[i].submission.strip();
                    content = cgs[i].pair(hw);
                    cgs[i] = cgs[i].strip();
                    cgs[i].author = author;
                    cgs[i].submission = submission;
                    cgs[i].content = content;
                }
                res.send(cgs);
            } else {
                res.send(404);
            }
        })
        // CrossGrading.findByHomework(req.params.hwid, stripCrossGradingsHandler(res));
    });

    // GET /api/cgs/author/:uid
    // get all cgs by author
    app.get('/api/cgs/author/:uid', utils.auth.self, function (req, res) {
        CrossGrading.findByAuthor(req.params.uid, stripCrossGradingsHandler(res));
    });

    // PUT /api/cgs/:cgid/author/:uid
    // save cg from author
    app.put('/api/cgs/:cgid/author/:uid', utils.auth.self, function (req, res) {
        CrossGrading.findById(req.params.cgid, function (err, cg) {
            if (err) {
                res.send(500);
            } else if (cg) {
                cg.comment = req.body.comment;
                cg.save(utils.defaultHandler(res));
            } else {
                res.send(400);
            }
        });
    });

    // POST /api/cgs
    // start cross grading
    app.post('/api/cgs', utils.auth.admin, function (req, res) {
        var hwid = req.body.hwid,
            questions = req.body.questions || {},
            replicaCount = req.body.count;
        async.waterfall([
            function (callback) {
                Homework.findById(hwid, callback);
            },
            function (hw, callback) {
                // 1. save questions (use markModified)
                hw.crossGradingQuestions = questions || {};
                hw.markModified('crossGradingQuestions');
                hw.save(callback);
            },
            function (hw, affects, callback) {
                // 2. find all hws by hwid (in body)
                HomeworkSubmission.findByHomework(hwid, callback);
            },
            function (submissions, callback) {
                // 3. find all valid students
                var i, students;
                if (submissions.length <= 1 || submissions.length <= replicaCount) {
                    callback('no enough submissions');
                } else {
                    students = [];
                    for (i = 0; i < submissions.length; i = i + 1) {
                        students.push(submissions[i].author);
                    }
                    callback(null, submissions, students);
                }
            },
            function (submissions, students, callback) {
                // 4. assign (hwsid, uid) mapping
                // 5. update created cg instances (homework = hwid)
                var cgs = CrossGrading.bucketing(submissions, students, replicaCount);
                async.map(cgs, function (cg, cb) {
                    cg.homework = hwid;
                    cg.updateContentQuestions(questions, cb);
                }, function (err, cgs) {
                    // console.log('5');
                    // console.log(err);
                    // console.log(cgs);
                    callback(err, cgs);
                });
            }
        ], utils.emptyHandler(res));
    });

    // DELETE /api/cgs
    // reset cross grading
    app.delete('/api/cgs', utils.auth.admin, function (req, res) {
        async.waterfall([
            function (callback) {
                // 1. find all cgs by hwid (in body)
                CrossGrading.findByHomework(req.body.hwid, callback);
            },
            function (submissions, callback) {
                // TODO
                // 2. delete all cgs
                callback(null, submissions, []);
            },
            function (submissions, students, callback) {
                // TODO
                // 3. find all hws by hwid
                callback(null, submissions, students);
            },
            function (submissions, students, callback) {
                // 4. clear crossGrading
            }
        ], utils.emptyHandler(res));
    });

};

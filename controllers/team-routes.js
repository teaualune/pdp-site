var mongoose = require('mongoose'),
    utils = require('./routes-utils'),
    Team = require('../model/team');

module.exports = function (app) {

    // GET /api/team
    // get all teams
    app.get('/api/team', utils.auth.admin, function (req, res) {
        Team.find({}, utils.defaultHandler(res));
    });

    // GET /api/team/:tid
    // get team by id
    app.get('/api/team/:tid', utils.auth.basic, function (req, res) {
        Team.findById(req.params.tid, utils.defaultHandler(res));
    });

    // POST /api/team
    // create a team
    app.post('/api/team', utils.auth.admin, function (req, res) {
        Team.create({ name: req.body.name }, utils.defaultHandler(res));
    });

    // PUT /api/team/:tid
    // update team name
    app.put('/api/team/:tid', utils.auth.admin, function (req, res) {
        Team.findByIdAndUpdate(req.params.tid, { name: req.body.name }, utils.defaultHandler(res));
    });

    // DELETE /api/team/:tid
    // delete a team
    app.delete('/api/team/:tid', utils.auth.admin, function (req, res) {
        Team.findByIdAndRemove('req.params.tid', utils.emptyHandler(res));
    });

};

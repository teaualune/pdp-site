module.exports = {
    defaultHandler: function (res) {
        return function (err, resource) {
            if (err) {
                res.send(500);
            } else if (resource) {
                res.send(resource);
            } else {
                res.send(404);
            }
        };
    },
    destroyHandler: function (res) {
        return function (err) {
            if (err) {
                res.send(500);
            } else {
                res.send(200);
            }
        };
    }
};

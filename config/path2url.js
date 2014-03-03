var path = require('path'),
    _ = require('underscore'),
    path2url = function (filePath) {
        var root = path.normalize(path.join(__dirname, '..')),
            fileURL = filePath;
        if (filePath.indexOf(root) === 0) {
            fileURL = filePath.substring(root.length);
        }
        // TODO change fileURL divider to '/' (in order to fit on Windows)
        return fileURL;
    },
    paths2urls = function (objects, key) {
        _.each(objects, function (v, k) {
            v[key] = path2url(v[key]);
        });
    };

module.exports = {
    one: path2url,
    all: paths2urls
};

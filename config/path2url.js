var path = require('path'),
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
        var i = 0;
        for (i; i < objects.length; i = i + 1) {
            if (objects[i].hasOwnProperty(key)) {
                objects[i][key] = path2url(objects[i][key]);
            }
        }
    };

module.exports = {
    one: path2url,
    all: paths2urls
};

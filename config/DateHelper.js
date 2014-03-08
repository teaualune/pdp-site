var digit2 = function (x) {
    return (x < 10) ? '0' + x : x;
};

module.exports = {
    format: function (timestamp) {
        var d = new Date(timestamp),
            h = d.getHours(),
            m = d.getMinutes();
        return [
            d.getFullYear(),
            digit2(d.getMonth() + 1),
            digit2(d.getDate())
        ].join('-') + ' ' + [
            digit2(d.getHours()),
            digit2(d.getMinutes())
        ].join(':');
    }
};

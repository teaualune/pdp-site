var ntuEmail = /^([b|r][0-9]{8})@([a-zA-Z]+\.)?ntu\.edu\.tw$/;

exports.validate = function (email) {
    var e = email[0].toLowerCase() + email.substr(1);
    return ntuEmail.test(e);
};

exports.getStudentID = function (email) {
    return ntuEmail.exec(email)[1];
};

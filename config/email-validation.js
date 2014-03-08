var ntuEmail = /^([b|r|d|p][0-9]{8})@([a-z]+\.)?ntu\.edu\.tw$/;

exports.validate = function (email) {
    return ntuEmail.test(exports.normalize(email));
};

exports.getStudentID = function (email) {
    return ntuEmail.exec(email)[1];
};

exports.normalize = function (email) {
    return email[0].toLowerCase() + email.substr(1);
};

var ntuEmail = /^[b|r][0-9]{8}@([a-zA-Z]+\.)?ntu\.edu\.tw$/;

module.exports = function (email) {
    var e = email[0].toLowerCase() + email.substr(1);
    return ntuEmail.test(e);
};

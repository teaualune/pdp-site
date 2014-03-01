Parallel and Distributed Programming Course Site
=========================================

Express web app for assignments upload and cross grading for PDP course in NTU CSIE.
------------------------------------------------------------------------------------

### Features

* Upload submissions. There are currently two kinds of submission:
  * Homework
  * Problem
* Web interface for administration managements.
* Homework cross-grading.
* Problem solving state statistics.
* NTU students only. Emails other than NTU emails will be blocked during registration.

### Requirements

* [Node.js](http://nodejs.org)
* [MongoDB](http://www.mongodb.org)
* [Bower](http://bower.io)

### Major Dependencies and References

* [Express](http://expressjs.com)
* [Mongoose](http://mongoosejs.com)
* [Passport](http://passportjs.org)
* [Angular.js](http://angularjs.org)
* [AngularUI Router](https://github.com/angular-ui/ui-router)
* [Restangular](https://github.com/mgonto/restangular)
* [Pure](http://purecss.io)
* [NIPPON COLORS](http://nipponcolors.com)

### Installation and Running

1. Install Node.js and MongoDB; and use `npm install -g bower` to install Bower.
2. Clone this repository.
3. Run `npm install` in repository folder.
4. Start MongoDB by `mongod /path/to/db` where `mongod` resides in `bin` folder of MongoDB path and `/path/to/db` an abitrary folder to place database records.
5. Run `bower install` in repository folder.
6. Run `node app` in repository folder.

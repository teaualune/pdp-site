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
* [LESS](http://lesscss.org)
* [Pure](http://purecss.io)
* [NIPPON COLORS](http://nipponcolors.com)
* [PyMongo](https://github.com/mongodb/mongo-python-driver)
* Special Thanks: [ぬー。](http://www.pixiv.net/member.php?id=5278692)

### Installation and Running

1. Install Node.js and MongoDB; and use `npm install -g bower` to install Bower.
2. Clone this repository.
3. Run `npm install` in repository folder.
4. Start MongoDB by `./mongod -dbpath /path/to/db` where `mongod` resides in `bin` folder of MongoDB path and `/path/to/db` an abitrary folder to place database records.
5. Run `bower install` in repository folder.
6. Create `upload` foler and several subfolders (`hw`, `hws`, `problem` and `ps` for homework description, homework submission, problem description and problem submission respectively) for file uploads. Directory names are specified and configurable in `settings.json`.
7. Run `node app` in repository folder.

### Quick Installation and Running
1. Install Nodejs and Mongodb. Set $PATH to these two binaries.
2. Install PyMongo.
3. `./config.sh`
4. `./install.sh`
5. `./exec.sh`
6. If you want to stop it, use `kill.sh`.

### Assign admin priviledge to a user

1. Register a new account first.
2. Run MongoDB shell by `./mongo` where `mongo` resides in `bin` folder of MongoDB path.
3. In the interactive mode run the following commands. Change email field to the email of registered account:

```sh
use pdp

db.users.update({ email: "r0x922xxx@csie.ntu.edu.tw" }, { $set: { admin:true } })
```

### Reset Homework or Problem Numbers

This project uses [mongoose-auto-increment](https://github.com/codetunnel/mongoose-auto-increment) to assign incrementing IDs to created homework or problems.
However, simply deletes those instances do not decrease the counting number.
In order to do so or reset the number, please follow the database operations:

```sh
use pdp

# reset Homework count to 1
db["mongoose-auto-increments"].update({ model: "Homework" }, { $set: { count: 1 }})

# decrease Problem count by 1
db["mongoose-auto-increments"].update({ model: "Problem" }, { $inc: { count: -1 }})

```

### Code Structure

* `config`
  * Utility functions for helping configurations.
* `controllers`
  * Routing modules to handle each HTTP requests.
  * `index.js`
    * Routes collector.
  * `auth.js`
    * Provide authentication-related middleware.
  * `main.js`
    * Login and registration related routers.
  * `routes-utils.js`
    * Utility middleware and functions for helping routers.
* `model`
  * Define database schema and related helper functions.
* `public`
  * `javascripts`
    * Front-end JavaScript code base.
    * `pdp-resource.js`
      * Ajax functions for RESTful requests.
      * Depends on Restangular for general RESTful calls and HTML5 file APIs for file upload.
    * `app.js`
      * Define controllers shared between admin and students.
      * Heavily depends on AngularUI Router.
    * `app-admin.js`
      * Admin-related controllers.
    * `app-students.js`
      * Student-related controllers.
  * `stylesheets`
    * CSS files.
  * `templates`
    * HTML code fragments used by Angular.js.
    * `a`
      * Admin account related view fragments.
    * `s`
      * Student account related view fragments.
* `views`
  * Ejs view fragments.
* `app.js`
  * Main entry and startup point of the application.
* `settings.json`
  * Contains settings that can be adjusted according to different environments.

### License

[MIT License](http://opensource.org/licenses/MIT)

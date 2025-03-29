/*********************************************************************************
*  WEB422 – Assignment 6
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Nilrudra Mukhopadhyay   Student ID: 134061175   Date: 04/07/2025
*
********************************************************************************/
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let mongoDBConnectionString = "mongodb+srv://nmukhopadhyay:POP290lo@sample-data.geyjw.mongodb.net/?retryWrites=true&w=majority&appName=Sample-Data";
let Schema = mongoose.Schema;
let userSchema = new Schema({
    userName: {
        type: String,
        unique: true
    },
    password: String,
    favourites: [String],
    history: [String]
});
let User;

module.exports.connect = function () {
    return new Promise((resolve, reject) => {
        mongoose.connect(mongoDBConnectionString, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            User = mongoose.model("users", userSchema);
            resolve();
        })
        .catch(err => reject(err));
    });
};

module.exports.registerUser = function (userData) { // api/user/register
    return new Promise(function (resolve, reject) {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        } else {
            bcrypt.hash(userData.password, 10).then(hash => {
                userData.password = hash;
                let newUser = new User(userData);
                newUser.save().then(() => {
                    resolve("User " + userData.userName + " successfully registered");  
                }).catch(err => {
                    if (err.code == 11000) {
                        reject("User Name already taken");
                    } else {
                        reject("There was an error creating the user: " + err);
                    }
                })
            }).catch(err => reject(err));
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        User.findOne({ userName: userData.userName })
            .exec()
            .then(user => {
                if (!user) {
                    return reject("User not found: " + userData.userName);
                }
                bcrypt.compare(userData.password, user.password)
                    .then(match => {
                        if (match) {
                            resolve(user);
                        } else {
                            reject("Incorrect password for user " + userData.userName);
                        }
                    })
                    .catch(() => reject("Error comparing passwords"));
            })
            .catch(err => reject("Internal server error. Please try again later."));
    });
};

module.exports.getFavourites = function (id) {
    return new Promise(function (resolve, reject) {
        User.findById(id)
            .exec()
            .then(user => {
                resolve(user.favourites)
            }).catch(err => {
                reject(`Unable to get favourites for user with id: ${id}`);
            });
    });
};

module.exports.addFavourite = function (id, favId) {
    return new Promise(function (resolve, reject) {
        User.findById(id).exec().then(user => {
            if (user.favourites.length < 50) {
                User.findByIdAndUpdate(id,
                    { $addToSet: { favourites: favId } },
                    { new: true }
                ).exec()
                    .then(user => { resolve(user.favourites); })
                    .catch(err => { reject(`Unable to update favourites for user with id: ${id}`); })
            } else {
                reject(`Unable to update favourites for user with id: ${id}`);
            }
        })
    });
};

module.exports.removeFavourite = function (id, favId) {
    return new Promise(function (resolve, reject) {
        User.findByIdAndUpdate(id,
            { $pull: { favourites: favId } },
            { new: true }
        ).exec()
            .then(user => {
                resolve(user.favourites);
            })
            .catch(err => {
                reject(`Unable to update favourites for user with id: ${id}`);
            })
    });
};

module.exports.getHistory = function (id) {
    return new Promise(function (resolve, reject) {
        User.findById(id)
            .exec()
            .then(user => {
                resolve(user.history)
            }).catch(err => {
                reject(`Unable to get history for user with id: ${id}`);
            });
    });
};

module.exports.addHistory = function (id, historyId) {
    return new Promise(function (resolve, reject) {
        User.findById(id).exec().then(user => {
            if (user.history.length < 50) {
                User.findByIdAndUpdate(id,
                    { $addToSet: { history: historyId } },
                    { new: true }
                ).exec()
                    .then(user => { resolve(user.history); })
                    .catch(err => { reject(`Unable to update history for user with id: ${id}`); })
            } else {
                reject(`Unable to update history for user with id: ${id}`);
            }
        })
    });
};

module.exports.removeHistory = function (id, historyId) {
    return new Promise(function (resolve, reject) {
        User.findByIdAndUpdate(id,
            { $pull: { history: historyId } },
            { new: true }
        ).exec()
            .then(user => {
                resolve(user.history);
            })
            .catch(err => {
                reject(`Unable to update history for user with id: ${id}`);
            })
    });
};

module.exports.getUserById = function (id) {
    return User.findById(id).exec();
};

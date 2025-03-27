/*********************************************************************************
*  WEB422 – Assignment 6
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Nilrudra Mukhopadhyay   Student ID: 134061175   Date: 04/07/2025
*
********************************************************************************/
const passport = require("./passport-config");
const express = require('express');
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const authenticate = passport.authenticate("jwt", { session: false });
const userService = require("./user-service.js");

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

app.get('/', (req, res) => {
    res.send('Welcome to the User API');
});

app.post("/api/user/register", (req, res) => {
    userService.registerUser(req.body)
    .then((msg) => {
        res.json({ "message": msg });
    }).catch((msg) => {
        res.status(422).json({ "message": msg });
    });
});

app.post("/api/user/login", (req, res) => {
    userService.checkUser(req.body)
    .then(user => {
        const payload = { _id: user._id, userName: user.userName };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ "message": "Login successful", "token": token });
    })
    .catch(msg => {
        res.status(422).json({ "message": msg });
    });
});

app.get("/api/user/favourites", authenticate, (req, res) => {
    userService.getFavourites(req.user._id)
    .then(data => res.json(data))
    .catch(msg => res.status(422).json({ error: msg }));
});

app.put("/api/user/favourites/:id", authenticate, (req, res) => {
    userService.addFavourite(req.user._id, req.params.id)
    .then(data => res.json(data))
    .catch(msg => res.status(422).json({ error: msg }));
});

app.delete("/api/user/favourites/:id", authenticate, (req, res) => {
    userService.removeFavourite(req.user._id, req.params.id)
    .then(data => res.json(data))
    .catch(msg => res.status(422).json({ error: msg }));
});

app.get("/api/user/history", authenticate, (req, res) => {
    userService.getHistory(req.user._id)
    .then(data => res.json(data))
    .catch(msg => res.status(422).json({ error: msg }));
});

app.put("/api/user/history/:id", authenticate, (req, res) => {
    userService.addHistory(req.user._id, req.params.id)
    .then(data => res.json(data))
    .catch(msg => res.status(422).json({ error: msg }));
});

app.delete("/api/user/history/:id", authenticate, (req, res) => {
    userService.removeHistory(req.user._id, req.params.id)
    .then(data => res.json(data))
    .catch(msg => res.status(422).json({ error: msg }));
});

userService.connect()
.then(() => {
    app.listen(HTTP_PORT, () => { console.log("API listening on: " + HTTP_PORT) });
})
.catch((err) => {
    console.log("unable to start the server: " + err);
    process.exit();
});

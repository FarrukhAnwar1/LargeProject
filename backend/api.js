require('express');
require('mongodb');
const {User, Car, Rental} = require('./models/index.js');
const token = require('./createJWT.js');

exports.setApp = function (app, client) {
    app.get("/api/ping", (req, res, next) => {
        res.status(200).json({ message: "Hello World!" });
    });
    app.post('/api/login', async (req, res, next) => {
        // incoming: login, password
        // outgoing: id, firstName, lastName, error
        var error = '';
        const { login, password } = req.body;
        const results = await User.find({ userName: login, passwordHash: password });
        var id = -1;
        var fn = '';
        var ln = '';
        var isVerified = false;
        var ret;
        if (results.length > 0) {
            id = results[0]._id.toString();
            fn = results[0].firstName;
            ln = results[0].lastName;
            isVerified = results[0].isVerified;
            if (!isVerified) {
                ret = { error: "User not verified" };
                res.status(200).json(ret);
                return;
            }
            try {
                ret = token.createToken(fn, ln, id);
            }
            catch (e) {
                ret = { error: e.message };
            }
        }
        else {
            ret = { error: "Login/Password incorrect" };
        }
        res.status(200).json(ret);
    });
    // app.post('/api/addcard', async (req, res, next) => {
    //     // incoming: userId, color
    //     // outgoing: error
    //     const { userId, card, jwtToken } = req.body;
    //     try {
    //         if (token.isExpired(jwtToken)) {
    //             var r = { error: 'The JWT is no longer valid', jwtToken: '' };
    //             res.status(200).json(r);
    //             return;
    //         }
    //     }
    //     catch (e) {
    //         console.log(e.message);
    //     }
    //     const newCard = new Card({ Card: card, UserId: userId });
    //     var error = '';
    //     try {
    //         newCard.save();
    //     }
    //     catch (e) {
    //         error = e.toString();
    //     }
    //     var refreshedToken = null;
    //     try {
    //         refreshedToken = token.refresh(jwtToken);
    //     }
    //     catch (e) {
    //         console.log(e.message);
    //     }
    //     var ret = { error: error, jwtToken: refreshedToken };
    //     res.status(200).json(ret);
    // });
    // app.post('/api/searchcards', async (req, res, next) => {
    //     // incoming: userId, search
    //     // outgoing: results[], error
    //     var error = '';
    //     const { userId, search, jwtToken } = req.body;
    //     try {
    //         if (token.isExpired(jwtToken)) {
    //             var r = { error: 'The JWT is no longer valid', jwtToken: '' };
    //             res.status(200).json(r);
    //             return;
    //         }
    //     }
    //     catch (e) {
    //         console.log(e.message);
    //     }
    //     var _search = search.trim();
    //     const results = await Card.find({
    //         UserId: userId,
    //         "Card": {
    //             $regex: _search + '.*',
    //             $options: 'i'
    //         }
    //     });
    //     var _ret = results.map(r => r.Card);
    //     var refreshedToken = null;
    //     try {
    //         refreshedToken = token.refresh(jwtToken);
    //     }
    //     catch (e) {
    //         console.log(e.message);
    //     }
    //     var ret = { results: _ret, error: error, jwtToken: refreshedToken };
    //     res.status(200).json(ret);
    // });
}
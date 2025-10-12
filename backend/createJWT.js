const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.createToken = function (fn, ln, id) {
    return _createToken(fn, ln, id);
}

function _createToken(fn, ln, id) {
    try {
        const user = { userId: id, firstName: fn, lastName: ln };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
        // To set custom expiration, use: jwt.sign(user, secret, { expiresIn: '30m' })
        return { accessToken: accessToken };
    }
    catch (e) {
        return { error: e.message };
    }
}

exports.isExpired = function (token) {
    try {
        // jwt.verify throws if token invalid/expired
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        return false;
    } catch (e) {
        return true;
    }
}

exports.refresh = function (token) {
    const ud = jwt.decode(token, { complete: true });
    if (!ud || !ud.payload) {
        return { error: 'Invalid token' };
    }
    const userId = ud.payload.userId;
    const firstName = ud.payload.firstName;
    const lastName = ud.payload.lastName;
    return _createToken(firstName, lastName, userId);
}
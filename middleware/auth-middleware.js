const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;

const db = require('../data/database');


async function auth(req, res, next) {
    const user = req.session.user;
    const isAuth = req.session.isAuthentic;

    if (!user || !isAuth) {
        return next();
    }

    const userDoc = await db.getDb().collection('users').findOne({ _id: new ObjectId(user.id) });

    const isAdmin = userDoc.isAdmin;
    const userId = user.id;
    res.locals.userId = userId;
    res.locals.isAuth = isAuth;
    res.locals.isAdmin = isAdmin;

    next();
};

module.exports = auth;
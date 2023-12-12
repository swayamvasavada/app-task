const bcrypt = require('bcryptjs');
const db = require('../data/database');

function getSignup(req, res) {
    if (res.locals.isAuth) {
        return res.redirect('/tasks');
    }

    let sessionInputData = req.session.inputData;

    if (!sessionInputData) {
        sessionInputData = {
            hasError: false,
            email: '',
            password: '',
            confirmPassword: ''
        }
    }

    req.session.inputData = null;

    res.render('signup', { inputData: sessionInputData });
}

function getLogin(req, res) {

    if (res.locals.isAuth) {
        return res.redirect('/tasks');
    }

    let sessionData = req.session.inputData;
    req.session.inputData = null;

    if (!sessionData) {
        sessionData = {
            hasError: false,
            email: ''
        };
    }

    res.render('login', { sessionData: sessionData });
}

async function signUp(req, res) {
    userData = req.body;

    if (!userData.email || !userData.email.includes('@') || !userData.password || userData.password !== userData['confirm-password']) {
        req.session.inputData = {
            hasError: true,
            message: 'Please rechek information!',
            email: userData.email,
            password: userData.password,
            confirmPassword: userData['confirm-password']
        };

        req.session.save(function () {
            res.redirect('/signup');
        })

        return;
    }

    const hasedPassword = await bcrypt.hash(userData.password, 12);

    const user = {
        email: userData.email,
        password: hasedPassword
    };

    await db.getDb().collection('users').insertOne(user);

    res.redirect('/login');
}

async function login(req, res) {
    const userInfo = req.body;

    const existingUser = await db.getDb().collection('users').findOne({ email: userInfo.email });

    if (!existingUser) {
        req.session.inputData = {
            hasError: true,
            message: 'User does not exists',
            email: userInfo.email,
        };

        req.session.save(function () {
            res.redirect('/login');
        });

        return;
    }

    const passwordAreEqual = await bcrypt.compare(userInfo.password, existingUser.password);

    if (!passwordAreEqual) {
        req.session.inputData = {
            hasError: true,
            message: 'Incorrect password! Please try again!',
            email: userInfo.email
        };

        req.session.save(function () {
            res.redirect('/login');
        });
        return;
    }


    try {

        req.session.user = {
            id: existingUser._id,
            email: existingUser.email
        }

        req.session.isAuthentic = true;
    }
    catch (error) {
        console.log(error);
    }

    req.session.save(function () {
        res.redirect('/tasks');
    });

    return;
}

function logout(req, res) {
    req.session.user = null;
    req.session.isAuthentic = false;
    res.redirect('/');
}

async function googleLogin(req, res) {
    const userEmail = req.user._json.email;
    let userId;
    const existingUser = await db.getDb().collection('users').findOne({ email: userEmail });

    if (!existingUser) {
        try {
            let user = {
                email: userEmail,
                socialLogin: 'google'
            }
            const result = await db.getDb().collection('users').insertOne(user);
            userId = result.insertedId.toString();
        } catch (error) {
            console.log(error)
        }
    }
    else {
        userId = existingUser._id;
    }


    try {

        req.session.user = {
            id: userId,
            email: 'swayam.vasavada1505@gmail.com'
        }
        req.session.isAuthentic = true;
    }
    catch (error) {
        console.log(error);
    }

    req.session.save(function () {
        res.redirect('/tasks');
    })
}

module.exports = {
    getSignup: getSignup,
    getLogin: getLogin,
    signUp: signUp,
    login: login,
    logout: logout,
    googleLogin: googleLogin
}
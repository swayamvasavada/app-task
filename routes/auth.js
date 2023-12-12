const express = require('express');
const passport = require('passport');

const router = express.Router();

const authControllers = require('../controllers/auth.controllers');

router.get('/signup', authControllers.getSignup);

router.get('/login', authControllers.getLogin);

router.post('/signup', authControllers.signUp);

router.post('/login', authControllers.login);

router.post('/logout', authControllers.logout);


router.get('/auth/google', passport.authenticate('google', { scope: ['email'] }));

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/error' }),
    function (req, res) {
        // Successful authentication, redirect success.
        res.redirect('/google/login');
    }
);

router.get('/google/login', authControllers.googleLogin);


module.exports = router;
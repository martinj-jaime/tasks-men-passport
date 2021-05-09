const express = require('express');
const router = express.Router();

const User = require('../models/User')

const passport = require('passport')

//

router.get('/users/sign-in', (req, res) => {
    res.render('users/sign-in.hbs');
});

router.post('/users/sign-in', passport.authenticate('local', {
    successRedirect: '/notes',
    failureRedirect: '/users/sign-in',
    failureFlash: true
}));

//

router.get('/users/sign-up', (req, res) => {
    res.render('users/sign-up.hbs');
});

router.post('/users/sign-up', async (req, res) => {
    const { name, email, password, confirm_password } = req.body
    const errors = []
    if(!name) {
        errors.push({text: 'Please Insert a Name'});
    }
    if(!email) {
        errors.push({text: 'Please Insert a Email'});
    }
    if(!password) {
        errors.push({text: 'Please Insert a Password'});
    }
    if(password.length < 4) {
        errors.push({ text: 'Password must be at least 4 characters' })
    }
    if(!confirm_password) {
        errors.push({text: 'Please Confirm you password'});
    }
    if(password != confirm_password) {
        errors.push({ text: 'Password do not match' })
    }
    
    if(errors.length > 0) {
        res.render('users/sign-up', {
            errors, name, email, password, confirm_password
        })
    } else {
        const emailUser = await User.findOne({email: email})
        if(emailUser) {
            req.flash('error_msg', 'The Email is already in use')
            res.redirect('/users/sign-up')
        }

        const newUser = new User({ name, email, password })
        newUser.password = await newUser.encryptPassword(password);
        await newUser.save();
        req.flash('success_msg', `¡Welcome ${name}!`)
        res.redirect('/users/sign-in')
    }
})

router.get('/users/log-out', (req, res) => {
    req.logOut();
    res.redirect('/');
})

module.exports = router;
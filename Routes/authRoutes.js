const express = require('express');
const router = express.Router();
const Auth = require("../Controllers/authController");
const { check } = require('express-validator');
const { routeCredentialValidator } = require('../Middlewares/CredentialsValidator');

router.route("/signup")
    .post([
        check("email").exists().isLength({min:5}),
        check("password").exists().isLength({min:6}),
        check("username").exists().isLength({min:3})
    ],
        Auth.Signup)
router.route("/login")
    .post([
        check("email").exists().isLength({min:5}),
        check("password").exists().isLength({min:6})
    ],routeCredentialValidator,Auth.Login)


module.exports = router;
const express = require("express");
const router  = express.Router();
const {requireSignin , isAuth , isAdmin} = require("../controlers/auth");
const {userById}      =  require("../controlers/auth");


const {generateToken,processPayment} = require("../controlers/braintree");

//to send the token to the front end
router.get("/getToken/:userId", requireSignin, isAuth, generateToken);

//to get the user payment info from the fronent
router.post(
    "/payment/:userId",
    requireSignin,
    isAuth,
    processPayment
);


router.param("userId", userById);

module.exports = router;

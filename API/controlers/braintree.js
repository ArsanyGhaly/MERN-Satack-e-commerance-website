const User = require('../models/user');
const braintree = require('braintree');
require('dotenv').config();
const {errorHandler}   = require("../helpers/dbErrorHandler");




//first create the contact method using the env,ib,private and public key
const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox, // Production
    merchantId: process.env.BRAINTREE_MARCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY
});

//genrate the token then try it useing postman
exports.generateToken  = (req,res)=> {
    gateway.clientToken.generate({},function(err,response){
        if(err) {
          res.status(500).send(err);
        }
        else{
          console.log(response)
          res.send(response)
        }
    })


};


//get the amount and the paymethod from the front end
exports.processPayment  = (req,res)=> {
      let nonceFromTheClient = req.body.paymentMethodNonce;
      let amountFromTheClient = req.body.amount;

// start the new transaction which will take the ammount and the payment methods
// and the options then get the error or the response that the transaction is already done

let newTransaction = gateway.transaction.sale(
    {
        amount: amountFromTheClient,
        paymentMethodNonce: nonceFromTheClient,
        options: {
            submitForSettlement: true
        }
    },
    (error, result) => {
        if (error) {
            res.status(500).json(error);
        } else {
            res.json(result);
        }
    }
);




};

const User = require ("../models/user");
const uuidv1   =  require('uuid/v1');
const Mailer   = require("../helpers/mailer");
const {errorHandler}   = require("../helpers/dbErrorHandler");
const jwt = require('jsonwebtoken'); // to generate signed token
const expressJwt = require('express-jwt'); // for authorization check
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');


exports.contectUs =(req,res) =>{
  var mailOptions = {
      from: process.env.E_MAIL,
      to: process.env.E_MAIL,
      subject: `BooKsShop ${req.body.subject}`,
      text: `${req.body.message}`,
      html: `<p>This message is comming from ${req.body.firstname} ${req.body.lastname}:</p> 
      <p>This message is comming from ${req.body.email}:</p>
      <p>${req.body.message}</p>`
  };
Mailer.sendEmail(mailOptions);
}


exports.signUp = async(req,res) => {
  try{
    //console.log("req.body",req.body);

    //chech if the user already exist
    const preuser = await User.findOne({"email":req.body.email});
    if(preuser)
    {
      return res.status(400).json({
        error : "The user Already exist Please LogIn"
      });
    }
      const SecretToken = uuidv1();
      const user =  new User(req.body);

      user.secretToken =SecretToken;
       user.save((err,user) => {
          if (err) {
              return res.status(400).json({
                     error : err
                  })
                }else{
                user.salt = undefined;
                user.hashed_password = undefined;

                res.json({
                  user
                })
                var mailOptions = {
                    from: process.env.E_MAIL,
                    to: req.body.email,
                    subject: 'Password Reset Instructions',
                    text: `Please use the following link to reset your password: ${
                        process.env.CLIENT_URL
                    }/#/active/${SecretToken}`,
                    html: `<p>Please use the following link to reset your password:</p> <p>${
                        process.env.CLIENT_URL
                    }/#/active/${SecretToken}</p>`
                };




              }
                 Mailer.sendEmail(mailOptions);
            })



}catch(err){
  return res.status(400).json({
    error : err
  });
}
};
exports.signin = (req, res) => {
    // find the user based on email
    const { email, password } = req.body;
    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist. Please signup'
            });
        }
        // if user is found make sure the email and password match
        // create authenticate method in user model
        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: 'Email and password dont match'
            });
        }

        if(user.block){  return res.status(403).json({
            error : "User is Blocked"
          });}
        if(!user.active){  return res.status(403).json({
              error : "User is Not Active"
            });}

        // generate a signed token with user id and secret
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        // persist the token as 't' in cookie with expiry date
        res.cookie('t', token, { expire: new Date() + 9999 });
        // return response with user and token to frontend client
        const { _id, firstname, email, role } = user;
        return res.json({ token, user: { _id, email, firstname, role } });
    });
};
/**
exports.signin = (req,res) => {
    //install jsonwebtoken to genrate sigle token
    //install express-jwt' to sign in
    // get the email and the password from the body
    const {email ,password } = req.body;

    //try to find the email if error or not user return message
    User.findOne({email},
      (err,user) => {
          if(err || !user) {
            return res.status(400).json({
               error : "USer with this eamil doesnot exist . Please Signup"
            });
          }

          //if user is exist make sure that the email and password match
          //use the authanticate function on the user model to compare the hashpasswords
          if(!user.authenticate(password)){
            return res.status(401).json({
                error : " Email and Password do not match"
            })
          }
                if(!user.active)
                {
                  console.log('THE ACCOUNT IS NOT ACTIVE');
                  //req.flash('error',"THE ACCOUNT IS NOT ACTIVE");
                  return res.status(401).json({
                      error : "THE ACCOUNT IS NOT ACTIVE Please check you email"
                  })
                }

               if(user.block)
               {
                return res.status(401).json({
                    error : "Your ACCOUNT IS blocked"
                })
              }


          // if the password and the email match start the signin process
          //creat JWT_SECRET in the .env file tp be secret token
          //genrate the token using the serect token and the user id
          const token = jwt.sign({_id:user._id},process.env.JWT_SECRET);
          //create the cookie as 't' and the expire date
          res.cookie('t', token, { expire: new Date() + 9999 });

          //get the user_id ,name,email,role from user
          const {_id,firstname,lastname,email,role} = user;
          //return the genrated token with the user
          return res.json({token,user:{_id,email,firstname,lastname,role}});

        });


};

**/
exports.signout = (req,res) => {
    res.clearCookie("t");
    res.json({message : "Sign out Successfuly"})

};
exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty : "auth"
});
exports.isAuth = (req,res,next) => {

      let user = req.profile && req.auth && (req.profile._id == req.auth._id);
       //console.log("req.profile ", req.profile, " req.auth ", req.auth);


      if (!user) {
        return res.status(403).json({
          error : "Access denied"
        });
      }


next();


}
exports.isAdmin = (req,res,next) => {
  //console.log(req)
      if (req.profile.role === 0){
          return res.status(403).json({
            error : 'Admin resource Access Denied !!'
          })

      }
      next();
}
exports.forgotPassword = (req, res) => {
    if (!req.body) return res.status(400).json({ message: 'No request body' });
    if (!req.body.email) return res.status(400).json({ message: 'No Email in request body' });

  //  console.log('forgot password finding user with that email');
    const { email } = req.body;

    //console.log('signin req.body', email);

    //try to find the email if error or not user return message
    // find the user based on email
    User.getUserByEmail(email , (err, user) => {
        // if err or no user
        if (err || !user){
            return res.status('401').json({
                error: 'User with that email does not exist!'
            });
          }
          if(user.block)
          {
           return res.status(401).json({
               error : "Your ACCOUNT IS blocked"
           })
         }
        // generate a token with user id and secret
        const token = jwt.sign({ _id: user._id, iss: process.env.APP_NAME }, process.env.JWT_SECRET);

        // email data
        const emailData = {
            from: process.env.E_MAIL,
            to: email,
            subject: 'Password Reset Instructions',
            text: `Please use the following link to reset your password: ${
                process.env.CLIENT_URL
            }/#/reset-password/${token}`,
            html: `<p>Please use the following link to reset your password:</p> <p>${
                process.env.CLIENT_URL
            }/#/reset-password/${token}</p>`
        };

        return user.updateOne({ secretToken: token }, (err, success) => {
            if (err) {
                return res.json({ message: err });
            } else {
                Mailer.sendEmail(emailData);
                return res.status(200).json({
                    message: `Email has been sent to ${email}. Follow the instructions to reset your password.`
                });
            }
        });
    });
};

// to allow user to reset password
// first you will find the user in the database with user's resetPasswordLink
// user model's resetPasswordLink's value must match the token
// if the user's resetPasswordLink(token) matches the incoming req.body.resetPasswordLink(token)
// then we got the right user

exports.resetPassword = (req, res) => {
    const { secretToken, password } = req.body;

    User.getUserByToken(secretToken , (err, user) => {
        // if err or no user
        if (err || !user){
            return res.status('401').json({
                error: 'Invalid Link!'
            });
          }
        if(user.block)
            {
             return res.status(401).json({
                 error : "Your ACCOUNT IS blocked"
             })
           }
        const updatedFields = {
            password: password,
            secretToken: '',
            active:true,
            updated:Date.now()
        };

        user = _.extend(user, updatedFields);

        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json({
                message: `Great! Now you can login with your new password.`
            });
        });
    });
};


exports.userById = (req, res,next,id) => {
      // try to find the id of the user
      User.findById(id).exec((err,user) => {
          if(err || !user){
            return res.status(400).json({
              error:"User not found"
            });
          }
          //if found store the user on the req.profile
          req.profile = user;
          next();
      });
};

exports.userBytarget=(req, res,next,target) =>{
  // try to find the id of the user
  User.findById(target).exec((err,user) => {
      if(err || !user){
        return res.status(400).json({
          error:"User not found"
        });
      }
      //if found store the user on the req.profile
      req.target = user;
      next();
  });
}
exports.userByToken = (req, res,next,token) => {
      // try to find the id of the user
      User.getUserByToken(token).exec((err,user) => {
          if(err || !user){
            return res.status(400).json({
              error:"User not found"
            });
          }
          //if found store the user on the req.profile
          req.token = user.secretToken;
          next();
      });
};

exports.activate = (req, res) => {

    let secretToken = req.token;
    User.getUserByToken(secretToken , (err, user) => {
        // if err or no user
        if (err || !user){
            return res.status('401').json({
                error: 'Invalid Link!'
            });
          }
        if(user.block)
            {
             return res.status(401).json({
                 error : "Your ACCOUNT IS blocked"
             })
           }
        const updatedFields = {
            secretToken: '',
            active:true,
            updated:Date.now()
        };


        return user.updateOne(updatedFields, (err, success) => {
                if (err) {
                    return res.json({ message: err });
                } else {
                    return res.status(200).json({
                        message: "gtggggg",
                        user:user
                    });
                }
            });


    });

};
exports.block = (req, res) =>{
    var user = req.target;
    if(user.block)
        {
         return res.status(401).json({
             error : "Your ACCOUNT IS blocked"
         })
       }else{
    const updatedFields = {
            block: true
        };

    user = _.extend(user, updatedFields);
    user.updated = Date.now();

      user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json({
                message: `your account is blocked.`
            });
          });
}
};
exports.unblock = (req, res) => {
    var user = req.target;
    if(!user.block)
        {
         return res.status(401).json({
             error : "Your ACCOUNT IS active"
         })
       }else{
    const updatedFields = {
            block: false,
            updated :Date.now()
        };

    user = _.extend(user, updatedFields);


      user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            res.json({
                message: `your account is Active.`
            });
          });
}
};

const express               = require("express");
const router                = express.Router();
const {signUp,
  signin,signout,
  requireSignin,forgotPassword,
  resetPassword,userById,
  activate,block,
  isAuth,
  isAdmin,
  contectUs,
unblock,userByToken}              = require("../controlers/auth")
const {userSignupValidator,userSigninValidator,passwordResetValidator} = require("../validator")

router.post("/signup" ,userSignupValidator,signUp);
router.post("/signin" ,userSigninValidator,signin);
router.get("/signout" ,signout);

// password forgot and reset routes
router.put('/forgot-password', forgotPassword);
router.put('/reset-password', passwordResetValidator, resetPassword);
router.put('/active/:token', activate);
router.post('/contectUs', contectUs);
router.param("token" ,userByToken);



module.exports = router;

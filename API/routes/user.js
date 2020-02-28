const express               = require("express");
const router                = express.Router();
const {requireSignin,resetPassword,userById,block,isAuth,isAdmin,unblock,userBytarget}              = require("../controlers/auth")
const {userSignupValidator,userSigninValidator,passwordResetValidator} = require("../validator")
const {purchaseHistory,update,read,deleteUser,allUsers,list} = require("../controlers/user")



router.get("/read/:userId",requireSignin,isAuth,read);
router.put("/update/:userId",requireSignin,isAuth,userSignupValidator,update);
router.get('/by/user/:userId', requireSignin, isAuth, purchaseHistory);
router.put('/block/:userId/:target', requireSignin,isAuth,isAdmin,block);
router.put('/unblock/:userId/:target' ,requireSignin,isAuth,isAdmin,unblock);
router.get("/users/:userId", requireSignin,isAuth,isAdmin,allUsers);
router.delete("/user/:userId/:target", requireSignin, isAuth,isAdmin, deleteUser);
router.get('/list/:userId',requireSignin, isAuth,isAdmin ,list);
router.get('/history/:userId',requireSignin, isAuth ,purchaseHistory);

router.get("/hello/:userId",requireSignin,isAdmin,(req,res) => {
    res.send("hello form the other side");
});
router.param("target" ,userBytarget);
router.param("userId" ,userById);
module.exports = router;

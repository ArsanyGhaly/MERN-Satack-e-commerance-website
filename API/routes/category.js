const express = require("express");
const router = express.Router();

const {addNew, categoryById, read, update, remove, list,image} = require("../controlers/category");
const {requireSignin , isAuth , isAdmin} = require("../controlers/auth");
const {userById}      = require("../controlers/auth");


router.post("/createNew/:userId",requireSignin,isAuth,isAdmin,addNew);
router.get('/read/:categoryId', read);
router.put('/update/:categoryId/:userId', requireSignin, isAuth, isAdmin, update);
router.delete('/remove/:categoryId/:userId', requireSignin, isAuth, isAdmin, remove);
router.get('/list', list);

router.param("userId" ,userById);
router.param("categoryId" ,categoryById);
router.get("/image/:categoryId", image);
module.exports = router;

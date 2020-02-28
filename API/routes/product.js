const express = require("express");
const router = express.Router();

const {addNew, productById,read,remove,
  update,list,comment,uncomment,listSearch,related,byCategory,
like,unlike,  listCategories,listBySearch,image,discountPercent} = require("../controlers/product");
const {requireSignin , isAuth , isAdmin} = require("../controlers/auth");
const {userById}      = require("../controlers/auth");
const {categoryById}  = require("../controlers/category")
const {productValidator} = require("../validator")
router.post("/createNew/:userId",requireSignin,isAuth,isAdmin,addNew);
router.get("/read/:productId",read);
router.get("/list",list);
router.get("/search",listSearch);
router.get("/admin/list/:userId",requireSignin,isAuth,isAdmin,list);
router.get("/product/:categoryId",byCategory);
router.get("/related/:productId",related);
router.get("/categories",listCategories);

router.post("/by/search", listBySearch);
router.get("/image/:productId", image);
router.delete("/delete/:productId/:userId",requireSignin,isAuth,isAdmin,remove);
router.put("/update/:productId/:userId",requireSignin,isAuth,isAdmin,update);
router.put('/discount/:productId/:userId', requireSignin,isAuth,isAdmin,discountPercent);
router.put('/AddComment/:productId/:userId', requireSignin,isAuth,comment);
router.put('/unComment/:productId/:userId', requireSignin,isAuth,uncomment);
router.put('/like/:productId/:userId', requireSignin,isAuth,like);
router.put('/unlike/:productId/:userId', requireSignin,isAuth,unlike);

router.param("userId" ,userById);
router.param("productId" ,productById);
router.param("categoryId" ,categoryById);
module.exports = router;

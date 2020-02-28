const express = require("express");
const router = express.Router();



const {requireSignin , isAuth , isAdmin,userById} = require("../controlers/auth");

const {create,listOrders,getStatusValues,orderById,updateOrderStatus,updateShippingStatus}       = require("../controlers/order");
const {decreaseQuantity} = require("../controlers/product")
const {addOrderToUserHistory} = require("../controlers/user")

router.post("/create/:userId",requireSignin,isAuth,decreaseQuantity,addOrderToUserHistory,create);
router.get("/list/:userId", requireSignin, isAuth, isAdmin, listOrders);
router.get("/status-values/:userId",requireSignin,isAuth,isAdmin,getStatusValues);
router.put("/status/:orderId/:userId",requireSignin,isAuth,isAdmin,updateOrderStatus);
router.put("/addShipping/:orderId/:userId",requireSignin,isAuth,isAdmin,updateShippingStatus);


router.param("userId", userById);
router.param("orderId", orderById);

module.exports = router;

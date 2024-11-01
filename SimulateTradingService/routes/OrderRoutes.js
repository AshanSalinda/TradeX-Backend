const express = require('express');
const controller = require("../controllers/OrderController");
const router = express.Router();

router.get("/getAllOrders", controller.getAllOrders);

router.get("/getOrderByCoinAndCategory/:coin/:userId/:category", controller.getAllOrdersByCoinAndCategory);

router.get("/getOrderByCato/:type", controller.getAllOrdersByCato);

router.get("/getAllOrdersByIdAndCato/:type/:id", controller.getAllOrdersByIdAndCato);

router.post("/", controller.saveOrder);

router.delete("/deleteOrder/:orderId", controller.deleteOrder);


module.exports = router
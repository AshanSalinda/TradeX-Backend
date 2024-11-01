const express = require('express');
const controller = require("../controllers/NotificationController");
const router = express.Router();

router.get("/getAll", controller.getAppNotifications);

router.post("/markAsViewed", controller.markAsViewed);

router.post("/send/:type", controller.sendNotification);

router.post("/deviceToken", controller.saveDeviceToken);


module.exports = router
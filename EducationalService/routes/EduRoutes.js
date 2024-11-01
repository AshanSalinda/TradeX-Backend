const express = require('express');
const controller = require("../controllers/EduController");
const router = express.Router();

router.get("/getAllEduResources/:userId", controller.getAllEduResources);

router.get("/getFavEduResources/:userId", controller.getFavEduResources);

router.post("/", controller.saveEduResources);

router.post("/favorite", controller.favorite);


module.exports = router
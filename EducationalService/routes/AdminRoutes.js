const express = require('express');
const controller = require("../controllers/AdminController");
const router = express.Router();

router.post("/addEduResources", controller.addEduResources);

router.delete('/deleteEduResources/:id', controller.deleteEduResources);

module.exports = router

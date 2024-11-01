const express = require('express');
const controller = require("../controllers/AdminController");
const router = express.Router();

router.get("/getAllAdmins", controller.getAllAdmins);

router.get("/getEmail/:id", controller.getEmailById);

router.post("/saveAdmin", controller.saveAdmin);

router.post("/login", controller.login);

router.delete("/:id", controller.deleteAdmin);

router.get("/getAdminCount", controller.getAdminCount);


module.exports = router
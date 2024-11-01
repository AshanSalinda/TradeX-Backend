const express = require("express");
const controller = require("../controllers/UserController");
const router = express.Router();

//GET Requests

router.get("/profile", controller.profile);

router.get("/getEmail/:id", controller.getEmailById);

//POST Requests
router.post(
  "/saveUserVerificationDetails",
  controller.saveUserVerificationDetails
);

router.post("/register", controller.register);

router.post("/refreshToken", controller.refreshToken);

router.post("/updateUserVerifyStatus", controller.updateUserVerifyStatus);

router.post("/login", controller.login);

router.post("/logout", controller.logout);

//DELETE Requests
router.delete("/:id", controller.deleteUser);

//PUT Requests
router.put("/updateUserHasTakenQuiz/:id", controller.updateUserHasTakenQuiz);

module.exports = router;

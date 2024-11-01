const express = require("express");
const controller = require("../controllers/AnswerController");
const { route } = require("./ForumRoutes");
const router = express.Router();

router.post("/saveAnswer", controller.saveAnswer);
router.get(
  "/getAnswersByQuestionId/:questionId",
  controller.getAnswersByQuestionId
);

router.get("/getAnswersByUserId/:userId", controller.getAnswersByUserId);

router.put("/addLike/:qid/:uid", controller.addLike);

router.get("/getAnswer/:answerId", controller.getAnswer);

router.put("/updateAnswer/:answerId", controller.updateAnswer);

router.delete("/deleteAnswer/:answerId", controller.deleteAnswer);

module.exports = router;

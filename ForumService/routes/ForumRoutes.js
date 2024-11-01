const express = require("express");
const controller = require("../controllers/ForumController");
const router = express.Router();

router.get("/getAllQuestions", controller.getAllQuestions);

router.get("/getQuestionsByUserId/:userId", controller.getQuestionsByUserId);

router.get(
  "/getQuestionsByQuestionId/:questionId",
  controller.getQuestionsByQuestionId
);
router.post("/", controller.saveQuestion);

router.delete("/:id", controller.deleteQuestion);

//router.put("/addLike/:qid/:uid", controller.addLike);
router.post("/like", controller.like);

router.post("/dislike", controller.dislike);

router.post("/addFavorite", controller.addFavorite);

router.get("/getFavoritesByUserId/:userId", controller.getFavoritesByUserId);

router.post("/addFavorite", controller.addFavorite);

router.post("/userIsLiked", controller.userIsLiked);

router.post("/userIsViewd", controller.userIsViewd);

module.exports = router;

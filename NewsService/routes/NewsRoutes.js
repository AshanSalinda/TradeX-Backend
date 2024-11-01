const express = require('express');
const controller = require("../controllers/NewsController");
const router = express.Router();

router.get("/:userId", controller.getAllNews);

router.get("/fav/:userId", controller.getFavNews);

router.post("/fav/:addToFav(true|false)", controller.addToFav);

router.post("/like", controller.like);

router.post("/dislike", controller.dislike);

router.delete("/:userId/:title", controller.deleteNews);


module.exports = router
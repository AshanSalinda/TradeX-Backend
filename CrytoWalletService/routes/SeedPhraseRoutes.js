const express = require('express');
const SeedPraseController = require("../controllers/SeedPraseController");
const router = express.Router();


router.get("/getUniqueShuffledWords", SeedPraseController.getUniqueShuffledWords);
router.get("/getSeedPhraseByUseName/:userName", SeedPraseController.getSeedPhraseByUseName);
router.get("/getWords", SeedPraseController.getWords);


module.exports = router
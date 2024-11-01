const express = require('express');
const controller = require("../controllers/WalletController");
const generateAddress = require("../controllers/WalletAddress").generateWalletAddress;
const router = express.Router();

router.get("/:walletId", controller.getAllBalances);

router.put("/", controller.transferBalance);

router.post("/", controller.addCapital);

router.post("/generateAddress", generateAddress);



module.exports = router
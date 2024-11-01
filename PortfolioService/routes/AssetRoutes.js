const express = require('express');
const router = express.Router();
const AssetController = require("../controllers/AssetController");


router.get("/:wallet(overview|trading|funding)", AssetController.getPortfolioData);       // get all portfolio data - portfolio

router.get("/:userId/:coin", AssetController.getBalance);       // get balance of coins - trading platform

router.put("/", AssetController.transferAsset);                 // transfer assets between internal wallets - portfolio

router.put("/release", AssetController.releaseAsset);           // release a held asset's balance - trading platform

router.put("/deduct", AssetController.deductAsset);             // deduct after execute a limit order - trading platform

router.post("/trade", AssetController.executeTrade);            // change balances after a trade - trading platform

router.post("/transfer", AssetController.receiveFromEx);        // add after a transaction - external wallet

router.post("/allocate", AssetController.allocateUSD);          // allocate USD to a user - Quiz


module.exports = router
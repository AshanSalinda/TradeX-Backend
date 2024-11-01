const express = require('express');
const WalletHistoryController = require("../controllers/WalletHistoryController");
const router = express.Router();


router.get("/", WalletHistoryController .getWalletHistory );



module.exports = router
const express = require("express");
const cors = require('cors');
const createTriggerFunctions = require('./createTriggerFunctions');
const runScheduledValueUpdaters = require('./scheduler');
const { startGettingMarketPrices } = require('./services/MarketPrices');

const app = express();
const dataSource = require("./config/config");
const assetRouter = require("./routes/AssetRoutes");
const PortfolioValueRouter = require("./routes/PortfolioValueRoutes");
const TransactionHistoryRouter = require("./routes/TransactionHistoryRoutes");
const WalletAddressRouter = require("./routes/WalletAddressRoutes");


app.use(express.json());
app.use(cors());
app.use("/portfolio/asset", assetRouter);
app.use("/portfolio/value", PortfolioValueRouter);
app.use("/portfolio/address", WalletAddressRouter);
app.use("/portfolio/history", TransactionHistoryRouter);

app.use((req, res) => {
    console.log(`${req.originalUrl} Endpoint Not found`);
    res.status(404).json({
        message: `${req.originalUrl} Endpoint Not found`
    });
});

app.use((error, req, res) => {
    console.log("Error :", error);
    res.status(500).json({
        message: error.message
    });
});


dataSource.initialize()

.then(async() => {
    await createTriggerFunctions();
    await startGettingMarketPrices();
    runScheduledValueUpdaters();

    console.log("Database connected!!");

    app.listen(8011, () => {
        console.log("Portfolio Service running on Port 8011");
    })
})

.catch((err) => {
    console.log(err);
})

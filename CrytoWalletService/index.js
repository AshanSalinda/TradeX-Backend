const express = require("express");
const cors = require('cors');
const app = express();
const dataSource = require("./config/config");
const { initEmptyCapitalRemover } = require("./controllers/WalletController");
const walletRouter = require("./routes/WalletRoutes");
const WalletHistoryRounter = require("./routes/WalletHistoryRoutes")
const WalletLoginRounter = require("./routes/WalletLoginRoutes")
const cookieParser = require("cookie-parser")
const SeedPhraseRoutes = require("./routes/SeedPhraseRoutes")
const bodyParser = require('body-parser');

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors( {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true, 
}));
app.use("/wallet", walletRouter);
app.use("/history", WalletHistoryRounter);
app.use("/walletLogin",  WalletLoginRounter);
app.use("/seedPhrase",  SeedPhraseRoutes);





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
    console.log("Database connected!!");
    await initEmptyCapitalRemover();

    app.listen(8006, () => {
        console.log("Crypto Wallet Service Started on Port 8006")

    })
})
.catch((err) => {
    console.log(err)
})
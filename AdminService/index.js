const express = require("express");
const cors = require('cors');
const app = express();
const dataSource = require("./config/config");
const adminRouter = require("./routes/AdminRoutes");

app.use(express.json());
app.use(cors());
app.use("/admin",adminRouter);

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

    .then(() => {
        console.log("Database connected!!");

        app.listen(8003, () => {
            console.log("Admin Service running on Port 8003");
        })
    })

    .catch((err) => {
        console.log(err)
    })
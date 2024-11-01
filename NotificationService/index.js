const express = require("express");
const cors = require('cors');
const http = require('http');
const startRealtimeMonitoring = require("./RealtimeMonitoring");
const { startWebSocketServer } = require("./NotificationServices/WebSocket");
const dataSource = require("./config/config");
const alertRouter = require("./routes/AlertRoutes");
const notificationRouter = require("./routes/NotificationRoutes");
const app = express();


app.use(express.json());
app.use(cors());
app.use("/alert", alertRouter);
app.use("/notification", notificationRouter);

app.use((req, res) => {
    console.log(`${req.originalUrl} Endpoint Not found`);
    res.status(404).json({message: `${req.originalUrl} Endpoint Not found`});
});

app.use((error, req, res) => {
    console.log("Error :", error);
    res.status(500).json({message: error.message});
});


dataSource.initialize()

.then(() =>{
    console.log("Database connected!!");
    const server = http.createServer(app);
    startWebSocketServer(server);
    startRealtimeMonitoring();

    server.listen(8002, () => {
        console.log("Alert Service running on Port 8002");
    })
})

.catch((err) => {
    console.log(err);
});
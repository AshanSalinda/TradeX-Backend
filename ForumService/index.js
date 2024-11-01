const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const dataSource = require("./config/config");
const forumRouter = require("./routes/ForumRoutes");
const answerRouter = require("./routes/AnswerRoutes");
const { webSocketStart } = require("./controllers/ForumController");

app.use(express.json());
app.use(cors());
app.use("/forum", forumRouter);

// Mount the answer router at the "/answers" endpoint
app.use("/answers", answerRouter);

//adding socket.io configuration
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { Socket } = require("dgram");
const io = new Server(server);

// Handle 404 errors
app.use((req, res) => {
  console.log(`${req.originalUrl} Endpoint Not found`);
  res.status(404).json({
    message: `${req.originalUrl} Endpoint Not found`,
  });
});

// Error handling middleware
app.use((error, req, res) => {
  console.log("Error :", error);
  res.status(500).json({
    message: error.message,
  });
});
io.on("connection", (socket) => {
  console.log("a user connection", socket.id);
});

exports.io = io;

const PORT = 8010;

dataSource
  .initialize()
  .then(() => {
    console.log("Database connected!!");
    webSocketStart();
    server.listen(PORT, () => {
      console.log(`User Service running on Port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

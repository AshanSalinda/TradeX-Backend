const express = require("express");
const cors = require("cors");
const app = express();
const dataSource = require("./config/config");
const userRouter = require("./routes/UserRoutes");
const adminRouter = require("./routes/AdminRoutes");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const { refreshToken } = require("./controllers/UserController");
const bodyParser = require("body-parser");

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

app.use(bodyParser.json());
app.use(cookieParser());
app.use("/user", userRouter);
app.use("/admin", adminRouter);

// Handle 404 errors
app.use((req, res) => {
  console.log(`${req.originalUrl} Endpoint Not found`);
  res.status(404).json({
    message: `${req.originalUrl} Endpoint Not found`,
  });
});

app.use((error, req, res) => {
  console.log("Error :", error);
  res.status(500).json({
    message: error.message,
  });
});

dataSource
  .initialize()

  .then(() => {
    console.log("Database connected!!");

    app.listen(8004, () => {
      console.log("User Service running on Port 8004");
    });
  })

  .catch((err) => {
    console.log(err);
  });

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const user_router = require("../routes/user.routes");
const article_route = require("../routes/article.route");
const comment_route = require("../routes/comment.routes");
const notification_route = require("../routes/notifications");
const like_route = require("../routes/like.route");
const share_route = require("../routes/share");
const pin_article = require("../routes/pin");
const PORT = process.env.PORT || 8080;

const app = express();

// middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.use("/api/user", user_router);
app.use("/article", article_route);
app.use("/comment", comment_route);
app.use("/notification", notification_route);
app.use("/like", like_route);
app.use("/share", share_route);
app.use("/pin", pin_article);

// connect to the database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected");

    // server config
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}...`);
    });
  })
  .catch((error) => {
    // console.log("DB disconnected");
    console.log(error);
  });

const express = require("express");
const path = require("path");
const schedule = require("node-schedule");

const app = express();

const adminRoute = require("./routes/admin");
const dashRoute = require("./routes/dashboard");
const websiteRoute = require("./routes/website");
const db = require("./models");

const websiteController = require("./controller/website");
const { checkUsersWhoDontHavePurchase } = require("./controller/checkuser");
const scheduleTasks = require("./scheduleTasks/reminderMail");

const port = process.env.PORT;

app.use("/webhook", express.raw({ type: "application/json" }), websiteController.stripeWebhook);

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization, x-access-token, , X-localization");
  next();
});

app.use("/admin", adminRoute);
app.use("/dashboard", dashRoute);
app.use("/", websiteRoute);

// scheduleTasks();

db.sequelize
  .sync({ alter: true })
  // .authenticate()
  .then(async (result) => {
    app.listen(port, () => {
      console.log(`TP Backend listens to ${port}`);
    });
  })
  .catch((err) => {
    console.log(err.toString());
  });

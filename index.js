const express = require("express");
const app = express();
const DBConnection = require("./dbConnect");
const cors = require("cors");
const dotenv = require("dotenv");
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cors());
dotenv.config("./.env");
DBConnection();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  return res.status(200).send({
    success: true,
    message: "Welcome to Homepage",
  });
});

app.use(
  "/api/v1",
  require("./routes/UserRoute"),
  require("./routes/JobCategoriesRoute"),
  require("./routes/JobsRoute"),
  require("./routes/ApplyForJob"),
  require("./routes/Counters")
);

app.listen(PORT, () => {
  console.log("App is running on port: http://localhost:" + PORT);
});

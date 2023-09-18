const mongoose = require("mongoose");
const URI =
  "mongodb+srv://testuser0980:4CVBBtKZ5vgwzv7I@cluster0.w3nyd03.mongodb.net/axiomJobPortal?retryWrites=true&w=majority";

const ConnectToDB = () => {
  mongoose.connect(URI, () => {
    console.log("Database connected successfully");
  });
};
module.exports = ConnectToDB;

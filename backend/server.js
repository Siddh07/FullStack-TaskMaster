const express = require("express"); // importing express

const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config(); //loading env file  so that we can use the variables defined in it

const app = express(); // we call the express function independtly for app

app.use(cors()); // allow frontend to talk backend
app.use(express.json()); // parse JSON from client into JavaScript object
app.use(express.urlencoded({ extended: true })); // allow us to send data in url

app.get("/", (req, res) => {
  res.json({ message: "server is running!" });
});

const PORT = process.env.PORT || 5000; // here we set the default port number

app.listen(PORT, () => {
  //start the server on port 5000
  console.log(`server is running on port ${PORT}`);
});

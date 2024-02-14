require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const db = require("./models");
const socketIO = require("./socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server); // Initializes socket.io with server

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("io", io); // Make io instance available to routes

require("./routes/tank.routes")(app);
require("./routes/client.routes")(app);
require("./routes/supplier.routes")(app);
require("./routes/eventLog.routes")(app);

port = process.env.PORT;
server.listen(port, () => {
  console.log(`Listening at port ${port}`);
});

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const registerLobbyHandlers = require("./handlers/lobby-handlers");
const registerGameHandlers = require("./handlers/game-handlers");

const publicPath = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

io.on("connect", (socket) => {
  registerLobbyHandlers(io, socket);
  registerGameHandlers(io, socket);
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}.`)
});
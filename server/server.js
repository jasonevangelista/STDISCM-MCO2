const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const { Game } = require('./models/game');
const { Player } = require('./models/player');

const publicPath = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

server.listen(port, ()=> {
  console.log(`Server is up on port ${port}.`)
});

io.on('connection', (socket) => {
  let game = Game.getInstance();

  /*
   * Populate socket with player info if they are already part of a lobby; otherwise, socket.player = undefined.
   * If player already exists, joins a room using the game id. The first argument to the event is always 
   * treated as a cookie
   */
  socket.use(([event, ...args], next) => {
    let cookie = args && args[0];
    if(!socket.player && cookie){
      socket.player = game.getPlayerBySessionId(cookie.sessionId);
      if(socket.player){
        socket.join(game.id);
      }
    }
    next();
  });

  socket.on('enterLobby', (cookie, userData, callback) => {
    if(socket.player){
      socket.emit("updatePlayerList", game.getPlayerList());
      if(game.state === Game.ONGOING_STATE){
        socket.emit("startGame");
      }
      callback({
        success: false,
        message: "You already have joined the lobby with the username: " + socket.player.username
      });
      return;
    }

    try{
      let player = new Player(userData.username);
      game.addPlayer(player);
      socket.player = player
      socket.join(game.id);

      console.log("New player joined: ");
      console.log(socket.player);
      console.log("");

      io.to(game.id).emit("updatePlayerList", game.getPlayerList());
      callback({
        success: true,
        sessionId: socket.player.sessionId,
      });
    }catch(e){
      callback({
        success: false,
        message: e.message
      });
    }
  });

  socket.on('toggleReady', () => {
    if(!socket.player){
      return;
    }

    // update player ready status
    socket.player.toggleReady();
    
    // check ready status of all players
    let startGame = game.checkStartGameStatus();
    
    io.to(game.id).emit('updatePlayerList', game.getPlayerList());
    if(startGame){
      console.log("Starting game...")
      io.to(game.id).emit('startGame');
    }
  });

});

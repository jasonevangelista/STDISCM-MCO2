const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

var playerList = [];

app.use(express.static(publicPath));

server.listen(port, ()=> {
  console.log(`Server is up on port ${port}.`)
});

io.on('connection', (socket) => {
  console.log('A user just connected: ', socket.id);

  socket.on('disconnect', () => {
    console.log('A user has disconnected: ', socket.id);
    // remove disconnected player from playerList
    playerList = playerList.filter(a => a.userId !== socket.id);
    io.emit('updatePlayerList', playerList);

    // check ready status of remaining players
    startGameStatus = checkStartGameStatus(playerList);
    io.emit('startGameStatus', startGameStatus);
  })

  socket.on('enterLobby', (userData) => {
    //check if username is unique to other players
    if(checkUniqueUsername(playerList, userData.username)){
      // append user object to player list
      playerList.push(userData);
      io.to(userData.userId).emit('successfulJoin');
      io.emit('updatePlayerList', playerList);
    }
    else{
      io.to(userData.userId).emit('unsuccessfulJoin');
    }
  });

  socket.on('toggleReady', () => {
    // update player ready status
    index = playerList.findIndex(a => a.userId == socket.id);
    playerList[index].readyStatus = !playerList[index].readyStatus;
    
    // check ready status of all players
    startGameStatus = checkStartGameStatus(playerList);
    
    io.emit('updatePlayerList', playerList);
    io.emit('startGameStatus', startGameStatus);
  });

});

function checkUniqueUsername(playerList, username){
  // check if username is unique from other players
  for(let i = 0; i < playerList.length; i++){
    if (playerList[i].username == username){
      return false;
    }
  }

  return true
}
function checkStartGameStatus(playerList){
  var readyCount = 0;
  // check ready status of all players
  for(let i = 0; i < playerList.length; i++){
    if (playerList[i].readyStatus == true){
      readyCount++;
    }
  }
  // return true if all players are ready and more than 1 player is in lobby
  if(readyCount > 1 && readyCount == playerList.length){
    return true;
  }
  return false;
}

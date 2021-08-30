const { Game} = require("../models/game");
const { Player, InvalidPlayerError } = require("../models/player");

module.exports = (io, socket) => {

  /**
   * Event handler for "enterLobby". Adds a new player to the game with the specified username. Emits 
   * "updatePlayerList" to all sockets in the game room when new player is successfully added
   * 
   * @param {string} username
   * @param {function} callback Invoked with the result of the handler.
   */
  const enterLobby = (username, callback) => {
    try{
      if(typeof callback != "function" || socket.player){
        return;
      }

      let game = Game.getInstance();
      let player = new Player(username, socket.id);
      game.addPlayer(player);

      console.log(`Player joined: {username: "${player.username}", id:"${player.id}"}`);

      socket.player = player;
      socket.join(game.id);

      io.to(game.id).emit("updatePlayerList", game.getPlayerList());
      callback({success: true});
    }catch(e){
      if(e instanceof InvalidPlayerError){
        callback({success: false, message: e.message});
      }else{
        callback({success: false, message: "Unknown error encountered."});
      }
    }
  }

  /**
   * Event handler for socket disconnect. If the socket is part of a game lobby, remove player from lobby and 
   * emit "updatePlayerList" to all sockets in the game room
   */
  const disconnect = () => {
    if(socket.player){
      console.log(`Player left: {username: "${socket.player.username}", id:"${socket.player.id}"}`);
      let game = Game.getInstance();
      game.removePlayer(socket.player);
      io.to(game.id).emit("updatePlayerList", game.getPlayerList());
    }
  }

  /**
   * Event handler for "toggleReady". Changes the ready state of the player associated with the socket. 
   * Emits "updatePlayerList" to all sockets in the game room once the player state is updated. 
   * Starts the game if it is ready to be started
   */
  const toggleReady = () => {
    if(!socket.player) return;

    let game = Game.getInstance();

    socket.player.toggleReady();
    console.log(`{username: "${socket.player.username}", id:"${socket.player.id}"} update ready status: ${socket.player.readyStatus}`);

    let startGame = game.checkStartGameStatus();
    
    io.to(game.id).emit('updatePlayerList', game.getPlayerList());
    if(startGame){
      game.start(io);
    }
  }

  /**
   * Event handler for "getPlayerList". Simply emits an "updatePlayerList" to the socket with the list of 
   * players currently in the game
   */
  const getPlayerList = () => {
    if(socket.player){
      let game = Game.getInstance();
      socket.emit("updatePlayerList", game.getPlayerList());
    }
  }

  socket.on("enterLobby", enterLobby);
  socket.on("disconnect", disconnect);
  socket.on("toggleReady", toggleReady);
  socket.on("getPlayerList", getPlayerList)
}
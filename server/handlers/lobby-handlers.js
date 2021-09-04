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
   * emit "updatePlayerList" to all sockets in the game room.
   * Resets the ready status for all players when disconnect is from lobby.
   */
  const disconnect = () => {
    if(socket.player){
      console.log(`Player left: {username: "${socket.player.username}", id:"${socket.player.id}"}`);
      let game = Game.getInstance();
      let index = game.removePlayer(socket.player);
      for(let i = 0; i < game._players.length; i++){
        game._players[i]._readyStatus = false;
      }
      game._playersToRemove.push(index);
      game.removeHand(index);
      io.to(game.id).emit("updatePlayerList", game.getPlayerList());
      if(game._state == "ONGOING"){
        io.to(game.id).emit("getGameStatus", game.getGameStatus());
        let count = 0;
        for(let i = 0; i < game._players.length; i++){
          if (game._players[i]._selectedCard){
            count++;
          }
        }
        if(count == game._players.length){
          // perform finishAllPlayersTurns (from game-handlers)

          for(let i = 0; i < game._players.length; i++){
            // update hands in current round to reflect the removed card from selection
            game._handsCurrentRound[i] = game._players[i]._currentHand;
            // reveal selected card
            game._players[i].revealCard();
          }
      
          // swap hands
          game._handsCurrentRound = game.swapHands(game._handsCurrentRound);
      
          // update all players hands after swap
          for(let i = 0; i < game._players.length; i++){
            game._players[i]._currentHand = game._handsCurrentRound[i];
          }
      
          // if only 1 card remaining in hand, automatically assign that card to corresponding player and move on to next round (if applicable)
          let scores = game.nextRound();
      
          if(scores){
            // If round ends, update clients withs cores
            io.to(game.id).emit("updateScore", {round: game._currentRound - 1, score: scores});
            if(game._currentRound == 4){
              game._winner = game.determineWinner();
              game.end(io);
              return;
            }
          }
      
          // Inform clients of the updated game status
          io.to(game.id).emit("updateGameStatus", game.getGameStatus());
      
          // Inform each player about their new hand after swap or in the next round
          for(let i=0; i<game._players.length; ++i){
            let player = game._players[i];
            io.to(player.id).emit("updateHand", player._currentHand);
          }
        }
      }
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
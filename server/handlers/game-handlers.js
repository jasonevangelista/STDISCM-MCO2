const { Game} = require("../models/game");
const { Player } = require("../models/player");

module.exports = (io, socket) => {

  /**
   * Event handler for "finishTurn". Updates list of selected cards of user and checks if turn is finished.
   * @param {int} cardId Selected card ID of player.
   */
  const finishTurn = (cardId) => {
    let game = Game.getInstance();
    let allPlayersFinished = true;
    if (socket.player && socket.player.selectCard(cardId)){
      console.log(`Player {username: "${socket.player.username}", id:"${socket.player.id}"} played card ${cardId}`);
      io.to(game.id).emit("playCard", socket.player.id);
      // after selecting card, check if all other players have finished selecting
      for(let i = 0; i < game._players.length; i++){
        if (!game._players[i]._selectedCard){
          allPlayersFinished = false;
        }
      }

      if(allPlayersFinished){
        // reset countdown timer when all players have finished turn
        clearInterval(game._intervalId);
        game._ongoingCountdown = false;


        finishAllPlayersTurns();
      }
    }
  }

  const finishAllPlayersTurns = () => {
    let game = Game.getInstance();
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
      io.to(game.id).emit("updateScore", scores);
      if(game._currentRound == 4){
        game._winner = game.determineWinner();
        game.end(io);
        return;
      }
    }
    // restart timer for next turn
    startCountdown();
  
    // Inform clients of the updated game status
    io.to(game.id).emit("updateGameStatus", game.getGameStatus());

    // Inform each player about their new hand after swap or in the next round
    for(let i=0; i<game._players.length; ++i){
      let player = game._players[i];
      io.to(player.id).emit("updateHand", player._currentHand);
    }
  }

  /**
   * Emits an "updateGameStatus" event to the requesting socket with information about the game status
   */
  const getGameStatus = () => {
    let game = Game.getInstance();
    if(socket.player && game.state == Game.ONGOING_STATE){
      let game = Game.getInstance();
      socket.emit("updateGameStatus", game.getGameStatus());
    }
  }

  /**
   * Emits an "updateHand" event to the requesting socket with the player's latest hand
   */
  const getHand = () => {
    if(socket.player){
      socket.emit("updateHand", socket.player.hand);
    }
  }

  /**
   * Emits an "updateScore" event to the requesting socket with the current score of the game
   */
  const getScore = () => {
    let game = Game.getInstance();
    if(socket.player && game.state == Game.ONGOING_STATE){
      socket.emit("updateScore", game.getCurrentScores());
    }
  }

  /**
   * Emits the current value for the countdown timer to the player
   */
  const startCountdown = () => {
    let game = Game.getInstance();

    let countdown = game._countdownTime;
    if(!game._ongoingCountdown && game.state == Game.ONGOING_STATE){
      game._ongoingCountdown = true;
      console.log("countdown starting...");
      game._intervalId = setInterval(function () {
      
      countdown--;
      io.to(game.id).emit("updateCountdown", countdown);
      if(countdown == 0){
        clearInterval(game._intervalId);
        game._ongoingCountdown = false;
        // select random card for player
        selectCardForUsers(game);

      }
      console.log(countdown);
    }, 1000)
    }
    
  }

  /**
   * selects a random card for the users without a current selection
   * @param {Object} game current Game instance 
   */
  const selectCardForUsers = (game) => {
    let noActionFound = false;
      for(let i = 0; i < game._players.length; i++){
        if (!game._players[i]._selectedCard){
          noActionFound = true;
          let randomCard = game._players[i]._currentHand[Math.floor(Math.random()*game._players[i]._currentHand.length)];
          game._players[i].selectCard(randomCard);
          io.to(game.id).emit("playCard", game._players[i].id);
        }
      }
      if(noActionFound){
        finishAllPlayersTurns();
      }
  }

  socket.on("finishTurn", finishTurn);
  socket.on("getGameStatus", getGameStatus);
  socket.on("getHand", getHand);
  socket.on("startCountdown", startCountdown);
  socket.on("getScore", getScore);
}
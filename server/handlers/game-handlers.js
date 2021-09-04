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
      io.to(game.id).emit("playCard", socket.player.id);
      // after selecting card, check if all other players have finished selecting
      for(let i = 0; i < game._players.length; i++){
        if (!game._players[i]._selectedCard){
          allPlayersFinished = false;
        }
      }

      if(allPlayersFinished){
        // for(let i = 0; i < game._players.length; i++){
        //   // update hands in current round to reflect the removed card from selection
        //   game._handsCurrentRound[i] = game._players[i]._currentHand;
        //   // reveal selected card
        //   game._players[i].revealCard();
        // }

        // // swap hands
        // game._handsCurrentRound = game.swapHands(game._handsCurrentRound);

        // // update all players hands after swap
        // for(let i = 0; i < game._players.length; i++){
        //   game._players[i]._currentHand = game._handsCurrentRound[i];
        // }

        // // if only 1 card remaining in hand, automatically assign that card to corresponding player and move on to next round (if applicable)
        // let scores = game.nextRound();

        // if(scores){
        //   // If round ends, update clients withs cores
        //   io.to(game.id).emit("updateScore", {round: game._currentRound - 1, score: scores});
        //   if(game._currentRound == 4){
        //     game._winner = game.determineWinner();
        //     game.end(io);
        //     return;
        //   }
        // }

        // // Inform clients of the updated game status
        // io.to(game.id).emit("updateGameStatus", game.getGameStatus());

        // // Inform each player about their new hand after swap or in the next round
        // for(let i=0; i<game._players.length; ++i){
        //   let player = game._players[i];
        //   io.to(player.id).emit("updateHand", player._currentHand);
        // }
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

  /**
   * Emits an "updateGameStatus" event to the requesting socket with information about the game status
   */
  const getGameStatus = () => {
    if(socket.player){
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

  socket.on("finishTurn", finishTurn);
  socket.on("getGameStatus", getGameStatus);
  socket.on("getHand", getHand);
}
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

    if (socket.player.selectCard(cardId)){
      
      // after selecting card, check if all other players have finished selecting
      for(let i = 0; i < game._players.length; i++){
        if (!game._players[i]._selectedCard){
          allPlayersFinished = false;
        }
      }

      if(allPlayersFinished){
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
          game._players._currentHand = game._handsCurrentRound[i];
        }

        // if only 1 card remaining in hand, automatically assign that card to corresponding player and move on to next round (if applicable)


      }
    }

  }

  socket.on("finishTurn", finishTurn);
}
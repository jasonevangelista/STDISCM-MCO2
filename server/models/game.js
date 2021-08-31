const { v4: uuidv4 } = require('uuid');
const { Player, InvalidPlayerError } = require("./player");

/**
 * A class representing a game of SushiGo
 */
class Game{
  static _game = null;
  static MAX_PLAYERS = 5;
  static WAITING_STATE = "WAITING"; // The game is currently waiting for other players to join or be ready
  static ONGOING_STATE = "ONGOING"; // A SushiGo game is ongoing

  constructor(){
    this._id = uuidv4();
    this._players = [];
    this._state = Game.WAITING_STATE;
    
    this._cardDeck = [];

    this._handsRound1 = [];
    this._handsRound2 = [];
    this._handsRound3 = [];
  }

  /**
   * @returns {Game} A global game object 
   */
  static getInstance(){
    if(Game._game == null){
      Game._game = new Game();
    }
    return Game._game;
  }

  /**
   * @returns {string} a unique identifier for the game
   */
  get id(){
    return this._id;
  }

  /**
   * @returns {string} The current state of the game (WAITING or ONGOING)
   */
  get state(){
    return this._state;
  }

  /**
   * Adds a new player into the game.
   * @param {Player} player The new player object to add
   * @throws {InvalidPlayerError} When game is already full, a player already has the same username in the game, or
   *                              a game is already ongoing
   */
  addPlayer(player){
    if(this._state == Game.ONGOING_STATE){
      throw new InvalidPlayerError("A game is ongoing")
    }
    for(let i=0; i<this._players.length; ++i){
      if(this._players[i].username == player.username){
        throw new InvalidPlayerError("Username already exists");
      }
    }
    if(this._players.length < Game.MAX_PLAYERS){
      this._players.push(player);
    }else{
      throw new InvalidPlayerError("The game is already full");
    }
  }

  removePlayer(player){
    let index = this._players.indexOf(player);
    if(index > -1){
      this._players.splice(index, 1);
    }
  }

  /**
   * Gets a list of players with their user id, username, and readyState
   * 
   * @returns {Object[]} A list of objects containing public information about each player
   */
  getPlayerList(){
    return this._players.map((player) => {
      return {
        username: player.username,
        id: player.id,
        readyStatus: player.readyStatus
      }
    });
  }

  /**
   * Checks if the game is ready to be started.
   * 
   * @returns {boolean} Whether the game should be started or not
   */
  checkStartGameStatus(){
    let readyCount = 0;
    // check ready status of all players
    for(let i = 0; i < this._players.length; i++){
      if (this._players[i].readyStatus == true){
        readyCount++;
      }
    }
    // return true if all players are ready and more than 1 player is in lobby
    if(readyCount > 1 && readyCount == this._players.length){
      
      return true;
    }
    return false;
  }

  /**
   * Begins a game of sushi code
   * @param {Object} io A Socket.IO server instance for emitting events
   */
  start(io){
    this._state = Game.ONGOING_STATE;
    console.log("Game starting");
    io.to(this.id).emit('startGame');
    //TODO: replace with game logic

    // Generate card deck
    this._cardDeck = this.generateCardDeck();

    // Divide cards into different hands for 3 rounds
    this.generateHands(this._cardDeck, this._players.length);

    // Distribute hands for first round to players

    setTimeout(() => {
      this.end(io);
    }, 3000);
  }

  /**
   * Resets the state of the game and disconnect all sockets in the game lobby. 
   * @param {Object} io A Socket.IO server instance for emitting events
   */
  end(io){
    console.log("Game ending");
    io.to(this.id).disconnectSockets();
    this._state = Game.WAITING_STATE;
    this._players = [];
    this._id = uuidv4();
  }

  /**
   * Generate the card deck for the game
   * @returns {int[]} a list of cards represented by IDs which correspond to the different card types 
   */
  generateCardDeck(){
    /*
      Sushi Card ID representation:
      1 - sashimi
      2 - dumplings
      3 - eel
      4 - tofu
    */
    let cardDeck = [];

    // total card deck == 40
    let numSashimi = 10;
    let numDumplings = 10;
    let numEel = 10;
    let numTofu = 10;

    // generate individual decks per card type
    let deckSashimi = Array(numSashimi).fill(1);
    let deckDumplings = Array(numDumplings).fill(2);
    let deckEel = Array(numEel).fill(3);
    let deckTofu = Array(numTofu).fill(4);

    // concat all decks into main card deck
    cardDeck = deckSashimi.concat(deckDumplings, deckEel, deckTofu);
  
    // shuffle card deck
    cardDeck = this.shuffleCardDeck(cardDeck);

    return cardDeck;
  }

  /**
   * Shuffle card deck (based on Fisher-Yates shuffle algorithm)
   * http://sedition.com/perl/javascript-fy.html
   * @param {int[]} cardDeck list of cards to shuffle
   * @returns {int[]} shuffled card deck
   */
  shuffleCardDeck(cardDeck){
    var currentIndex = cardDeck.length,  randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [cardDeck[currentIndex], cardDeck[randomIndex]] = [cardDeck[randomIndex], cardDeck[currentIndex]];
    }

  return cardDeck;

  }


  /**
   * Splits the card deck into hands for 3 rounds depending on the number of players
   * @param {int[]} cardDeck list of cards to generate hands from
   * @param {int} playerCount number of players in the game
   */
  generateHands(cardDeck, playerCount){
    let cardsPerHand = 0;
    let numberOfRounds = 3;

    let currHand = [];

    let startSlice = 0;
    let endSlice = 0;

    let round1 = [];
    let round2 = [];
    let round3 = [];

    // set cards per hand depending on number of players
    if (playerCount == 2){
      cardsPerHand = 10;
    }
    else if (playerCount == 3){
      cardsPerHand = 9;
    }
    else if (playerCount == 4){
      cardsPerHand = 8;
    }
    else{
      cardsPerHand = 7;
    }

    endSlice = cardsPerHand;

    for(let i = 0; i < numberOfRounds; i++){
      // reshuffle cards per round
      cardDeck = this.shuffleCardDeck(cardDeck);
      // reset slice indexes
      startSlice = 0;
      endSlice = cardsPerHand;

      for(let j = 0; j < playerCount; j++){
        currHand = cardDeck.slice(startSlice, endSlice);
        // update slice indexes
        startSlice = endSlice;
        endSlice += cardsPerHand;

        // push hand to round hands list
        if(i == 0){
          round1.push(currHand);
        }
        else if(i == 1){
          round2.push(currHand);
        }
        else{
          round3.push(currHand);
        }
      }
    }

    // console.log('round1:')
    // console.log(round1);
    // console.log('round2:')
    // console.log(round2);
    // console.log('round3:')
    // console.log(round3);

    this._handsRound1 = round1;
    this._handsRound2 = round2;
    this._handsRound3 = round3;
  }

  /**
   * Computes the scores of all the players
   */
  computeAllPoints(){
    for(let i = 0; i < this._players.length; i++){
      currPlayer = this._players[i];
      this.computeSushiPoints(currPlayer);
    }
  }

  /**
   * Computes the score of a single player
   */
  computeSushiPoints(player){
    let countSashimi = 0;
    let countDumplings = 0;
    let countEel = 0;
    let countTofu = 0;

    // count occurences of different card types
    for(let i = 0; i < player._roundPicks; i++){
      if (player._roundPicks[i] == 1){
        countSashimi++;
      }
      else if (player._roundPicks[i] == 2){
        countDumplings++;
      }
      else if (player._roundPicks[i] == 3){
        countEel++;
      }
      else{
        countTofu++;
      }
    }

    // Sashimi computation
    player._roundScoreSashimi = Math.floor(countSashimi / 3)

    // Dumplings computation
    if (countDumplings == 1){
      player._roundScoreDumplings = 1;
    }
    else if (countDumplings == 2){
      player._roundScoreDumplings = 3;
    }
    else if (countDumplings == 3){
      player._roundScoreDumplings = 6;
    }
    else if (countDumplings == 4){
      player._roundScoreDumplings = 10;
    }
    else if (countDumplings == 5){
      player._roundScoreDumplings = 15;
    }

    // Eel computation
    if (countEel == 1){
      player._roundScoreEel = -3;
    }
    else if (countEel >= 2){
      player._roundScoreEel = 7;
    }

    // Tofu computation
    if (countTofu == 1){
      player._roundScoreTofu = 2;
    }
    else if (countTofu == 2){
      player._roundScoreTofu = 6;
    }
    else if (countTofu >= 3){
      player._roundScoreTofu = 0;
    }

    // compute total round score
    player._currentRoundScore = player._roundScoreSashimi + player._roundScoreDumplings + player._roundScoreEel + player._roundScoreTofu;

    // append current round score to total overall score
    player._totalScore += player._currentRoundScore;
  }
}

module.exports.Game = Game;
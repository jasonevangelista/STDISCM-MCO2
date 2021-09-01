const { v4: uuidv4 } = require('uuid');

/**
 * Class that represents a player in a SushiGo game
 */
class Player {

  /**
   * Creates a player object with the given username. Randomly assigns a private session id and a public user 
   * id
   * 
   * @param {string} username The unique user name of the user
   * @param {string} id A unique string identifier for the user
   * @throws {InvalidPlayerError} When the username is empty, null, or undefined
   */
  constructor(username, id){
    username = username != undefined ? String(username).trim(): "";
    if(username == ""){
      throw new InvalidPlayerError("Username is required.");
    }
    this._id = id;
    this._username = username;
    this._readyStatus = false;

    // current list of cards to choose from
    this._currentHand = [];

    this._selectedCard = null; // The player's selected card for the current turn

    // list of cards picked for current round
    this._roundPicks = [];

    // individual scores for the per-round breakdown
    this._roundScoreSashimi = 0;
    this._roundScoreDumplings = 0;
    this._roundScoreEel = 0;
    this._roundScoreTofu = 0;

    // total scores for current round and overall
    this._currentRoundScore = 0;
    this._totalScore = 0;
  }

  /**
   * @returns {string} The unique username of the user
   */
  get username(){
    return this._username;
  }

  /**
   * @return {strings} A unique public identifier
   */
  get id(){
    return this._id;
  }

  /**
   * @returns {boolean} Whether the user is ready or not
   */
  get readyStatus(){
    return this._readyStatus;
  }

  get hand(){
    return this._currentHand.map((x) => x);
  }

  toggleReady(){
    this._readyStatus = !this._readyStatus;
  }

  /**
   * Selects a card from the current hand of the player and places it into list of cards picked for the 
   * current round. Performs no operation if the card does not exist in the current hand or if the player has 
   * already picked a card in the current turn
   * 
   * @param {number} cardId The id of the card to play
   * @return {boolean} Whether a card was sucessfully played.
   */
  selectCard(cardId){
    if(!this._selectedCard){
      let index = this._currentHand.indexOf(cardId);
      if(index > -1){
        this._currentHand.splice(index, 1);
        this._selectedCard = cardId;
        return true;
      } 
    }
    return false;
  }

  /**
   * Places the selected card of the player for the current turn into the list of the player's picked cards for 
   * the round, which will be visiable to other players
   */
  revealCard(){
    if(this._selectedCard){
      this._roundPicks.push(this._selectedCard);
      this._selectedCard = null;
    }
  }
}



class InvalidPlayerError extends Error {
  constructor(message){
    super(message);
    this.name = this.constructor.name;
  }
}

module.exports.Player = Player;
module.exports.InvalidPlayerError = InvalidPlayerError;


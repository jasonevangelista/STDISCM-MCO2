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

  toggleReady(){
    this._readyStatus = !this._readyStatus;
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


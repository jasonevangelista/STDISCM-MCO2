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
   */
	constructor(username){
		this._sessionId = uuidv4();
		this._userId = uuidv4();
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
	get userId(){
		return this._userId;
	}

  /**
   * @returns {string} a unique private identifier
   */
	get sessionId(){
		return this._sessionId;
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

module.exports.Player = Player;


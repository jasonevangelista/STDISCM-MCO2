const { v4: uuidv4 } = require('uuid');
const { Player } = require("./player");

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
   * @throws {Error} When game is already full or when a player already has the same username in the game
   */
	addPlayer(player){
		for(let i=0; i<this._players.length; ++i){
			if(this._players[i].username == player.username){
				throw new Error("Username already exists");
			}
		}
		if(this._players.length < Game.MAX_PLAYERS){
			this._players.push(player);
		}else{
			throw new Error("The game is already full");
		}
	}

  /**
   * @param {string} sessionId A player's session id
   * @returns {Player} The player with the session id or undefined if none is found
   */
	getPlayerBySessionId(sessionId){
		return this._players.find((player) => player.sessionId == sessionId);
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
				userId: player.userId,
        readyState: player.readyState
			}
		});
	}

  /**
   * Checks if the game is ready to be started. If so, changes the state of the game object from WAITING to 
   * ONGOING
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
      this._state = Game.ONGOING_STATE;
      return true;
    }
    return false;
  }
}

module.exports.Game = Game;
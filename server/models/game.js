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
}

module.exports.Game = Game;
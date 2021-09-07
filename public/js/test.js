/**
 * For testing purposes. Delete once game is implemented
 */


if(!parent.getSocket){
  window.location.href = "/";
}   

var socket = parent.getSocket();

var mainContentFrame = parent.getMainContentFrame();

var playerRows = document.getElementsByClassName("player-row");
var roundSpan = document.getElementById("round-number");
var handElem = document.getElementById("hand");
var countdown = document.getElementById("countdown");


// Populates a row from the player table with the player's round picks, username, and whether or not they have played a card in the current turn
function populateRow(playerRow, player){
  playerRow.setAttribute("data-id", player.id);
  var usernameTd = playerRow.querySelector(".username");
  var roundPicksTd = playerRow.querySelector(".round-picks");
  var selectedCardTd = playerRow.querySelector(".selected-card");

  usernameTd.innerHTML = player.username + (player.id == socket.id ? " (You) ": "");
  roundPicksTd.innerHTML = player.roundPicks
  selectedCardTd.innerHTML = player.hasSelected;
}

socket.on("updateCountdown", (time) => {
  console.log("countdown updating!")
  countdown.innerText = time;
})


socket.on("updateHand", (hand) => {
  handElem.innerHTML = "";
  for(var i=0; i<hand.length; ++i){
    // Create button representing a card
    var button = document.createElement("button");
    button.setAttribute("class", "card-btn");
    button.innerHTML = hand[i]
    button.setAttribute("data-card-id", hand[i]);
    // When user clicks on a card, emit finishTurn event to the server
    button.addEventListener("click", (event) => {
      socket.emit("finishTurn", Number(event.srcElement.getAttribute("data-card-id")));
      var buttons = document.getElementsByClassName("card-btn");
      // Disable other button cards once user has chosen card for current turn
      for(var i=0; i<buttons.length; ++i){
        buttons[i].disabled = true;
      }
      event.srcElement.remove();
    });
    handElem.append(button);
  }
  
});

socket.on("playCard", (playerId) => {
  // Update player table to show that a player has selected a card in teh current turn
  var playerTd = document.querySelector(".player-row[data-id=\"" + playerId + "\"]" + ">.selected-card");
  playerTd.innerHTML = true;
});

socket.on("updateGameStatus", (gameStatus) => {
  // Updates the player table based on the latest game status
  roundSpan.innerHTML = gameStatus.round;
  var players = gameStatus.players;
  for(var i = 0; i<playerRows.length; ++i){
    var player = players[i]
    if(player){
      populateRow(playerRows[i], player);
    }else{
      populateRow(playerRows[i], {
        username: "",
        roundPicks: [],
        hasSelected: "",
      });
    }
  }
})



// Get latest game status and hand once js and html has been loaded into the page
socket.emit("getGameStatus");
socket.emit("getHand");
socket.emit("startCountdown");
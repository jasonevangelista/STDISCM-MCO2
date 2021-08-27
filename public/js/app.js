let socket = io();

const lobbyForm = document.getElementById('lobbyForm');
const readyBtn = document.getElementById('btn-ready');
const playerListSection = document.getElementById('player-list-section');

// event listeners

lobbyForm.addEventListener('submit', (values) => {
  // hide entry form
  lobbyForm.style.display = "none";
  // show player list section
  playerListSection.style.display = "block";
  // send new username to server
  values.preventDefault();
  console.log("username: ", values.target.elements.username.value);
  socket.emit('enterLobby',  {
    userId: socket.id,
    username: values.target.elements.username.value,
    readyStatus: false
  });
})

readyBtn.addEventListener('click', () => {
  socket.emit('toggleReady');
})

// socket listeners

socket.on('updatePlayerList', (playerList) => {
  // get updated player list from server
  console.log("Current players:");
  let list = "";
  for(let i = 0; i < playerList.length; i++){
    console.log(playerList[i]);
    list += playerList[i].username + " | ";
  }
  document.getElementById("playerList").innerHTML = list;
})

socket.on('startGameStatus', (startGameStatus) => {
  // get updated start game status from server
  if (startGameStatus){
    console.log("STARTING GAME...");
  }
  else{
    console.log("GAME NOT READY!")
  }
})




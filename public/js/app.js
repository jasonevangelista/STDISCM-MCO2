let socket = io();

const lobbyForm = document.getElementById('lobbyForm');
const readyBtn = document.getElementById('btn-ready');
const playerListSection = document.getElementById('player-list-section');

// event listeners

lobbyForm.addEventListener('submit', (values) => {
  // send new username to server
  values.preventDefault();
  console.log("username: ", values.target.elements.username.value);

  let cookie = { sessionId: Cookies.get("sessionId") }

  let callback = (res) => {
    console.log(res.success);
    if(res.success){
      Cookies.set("sessionId", res.sessionId);
    }else{
      alert(res.message);
    }
  }

  socket.emit('enterLobby',  cookie, {
    username: values.target.elements.username.value,
  }, callback);
})

readyBtn.addEventListener('click', () => {
  let cookie = { sessionId: Cookies.get("sessionId") }
  socket.emit('toggleReady', cookie);
})

socket.on('updatePlayerList', (playerList) => {
  // hide entry form
  lobbyForm.style.display = "none";
  // show player list section
  playerListSection.style.display = "block";
  // get updated player list from server
  console.log("Current players:");
  let list = "";
  for(let i = 0; i < playerList.length; i++){
    console.log(playerList[i]);
    list += playerList[i].username + " | ";
  }
  document.getElementById("playerList").innerHTML = list;
})

socket.on('startGame', () => {
  document.body.innerHTML = "<p>Game has started</p>"
})




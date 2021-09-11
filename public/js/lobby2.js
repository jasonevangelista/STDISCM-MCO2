if(!parent.getSocket){
  window.location.href = "/";
}

var socket = parent.getSocket();
var mainContentFrame = parent.getMainContentFrame();

var playerElems = document.getElementsByClassName("player");
var readyBtn = document.getElementById("ready_button");
var leaveBtn = document.getElementById("leave_button");


/**
 * Updates the webpage to include the players in the arguments
 * 
 * @param {Object[]} playerList A list of objects of the form {username, readyStatus, id}
 */
function updatePlayerList(playerList){
  for(var i=0; i<playerElems.length; ++i){
    var player = playerList[i];
    var playerNameElem = playerElems[i].getElementsByClassName("Player_Name")[0];
    var readyElem = playerElems[i].getElementsByClassName("is_Ready")[0];

    if(!player){
      playerNameElem.innerHTML = "";
      readyElem.style["background-color"] = "var(--color-noplayer)";
      readyElem.innerHTML = "Waiting";
    }else{
      playerNameElem.innerHTML = player.username;
      readyElem.style["background-color"] = player.readyStatus ? "" : "var(--color-error)";
      readyElem.innerHTML = player.readyStatus ? "Ready!" : "Not Ready";

      if(player.id == socket.id){
        readyBtn.style["background-color"] = player.readyStatus ? "var(--color-error)": "var(--color-primary)";
        readyBtn.innerHTML = player.readyStatus ? "Not Ready": "Ready"; 
      }
    }
  }
}

socket.on("updatePlayerList", function(playerList){
  updatePlayerList(playerList);
});

socket.on("startGame", function(){
  socket.off("updatePlayerList");
  socket.off("disconnect");
  mainContentFrame.setAttribute("src", "/InGame.html");
});

socket.on("disconnect", () => {
  window.top.location.reload();
});

readyBtn.addEventListener("click", function(event){
  socket.emit("toggleReady");
});

leaveBtn.addEventListener("click", function(event){
  socket.disconnect();
})

socket.emit("getPlayerList");

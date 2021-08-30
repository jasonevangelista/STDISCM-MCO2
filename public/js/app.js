const socket = io();

const mainConentFrame = document.getElementById("main-content");

function getSocket(){
  return socket;
}

function getMainContentFrame(){
  return mainConentFrame;
}

socket.on("disconnect", () => {
  location.reload();
});


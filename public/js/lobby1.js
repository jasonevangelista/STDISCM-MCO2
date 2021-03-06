if(!parent.getSocket){
  window.location.href = "/";
}

var socket = parent.getSocket();


var joinForm = document.getElementById("Login");
var confirmBtn = document.getElementById("confirm-button");

joinForm.addEventListener("submit", function(event){
  event.preventDefault();
  var username = event.target.elements.username.value;
  if(username){
    confirmBtn.innerHTML = "Joining...";
    confirmBtn.disabled = true;
    confirmBtn.style["background-color"] = "var(--color-noplayer)";
    confirmBtn.style["border-color"] = "var(--color-noplayer)";
    socket.emit("enterLobby", username, (res) => {
      if(res.success){
        var mainContentFrame = parent.document.getElementById(window.name);
        mainContentFrame.setAttribute("src", "/GameLobby2.html");
      }else{
        alert(res.message);
        confirmBtn.innerHTML = "Confirm";
        confirmBtn.disabled = false;
        confirmBtn.style["background-color"] = "var(--color-primary-dark)";
        confirmBtn.style["border-color"] = "var(--color-primary-dark)";
      }
    })
  }else{
    alert("Please enter a username.");
  }
});


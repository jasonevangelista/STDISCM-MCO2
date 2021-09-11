if(window.location === window.parent.location || !parent.getSocket){
    window.location.href = "/";
}

var socket = parent.getSocket();
var mainContentFrame = parent.document.getElementById(window.name);

var handDiv = document.querySelector(".deck.deck-personal");
var playerTableDivs = document.getElementsByClassName("player-table-opponent");
var personalPlayerTableDiv = document.getElementById("player-table-personal");
var timerSpan = document.getElementById("timer");

var roundDiv = document.getElementById("round-counter");
var playCardButton = document.getElementById("play-card-button");


var actionTextDiv = document.getElementById("action-text");
var actionTextDivTextNode = document.createTextNode("You must play a card: ");
actionTextDiv.prepend(actionTextDivTextNode);


var viewStandingsButton = document.getElementById("view-standings-button");

var standingsModalDiv = document.getElementById("standings-modal");
var standingsModalCloserSpan = document.getElementById("standings-modal-closer");

var usernameSpan = document.getElementById("username");

var selectedCard = null;
var playedCard = null;
var currentRound = 1;

/*
    Creates the HTML elements needed for a card based on the card id
    -1 = face down card
    1 = sashimi
    2 = dumpling
    3 = eel
    4 = tofu
*/
function createCard(cardId){
    var outerDiv = document.createElement("div");
    outerDiv.classList.add("card");
    var innerDiv = document.createElement("div");
    innerDiv.classList.add("face");
    innerDiv.setAttribute("data-card-id", cardId);
    switch(cardId){
        case 1:
            innerDiv.classList.add("sashimi");
            break;
        case 2:
            innerDiv.classList.add("dumpling")
            break;
        case 3:
            innerDiv.classList.add("eel");
            break;
        case 4:
            innerDiv.classList.add("tofu");
            break;
        case -1:
            innerDiv.classList.add("face-down")
    }
    outerDiv.appendChild(innerDiv);
    return outerDiv;
}

function updatePlayerTable(playerTableDiv, username, id, cards){
    playerTableDiv.setAttribute("data-player-id", id);

    var playerNameDiv = playerTableDiv.querySelector(".table-player-name");
    playerNameDiv.innerHTML = username;

    var deckDiv = playerTableDiv.querySelector(".deck");
    removeChildren(deckDiv);
    for(var i=0; i<cards.length; ++i){
        deckDiv.appendChild(createCard(cards[i]));
    }
}

function removeChildren(element){
    while(element.firstChild){
        element.removeChild(element.firstChild);
    }
}

function updateHand(hand){
    removeChildren(handDiv);
    playedCard = null;
    actionTextDivTextNode.nodeValue = "You must play a card: ";
    for(var i=0; i<hand.length; ++i){
        var card = createCard(hand[i]);
        card.addEventListener("click", (event) => {
            if(playedCard == null){
                var card = event.currentTarget;
                var face = card.querySelector(".face");
                if(card == selectedCard){
                    face.classList.remove("selected");
                    selectedCard = null;
                    playCardButton.disabled = true;
                }else{
                    if(selectedCard != null){
                        selectedCard.querySelector(".face").classList.remove("selected");
                    }
                    face.classList.add("selected");
                    selectedCard = card;
                    playCardButton.disabled = false;
                }
            }
        });
        handDiv.appendChild(card);
    }
}

function updateGameStatus(gameStatus){
    roundDiv.innerHTML = "Round " + gameStatus.round;
    currentRound = gameStatus.round;
    var players = gameStatus.players;

    for(var i=0; i<players.length; ++i){
        var player = players[i];
        if(player.id == socket.id){
            usernameSpan.innerHTML = player.username;
            updatePlayerTable(personalPlayerTableDiv, "Your Cards", player.id , player.roundPicks);
            if(player.hasPlayed){
                actionTextDivTextNode.nodeValue = "Waiting for opponents: ";
            }else{
                actionTextDivTextNode.nodeValue = "You must play a card: ";
            }
            players.splice(i, 1);
            break;
        }
    }

    for(var i=0; i<playerTableDivs.length; ++i){
        var player = players[i];
        var playerTableDiv = playerTableDivs[i];
        if(player){
            playerTableDiv.style["display"] = "block"
            updatePlayerTable(playerTableDiv, player.username + "'s cards", player.id , player.roundPicks);
            if(player.id == socket.id){
                
            }
        }else{
            playerTableDiv.style["display"] = "none"
            updatePlayerTable(playerTableDiv, "", "" , []);
        }
    }
}

function finishTurn(){
    if(selectedCard != null && playedCard == null){
        playedCard = selectedCard;
        socket.emit("finishTurn", Number(playedCard.querySelector(".face").getAttribute("data-card-id")));
        playCardButton.disabled = true;
        selectedCard.remove();
        selectedCard = null;
        actionTextDivTextNode.nodeValue = "Waiting for opponents: ";
    }
}

function displayStandingsModal(){
    standingsModalDiv.style.display = "flex";
}

function hideStandingsModal(){
    standingsModalDiv.style.display = "none";
}

viewStandingsButton.addEventListener("click", function(){
    displayStandingsModal();
});

standingsModalCloserSpan.addEventListener("click", function(){
    hideStandingsModal();
})

playCardButton.addEventListener("click", function(){
    finishTurn();
});

socket.on("updateGameStatus", function(gameStatus){
    updateGameStatus(gameStatus);
});


socket.on("updateHand", function(hand){
    updateHand(hand);
});

socket.on("updateCountdown", function(countdown){
    timerSpan.innerHTML = countdown + " s";
});

socket.on("playCard", function(playerId){
    var playerTableDiv;
    if(playerId == socket.id){
        playerTableDiv = personalPlayerTableDiv;
    }else{
        playerTableDiv = document.querySelector(".player-table-opponent[data-player-id=\"" + playerId + "\"]");
    }
    var deckDiv = playerTableDiv.querySelector(".deck");
    deckDiv.append(createCard(-1));
});

socket.on("disconnect", function(){
    standingsModalCloserSpan.remove();
    displayStandingsModal();
});



socket.emit("getGameStatus");
socket.emit("getHand");
socket.emit("startCountdown");
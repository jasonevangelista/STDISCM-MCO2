if(!window.top.getSocket){
    window.top.location.href = "/";
}

var standingsPlayerRows = document.getElementsByClassName("standings-player-row");
var continueButton = document.getElementById("continue_button");

var socket = window.top.getSocket();

function clearRow(row){
    var dataElems = row.getElementsByTagName("td");
    for(var i=0; i<dataElems.length; ++i){
        dataElems[i].classList.remove("standings-player--leader");
        dataElems[i].classList.remove("standings-player--non-leader");
        dataElems[i].classList.add("standings-player--no-player");
        if(i != 0){
            dataElems[i].innerHTML = "-";
        }
    }
}

function populateRow(row, player){
    var dataElems = row.getElementsByTagName("td");
    dataElems[1].innerHTML = player.username + (player.id == socket.id ? " (You)": "");
    for(var i=0; i<dataElems.length; ++i){
        dataElems[i].classList.remove("standings-player--no-player");
        dataElems[i].classList.add("standings-player--non-leader");
    }
    for(var i=0; i<player.roundScores.length; ++i){
        if(player.roundScores[i] != null){
            dataElems[2 + i].innerHTML = player.roundScores[i];
        }else{
            dataElems[2 + i].innerHTML = player.roundScores[i];
        }
    }
    dataElems[5].innerHTML = player.totalScore;
}

function highlightRoundLeaders(){
    for(var i=1; i<=3; ++i){
        var dataElems = document.getElementsByClassName("round-score-" + i);
        dataElems = Array.prototype.slice.call(dataElems);
        dataElems.sort(function(td1, td2){
            return Number(td2.innerHTML) - Number(td1.innerHTML);
        });
        var maxScore = Number(dataElems[0].innerHTML);
        for(var j=0; i<dataElems.length; ++j){
            if(Number(dataElems[j].innerHTML) == maxScore){
                dataElems[j].classList.remove("standings-player--non-leader");
                dataElems[j].classList.add("standings-player--leader");
            }else{
                break;
            }
        }
    }
}

function updateStandings(players){
    for(var i=0; i<standingsPlayerRows.length; ++i){
        clearRow(standingsPlayerRows[i]);
        if(players[i] != null){
            populateRow(standingsPlayerRows[i], players[i]);
        }
    }
    highlightRoundLeaders();
}

socket.on("updateScore", updateStandings);

socket.on("disconnect", function(){
    continueButton.style.display = "inline";
});

continueButton.addEventListener("click", function(){
    window.top.location.reload();
});

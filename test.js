  /**
   * Generate the card deck for the game
   * @returns {int[]} a list of cards represented by IDs which correspond to the different card types 
   */
   function generateCardDeck(){
    /*
      Sushi Card ID representation:
      1 - sashimi
      2 - dumplings
      3 - eel
      4 - tofu
    */
    let cardDeck = [];

    // total card deck == 40
    let numSashimi = 10;
    let numDumplings = 10;
    let numEel = 10;
    let numTofu = 10;

    // generate individual decks per card type
    let deckSashimi = Array(numSashimi).fill(1);
    let deckDumplings = Array(numDumplings).fill(2);
    let deckEel = Array(numEel).fill(3);
    let deckTofu = Array(numTofu).fill(4);

    // concat all decks into main card deck
    cardDeck = deckSashimi.concat(deckDumplings, deckEel, deckTofu);
  
    // shuffle card deck
    cardDeck = shuffleCardDeck(cardDeck);

    return cardDeck;
  }

  /**
   * Shuffle card deck (based on Fisher-Yates shuffle algorithm)
   * http://sedition.com/perl/javascript-fy.html
   * @returns {int[]} shuffled card deck
   */
  function shuffleCardDeck(cardDeck){
    var currentIndex = cardDeck.length,  randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [cardDeck[currentIndex], cardDeck[randomIndex]] = [cardDeck[randomIndex], cardDeck[currentIndex]];
    }

  return cardDeck;

  }


   /**
   * Splits the card deck into hands for 3 rounds depending on the number of players
   */
    function generateHands(cardDeck, playerCount){
      let cardsPerHand = 0;
      let numberOfRounds = 3;
  
      let currHand = [];
  
      let startSlice = 0;
      let endSlice = 0;
  
      let round1 = [];
      let round2 = [];
      let round3 = [];
  
      // set cards per hand depending on number of players
      if (playerCount == 2){
        cardsPerHand = 10;
      }
      else if (playerCount == 3){
        cardsPerHand = 9;
      }
      else if (playerCount == 4){
        cardsPerHand = 8;
      }
      else{
        cardsPerHand = 7;
      }
  
      endSlice = cardsPerHand;
  
      for(let i = 0; i < numberOfRounds; i++){
        // reshuffle cards per round
        cardDeck = shuffleCardDeck(cardDeck);
        // reset slice indexes
        startSlice = 0;
        endSlice = cardsPerHand;
        console.log("round ", i+1);
  
        for(let j = 0; j < playerCount; j++){
          currHand = cardDeck.slice(startSlice, endSlice);
          // update slice indexes
          console.log("start slice: ", startSlice);
          console.log("end slice: ", endSlice);
          console.log(" --- ")
          startSlice = endSlice;
          endSlice += cardsPerHand;
  
          if(i == 0){
            round1.push(currHand);
          }
          else if(i == 1){
            round2.push(currHand);
          }
          else{
            round3.push(currHand);
          }
        }
      }
  
      console.log('round1:')
      console.log(round1);
      console.log('round2:')
      console.log(round2);
      console.log('round3:')
      console.log(round3);
  
      // this._handsRound1 = round1;
      // this._handsRound2 = round2;
      // this._handsRound3 = round3;
    }


cardDeck = generateCardDeck();
console.log("card deck generated:")
console.log(cardDeck);

cardDeck = shuffleCardDeck(cardDeck);

// console.log(cardDeck);

generateHands(cardDeck, 5);
import { Bid, Suit } from 'src/@types';
import { Game } from './Game';

const game = new Game();

game.addPlayer();
game.checkGameStart();
game.startGame();
game.setDealer();
game.createDeck();

game.checkIsWinner();
// if (!scores.filter((score) => score > SCORE_TO_WIN))
const currentRound = game.createRound(shuffledDeck);
currentRound.dealHands();
currentRound.sortHands();
currentRound.setActivePlayer(); // if !round.bid setPlayerBid
currentRound.setPlayerBid();
currentRound.validateBids(); // if bids !== players.length setActivePlayer
currentRound.setRoundBid();
currentRound.setTurnOrder();
currentRound.setActivePlayer();
currentRound.setTrump();

// if tricksTaken.length !== CARDS_PER_HAND
const trick = currentRound.createTrick();
currentRound.startPlayerTurn();
currentRound.setPlayableCards();
currentRound.playCard();
currentRound.updateHand();
currentRound.updateCardsPlayed(); // aka updateTrick
// if cardsPlayed !== players.length setActivePlayer

// if cardsPlayed === players.length
currentRound.evaluateTrick();
currentRound.updateTricksTaken();
// repeat const trick = currentRound.createTrick();

// if tricksTaken.length === CARDS_PER_HAND
currentRound.endRound();

game.updateScores();
game.checkIsWinner();


// const round = game.startRound();

game.bid(playerId, bid: Bid)
// game.currentRound().bid();

game.setTrump(playerId, trump: Suit)
// game.currentRound().setTrump();

game.playCard(playerId, card: CardType);
// game.currentRound().currentTrick().playCard();
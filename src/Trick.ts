import { TURN_LENGTH } from './constants/game';
import { Card, Hand, Player, PlayerTurn, Seat, Suit } from './types/index';

export class TrickCl {
  cardsPlayed: Card[];
  activePlayer: Player;
  playerTurn: PlayerTurn;
  trickWinner: Player | null;

  constructor(public players: Player[], public hands: Hand[], public turnOrder: Seat[]) {
    this.players = players;
    this.hands = hands;
    this.turnOrder = turnOrder;
    this.playerTurn = {
      turnNum: 0,
      playableCards: [],
    };
    this.cardsPlayed = [];
    this.activePlayer = players[turnOrder[0]];
    this.trickWinner = null;
  }

  updateActivePlayer() {
    const nextPlayer = this.activePlayer.seat <= this.players.length ? this.activePlayer.seat + 1 : 0;

    this.activePlayer = this.players[nextPlayer];
    return nextPlayer;
  }

  startPlayerTurn(activePlayer: Player, cardsPlayed: Card[]) {
    const hand = [...this.hands[activePlayer.seat]];
    const ledSuit = cardsPlayed[0]?.suit;

    this.setPlayableCards(hand, ledSuit);
    // this.startTurnTimer();
  }

  private setPlayableCards(hand: Card[], ledSuit?: Suit) {
    const playable = ledSuit ? hand.filter((card) => card.suit === ledSuit) : hand;

    this.playerTurn.playableCards = playable;
    return playable;
  }

  playCard(activePlayer: Player, cardPlayed: Card) {
    this.removeCardFromHand(activePlayer, cardPlayed);
    this.updateCardsPlayed(cardPlayed);
    this.endPlayerTurn();
  }

  private removeCardFromHand(activePlayer: Player, cardPlayed: Card) {
    const hand = [...this.hands[activePlayer.seat]];
    const cardIndex = hand.indexOf(cardPlayed);

    hand.slice(cardIndex, cardIndex + 1);

    return hand;
  }

  private updateCardsPlayed(cardPlayed: Card) {
    const played = [...this.cardsPlayed];
    played.push(cardPlayed);

    this.cardsPlayed = played;
    return played;
  }

  endPlayerTurn() {
    this.updateActivePlayer();
    this.resetTurnData();
    if (this.cardsPlayed.length === this.players.length) {
      this.endTrick();
    }
  }

  private resetTurnData() {
    this.playerTurn = {
      turnNum: this.playerTurn.turnNum++,
      playableCards: [],
    };
  }

  // async startTurnTimer() {
  //   const timer = setTimeout(() => {
  //     const cards = this.playerTurn.playableCards;
  //     const randomCard = cards[Math.floor(Math.random() * cards.length)];
  //     this.playCard(this.activePlayer, randomCard);
  //   }, TURN_LENGTH);

  //   function cancelTimer() {
  //     clearTimeout(timer);
  //   }

  //   return cancelTimer;
  // }

  endTrick() {
    this.getTrickWinner();
    const trickData = {
      hands: this.hands,
      trickWinner: this.trickWinner,
    };
    return trickData;
  }

  private getTrickWinner() {
    const trick = this.cardsPlayed;
    const ledSuit = this.cardsPlayed[0].suit;

    const winner = trick.reduce(
      (highCard, card, i): { turn: number; playValue: number } => {
        if (card.suit !== ledSuit && !card.trump) card.playValue = 0;
        return card.playValue > highCard.playValue ? { turn: i, playValue: card.playValue } : highCard;
      },
      { turn: -1, playValue: -1 }
    );

    this.trickWinner = this.players[this.turnOrder[winner.turn]];
    return this.trickWinner;
  }
}

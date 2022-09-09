import { Bid, CardType, Hand, PlayerRoundData, PlayerTurn, PlayerType, Seat, Suit, UserId } from '../@types/index';
import { Cards } from '../Cards/Cards';
import { TRUMP_VALUE } from '../constants/game';

export class Round {
  playerRoundData: PlayerRoundData;
  hands: Hand[] = [];
  bids: Bid[] = [];
  trump: Suit | null = null;
  turnOrder: number[] = [];
  activePlayer: PlayerType = this.players[this.turnOrder[0]];
  playerTurn: PlayerTurn = {
    turnNum: 0,
    playableCards: [],
  };
  cardsPlayed: CardType[] = [];
  tricks: {
    trickPoints: number;
    cardsPlayed: CardType[];
    trickWonBy: PlayerType;
  }[] = [];

  constructor(public players: PlayerType[], dealer: Seat, public endRound: (roundPoints: number[]) => number[]) {
    this.players = players;

    this.playerRoundData = players.map((player, i) => {
      return {
        userID: player.userId,
        seat: i,
        bid: undefined,
        isDealer: dealer === i,
        tricksTaken: 0,
      };
    });
    this.endRound = endRound;
  }

  createHands() {
    const playerNum = this.players.length;
    const cards = new Cards(playerNum);
    const deck = cards.createCards(playerNum);
    const shuffledDeck = cards.shuffleDeck(deck);

    this.dealHands(playerNum, shuffledDeck);
  }

  dealHands(playerNum: number, deck: CardType[]) {
    let dealToSeat = 0;
    // create empty hands
    for (let i = 0; i < playerNum; i++) {
      this.hands.push([]);
    }
    deck.map((card) => {
      this.hands[dealToSeat].push(card);
      dealToSeat !== playerNum - 1 ? dealToSeat++ : (dealToSeat = 0);
    });
  }

  updateTurnOrder(bids: number[]) {
    // turn order needs to be based off of winning bidder (who plays first)
    // after first trick it is the winner of the last trick
  }

  playerBid(dealer: number) {
    //
  }
  updateBids(bid: number) {
    //
  }

  setWinningBid() {
    //
  }

  setCardPlayValues() {
    //
  }

  updatePoints() {
    //
  }

  evaluateRound() {
    // endRound();
  }

  isBidMade() {
    //
  }

  // CARD PLAY VALUE
  public createCards(players: number): CardType[] {
    const newCards: CardType[] = [];

    const cardsInPlay = (players * HAND_SIZE) / SUITS_NUM;
    const suits: Suit[] = [Suit.Spades, Suit.Hearts, Suit.Clubs, Suit.Diamonds];
    let faceValue = 1;

    for (let i = 0; i < CARDS_IN_DECK; i++) {
      // make Aces high
      const playValue = faceValue === 1 ? 14 : faceValue;
      // check if i has reached a multiple of 13 and change suit
      if (i !== 0 && !(i % CARDS_PER_SUIT)) {
        suits.shift();
        faceValue = 1;
      }
      // skip over cards that are not used
      if (faceValue > 1 && faceValue <= CARDS_PER_SUIT - cardsInPlay + 1) {
        faceValue++;
        continue;
      }
      const name: CardName = Object.values(CardName)[faceValue - 1];

      let card = {
        suit: suits[0],
        name: name,
        value: faceValue,
      };

      // substitute 7H and 7S for 5H and 3S
      if (card.suit === Suit.Hearts && card.value === 7) card = { ...card, name: CardName.Five, value: 5 };
      if (card.suit === Suit.Spades && card.value === 7) card = { ...card, name: CardName.Three, value: 3 };

      newCards.push(card as CardType);
      faceValue++;
    }
    return newCards;
  }

  public setTrumpCardValue(deck: CardType[], trump: Suit | null) {
    if (!trump) return deck;

    const trumpDeck = deck.map((card) => {
      if (card.suit === trump) card.trump = true;
      card.playValue = card.playValue + 14;
      return card;
    });

    return trumpDeck;
  }

  // TRICK RELATED
  updateActivePlayer() {
    const nextPlayer = this.activePlayer.seat <= this.players.length ? this.activePlayer.seat + 1 : 0;

    this.activePlayer = this.players[nextPlayer];
    return nextPlayer;
  }

  startPlayerTurn(activePlayer: PlayerType, cardsPlayed: CardType[]) {
    const hand = [...this.hands[activePlayer.seat]];
    const ledSuit = cardsPlayed[0]?.suit;

    this.setPlayableCards(hand, ledSuit);
    // this.startTurnTimer();
  }

  private setPlayableCards(hand: CardType[], ledSuit?: Suit) {
    const playable = ledSuit ? hand.filter((card) => card.suit === ledSuit) : hand;

    this.playerTurn.playableCards = playable;
    return playable;
  }

  playCard(activePlayer: PlayerType, cardPlayed: CardType) {
    this.removeCardFromHand(activePlayer, cardPlayed);
    this.updateCardsPlayed(cardPlayed);
    this.endPlayerTurn();
  }

  private removeCardFromHand(activePlayer: PlayerType, cardPlayed: CardType) {
    const hand = [...this.hands[activePlayer.seat]];
    const cardIndex = hand.indexOf(cardPlayed);

    hand.slice(cardIndex, cardIndex + 1);

    return hand;
  }

  private updateCardsPlayed(cardPlayed: CardType) {
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
    const trickWinner = this.getTrickWinner();
    const trickPoints = this.getTrickPoints();
    const trickData = {
      trickPoints: trickPoints,
      cardsPlayed: this.cardsPlayed,
      trickWonBy: trickWinner,
    };

    // TODO: reset trick variables
    return trickData;
  }

  getTrickPoints() {
    let points = 1;

    for (const card of this.cardsPlayed) {
      if (card.value === 5 && card.suit === Suit.Hearts) points = points + card.value;
      if (card.value === 3 && card.suit === Suit.Spades) points = points - card.value;
    }
    return points;
  }

  private getTrickWinner() {
    const trick = this.cardsPlayed;
    const ledSuit = this.cardsPlayed[0].suit;

    const winner = trick.reduce(
      (winningCard, card, i): { turn: number; playValue: number } => {
        if (card.suit !== ledSuit && card.suit !== this.trump) card.playValue = 0;
        if (card.suit === this.trump) card.playValue = card.value + TRUMP_VALUE;
        else card.playValue = card.value;
        return card.playValue > winningCard.playValue ? { turn: i, playValue: card.playValue } : winningCard;
      },
      { turn: -1, playValue: -1 }
    );

    const trickWinner = this.players[this.turnOrder[winner.turn]];
    return trickWinner;
  }
}

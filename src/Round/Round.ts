import {
  Bid,
  BidType,
  CardType,
  GameConfig,
  Hand,
  PlayerType,
  RoundData,
  Seat,
  Suit,
  TrickType,
  UserId,
} from '../@types/index';
import { Cards } from '../Cards/Cards';
import { TRUMP_VALUE } from '../constants/game';
import { HAND_SIZE } from '../constants/game';

export class Round {
  playerRoundData: RoundData;
  playerNum: number;
  minBid: Bid;
  hands: Hand[] = [];
  bids: Bid[] = [];
  bid: BidType = { amount: null, bidder: null, trump: false };
  trump: Suit | null = null;
  turnOrder: Seat[] = [];
  activePlayer: Seat = -1;
  // ledSuit: Suit | null = null;
  playableCards: CardType[] = [];
  cardsPlayed: CardType[] = [];
  points: number[] = [];
  tricks: TrickType[] = [];

  constructor(
    public config: GameConfig,
    public players: PlayerType[],
    public dealer: Seat,
    public deck: CardType[],
    public endRound: (roundPoints: number[]) => void
  ) {
    this.playerNum = config.numOfPlayers;
    this.minBid = config.minBid;
    this.players = players;
    this.dealer = dealer;
    // this.activePlayer = players[dealer + 1];
    this.deck = deck;
    this.playerRoundData = players.map((player) => {
      return {
        userID: player.userId,
        seat: player.seat,
        bid: null,
        isDealer: dealer === player.seat,
        tricksTaken: 0,
      };
    });
    this.endRound = endRound;
  }

  startRound() {
    this.dealHands(this.deck);
    this.startTurn();
    // bidding
  }

  dealHands(deck: CardType[]) {
    let dealToSeat = 0;
    // create empty hands
    for (let i = 0; i < this.playerNum; i++) {
      this.hands.push([]);
    }
    for (const card of deck) {
      this.hands[dealToSeat].push(card);
      dealToSeat !== this.playerNum - 1 ? dealToSeat++ : (dealToSeat = 0);
    }
  }

  sortHands(reverse?: boolean) {
    for (const hand of this.hands) {
      hand.sort(cardCompare);
    }

    function cardCompare(a: CardType, b: CardType) {
      return !reverse
        ? a.suit.localeCompare(b.suit) || a.playValue - b.playValue
        : b.suit.localeCompare(a.suit) || b.playValue - a.playValue;
    }
  }

  startTurn() {
    // bidding
    if (this.bids.length === 0) {
      this.turnOrder.push(this.dealer + 1 < this.playerNum ? this.dealer + 1 : 0);
    }
    // first turn
    if (this.bid.bidder && this.tricks.length === 0) {
      this.turnOrder.push(this.bid.bidder);
    }
    // turns after first turn
    if (this.bid && this.tricks.length !== 0) {
      this.turnOrder.push(this.tricks[this.tricks.length - 1].trickWonBy);
    }
    // done in updateActivePlayer
    // for (let i = 1; i < this.playerNum; i++) {
    //   const nextPlayer = playOrder[playOrder.length - 1] + 1 < this.playerNum ? playOrder[playOrder.length - 1] + 1 : 0;
    //   playOrder.push(nextPlayer);
    // }
    this.updateActivePlayer(this.turnOrder[0]);
  }

  // TODO: 5 player feature
  // setFivePlayerTeams() {
  // call after bid winning player calls trump / partner card
  // hands.map((hand) => hand.includes(partnerCard))
  // }

  validBids() {
    // const curBids = Object.values(this.bids);
    const curBids = this.bids;
    const curHighBid = Math.max(...curBids);
    const noDealerPass = curBids.length === this.playerNum - 1 && this.bids.filter((bid) => bid !== 0).length === 0;
    const validBids = [
      Bid.Pass,
      ...Object.values(Bid).filter((bid) =>
        this.playerRoundData[this.activePlayer].isDealer
          ? bid > this.minBid && bid >= curHighBid
          : bid > this.minBid && bid > curHighBid
      ),
    ];
    noDealerPass && validBids.shift();

    return validBids;
  }

  setPlayerBid(bid: Bid) {
    this.bids.push(bid);
    // this.bids.length === this.players.length && this.setWinningBid();
  }

  setWinningBid() {
    // const bidAmount = Math.max(...this.bids) as Bid;
    const winner = this.bids.reduce(
      (highBid, bid, i): { bidder: number; bid: Bid; trump: boolean } => {
        return bid > highBid.bid ? { bidder: this.turnOrder[i], bid: bid, trump: !(bid % 1 > 0) } : highBid;
      },
      { bidder: -1, bid: -1, trump: false }
    );

    const winningBid = winner;
  }

  setTrump(trump?: Suit) {
    this.trump = trump;
  }

  // TRICK RELATED
  updateActivePlayer(makeActivePlayer?: number) {
    let nextActivePlayer = -1;
    if (makeActivePlayer) {
      nextActivePlayer = makeActivePlayer;
    } else {
      nextActivePlayer = this.activePlayer <= this.players.length ? this.activePlayer + 1 : 0;
    }
    this.turnOrder.push(nextActivePlayer);
    this.activePlayer = nextActivePlayer;
    return this.activePlayer;
  }

  playerTurn(activePlayer: PlayerType, cardsPlayed: CardType[]) {
    if (!this.bid) {
      const valid = this.validBids();
      // get player bid here
    } else {
      const hand = [...this.hands[activePlayer.seat]];
      const ledSuit = cardsPlayed[0]?.suit;

      this.setPlayableCards(hand, ledSuit);
    }
    // this.startTurnTimer();
  }

  private setPlayableCards(hand: CardType[], ledSuit?: Suit) {
    const playable = ledSuit ? hand.filter((card) => card.suit === ledSuit) : hand;

    this.playableCards = playable;
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
    if (this.cardsPlayed.length === this.players.length) {
      this.endTrick();
    }
    this.resetTurnData();
    this.startPlayerTurn();
  }

  private resetTurnData() {
    // this.turnData = {
    // turnNum: this.turnData.turnNum++,
    this.playableCards = [];
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
    const trickValue = this.getTrickValue();
    const trickData = {
      trickValue: trickValue,
      cardsPlayed: this.cardsPlayed,
      trickWonBy: trickWinner,
    };
    this.tricks.push(trickData);

    this.tricks.length === HAND_SIZE ? this.evaluateRound() : this.updateActivePlayer();
    return trickData;
  }

  getTrickValue() {
    let points = 1;

    for (const card of this.cardsPlayed) {
      if (card.faceValue === 5 && card.suit === Suit.Hearts) points = points + card.faceValue;
      if (card.faceValue === 3 && card.suit === Suit.Spades) points = points - card.faceValue;
    }
    return points;
  }

  private getTrickWinner() {
    const trick = this.cardsPlayed;
    const ledSuit = this.cardsPlayed[0].suit;

    const winner = trick.reduce(
      (winningCard, card, i): { turn: number; playValue: number } => {
        if (card.suit !== ledSuit && card.suit !== this.trump) card.playValue = 0;
        if (card.suit === this.trump) card.playValue = card.faceValue + TRUMP_VALUE;
        else card.playValue = card.faceValue;
        return card.playValue > winningCard.playValue ? { turn: i, playValue: card.playValue } : winningCard;
      },
      { turn: -1, playValue: -1 }
    );

    const trickWinner = this.turnOrder[winner.turn];
    return trickWinner;
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
}

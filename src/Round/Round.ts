import {
  Bid,
  BidType,
  CardType,
  GameConfig,
  Hand,
  PlayerType,
  RoundData,
  RoundTotals,
  Seat,
  Suit,
  TrickType,
  UserId,
} from '../@types/index';
import { Cards } from '../Cards/Cards';
import { TOTAL_TRICK_POINTS, TRUMP_VALUE } from '../constants/game';
import { HAND_SIZE } from '../constants/game';

export class Round {
  playerRoundData: RoundData;
  hands: Hand[] = [];
  bids: Bid[] = [];
  bid: BidType = { amount: -1, bidder: -1, trump: false };
  trump: Suit | null = null;
  turnOrder: Seat[] = [];
  // teams: PlayerType[] = [];
  activePlayer: Seat = -1;
  // ledSuit: Suit | null = null;
  playableCards: CardType[] = [];
  cardsPlayed: CardType[] = [];
  trickPoints: number[] = [];
  tricksTaken: TrickType[] = [];

  constructor(
    public playerNum: number,
    public minBid: Bid,
    public players: PlayerType[],
    public dealer: Seat,
    public deck: CardType[],
    public endRound: (roundTotals: RoundTotals) => void
  ) {
    this.playerNum = playerNum;
    this.minBid = minBid;
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
    this.newTurnOrder();
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

  newTurnOrder() {
    this.turnOrder = [];
    // bidding (push player left of dealer to turnOrder)
    if (this.bids.length === 0) {
      this.turnOrder.push(this.dealer + 1 < this.playerNum ? this.dealer + 1 : 0);
    }
    // first turn (push bid winner to turnOrder)
    if (this.bid.bidder && this.tricksTaken.length === 0) {
      this.turnOrder.push(this.bid.bidder);
    }
    // turns after first turn (push last trick winner to turnOrder)
    if (this.bid && this.tricksTaken.length !== 0) {
      this.turnOrder.push(this.tricksTaken[this.tricksTaken.length - 1].trickWonBy);
    }
    // done in updateActivePlayer
    // for (let i = 1; i < this.playerNum; i++) {
    //   const nextPlayer = playOrder[playOrder.length - 1] + 1 < this.playerNum ? playOrder[playOrder.length - 1] + 1 : 0;
    //   playOrder.push(nextPlayer);
    // }
    this.updateActivePlayer(this.turnOrder[0]);
  }

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
    const winningBid = this.bids.reduce(
      (highBid, bid, i): { bidder: number; amount: Bid; trump: boolean } => {
        return bid > highBid.amount ? { bidder: this.turnOrder[i], amount: bid, trump: !(bid % 1 > 0) } : highBid;
      },
      { bidder: -1, amount: -1, trump: false }
    );

    this.bid = winningBid;
  }

  setTrump(trump: Suit) {
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

    this.hands[activePlayer.seat] = hand;
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
  }

  private resetTurnData() {
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
    this.tricksTaken.push(trickData);
    this.updateTrickPoints(trickData);

    this.tricksTaken.length === HAND_SIZE ? this.evaluateRound() : this.newTurnOrder();
    return trickData;
  }

  getTrickValue() {
    let value = 1;

    for (const card of this.cardsPlayed) {
      if (card.faceValue === 5 && card.suit === Suit.Hearts) value = value + card.faceValue;
      if (card.faceValue === 3 && card.suit === Suit.Spades) value = value - card.faceValue;
    }
    return value;
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

  updateTrickPoints(trickData: TrickType) {
    const trickWonByTeam = this.players[trickData.trickWonBy].team;
    this.trickPoints[trickWonByTeam] = this.trickPoints[trickWonByTeam] + trickData.trickValue;
  }

  evaluateRound() {
    const bidTotals = this.isBidMade();
    const playerTricks = this.playerTrickTotals();
    const totals = { ...bidTotals, playerTricks };

    this.endRound(totals);
    return totals;
  }

  isBidMade() {
    const biddingTeam = this.players[this.bid.bidder].team;
    const biddingTeamPoints =
      this.trickPoints[biddingTeam] - this.bid.amount >= 0 ? this.trickPoints[biddingTeam] : this.bid.amount * -1;
    const defendingTeamPoints = TOTAL_TRICK_POINTS - this.trickPoints[biddingTeam];
    const totals = {
      bidMade: biddingTeamPoints > 0,
      points: [biddingTeamPoints, defendingTeamPoints], //FIXME:
    };
    return totals;
  }

  playerTrickTotals(): number[] {
    const totals = this.tricksTaken.reduce((playerTricks, trick): number[] => {
      playerTricks[trick.trickWonBy]++;
      return playerTricks;
    }, new Array(this.players.length).fill(0));

    return totals;
  }

  wasFiveStolen() {
    //}
  }
  // TODO: 5 player feature
  // setFivePlayerTeams() {
  // call after bid winning player calls trump / partner card
  // hands.map((hand) => hand.includes(partnerCard))
  // }
}

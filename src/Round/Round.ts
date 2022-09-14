import {
  Bid,
  BidType,
  CardType,
  Hand,
  PlayerType,
  RoundData,
  RoundTotals,
  Seat,
  Suit,
  TrickType,
} from '../@types/index';
import { TOTAL_TRICK_POINTS, TRUMP_VALUE, TURN_LENGTH } from '../constants/game';
import { HAND_SIZE } from '../constants/game';

export class Round {
  playerRoundData: RoundData;
  hands: Hand[] = [];
  bids: Bid[] = [];
  bid: BidType = { amount: -1, bidder: -1, isTrump: false };
  trump: Suit | null = null;
  turnOrder: Seat[] = [];
  activePlayer: Seat = -1;
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

  // CARDS
  dealHands(deck: CardType[]) {
    let dealToSeat = 0;

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
      hand.sort(cardSort);
    }

    function cardSort(a: CardType, b: CardType) {
      return !reverse
        ? a.suit.localeCompare(b.suit) || a.playValue - b.playValue
        : b.suit.localeCompare(a.suit) || b.playValue - a.playValue;
    }
  }

  // BIDDING
  validBids() {
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
    this.bids.length === this.players.length && this.setWinningBid();
  }

  setWinningBid() {
    // const bidAmount = Math.max(...this.bids) as Bid;
    const winningBid = this.bids.reduce(
      (highBid, bid, i): { bidder: number; amount: Bid; isTrump: boolean } => {
        return bid > highBid.amount ? { bidder: this.turnOrder[i], amount: bid, isTrump: bid % 1 === 0 } : highBid;
      },
      { bidder: -1, amount: -1, isTrump: false }
    );

    this.bid = winningBid;
    this.playerRoundData[winningBid.bidder].bid = winningBid.amount;
  }

  setTrump(trump: Suit) {
    if (!this.bid.isTrump) return;
    this.trump = trump;
  }

  // CARD PLAY
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

    this.updateActivePlayer(this.turnOrder[0]);
  }

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

  turnTimer(autoPlay?: boolean, pointPenalty?: boolean) {
    const timer = setTimeout(() => {
      const active = this.activePlayer;
      if (autoPlay) {
        const cards = this.playableCards;
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        this.playCard(active, randomCard);
      }
      if (pointPenalty) {
        this.trickPoints[this.players[active].team] = this.trickPoints[this.players[active].team] - 1;
      }
    }, TURN_LENGTH);

    return timer;
  }

  setPlayableCards(hand: CardType[]) {
    const ledSuit = this.cardsPlayed[0]?.suit;
    const playable = ledSuit ? hand.filter((card) => card.suit === ledSuit) : hand;

    this.playableCards = playable;
    return playable;
  }

  playCard(activePlayer: Seat, cardPlayed: CardType) {
    this.removeCardFromHand(activePlayer, cardPlayed);
    this.updateCardsPlayed(cardPlayed);
    this.endPlayerTurn();
  }

  private removeCardFromHand(activePlayer: Seat, cardPlayed: CardType) {
    const hand = [...this.hands[activePlayer]];
    const cardIndex = hand.indexOf(cardPlayed);

    if (cardIndex !== -1) {
      hand.splice(cardIndex, 1);
      this.hands[activePlayer] = hand;
    } else console.error('card not in hand');

    return hand;
  }

  private updateCardsPlayed(cardPlayed: CardType) {
    const played = [...this.cardsPlayed];
    played.push(cardPlayed);

    this.cardsPlayed = played;
    return played;
  }

  endPlayerTurn() {
    if (this.cardsPlayed.length === this.players.length) {
      this.endTrick();
    } else this.updateActivePlayer();
    this.resetTurnData();
  }

  private resetTurnData() {
    this.playableCards = [];
  }

  endTrick() {
    const trickValue = this.getTrickValue();
    const trickWinner = this.getTrickWinner();
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

  private getTrickValue() {
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

  private updateTrickPoints(trickData: TrickType) {
    const trickWonByTeam = this.players[trickData.trickWonBy].team;
    this.trickPoints[trickWonByTeam] = this.trickPoints[trickWonByTeam] + trickData.trickValue;
    this.playerRoundData[trickData.trickWonBy].tricksTaken =
      this.playerRoundData[trickData.trickWonBy].tricksTaken + trickData.trickValue;
  }

  evaluateRound() {
    const scoreTotals = this.isBidMade();
    const playerTricks = this.playerTrickTotals();
    const totals = { ...scoreTotals, playerTricks };

    this.endRound(totals);
    return totals;
  }

  isBidMade() {
    const biddingTeam = this.players[this.bid.bidder].team;
    //FIXME: evaluate no trump
    const biddingTeamPoints =
      this.trickPoints[biddingTeam] - this.bid.amount >= 0 ? this.trickPoints[biddingTeam] : this.bid.amount * -1;
    const defendingTeamPoints = TOTAL_TRICK_POINTS - this.trickPoints[biddingTeam];
    const totals = {
      bidMade: biddingTeamPoints > 0,
      points: biddingTeam === 0 ? [biddingTeamPoints, defendingTeamPoints] : [defendingTeamPoints, biddingTeamPoints], //FIXME:
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
}

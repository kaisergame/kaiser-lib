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
  playersRoundData: RoundData;
  hands: Hand[] = [];
  bids: BidType[] = [];
  bid: BidType = { amount: -1, bidder: -1, isTrump: false };
  trump: Suit | null = null;
  activePlayer: Seat = -1;
  playableCards: CardType[] = [];
  curTrick: { cardPlayed: CardType; playedBy: Seat }[] = [];
  roundPoints: number[] = [];
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
    this.dealer = dealer;
    this.deck = deck;
    this.playersRoundData = players.map((player) => {
      return {
        userID: player.userId,
        userName: player.userName,
        seat: player.seat,
        team: player.team,
        bid: null,
        isDealer: dealer === player.seat,
        tricksTaken: 0,
      };
    });
    this.endRound = endRound;
  }

  // CARDS
  dealHands(shuffledDeck: CardType[]) {
    let dealToSeat = 0;

    for (let i = 0; i < this.playerNum; i++) {
      this.hands.push([]);
    }
    for (const card of shuffledDeck) {
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
    const curBids = this.bids.map((bid) => bid.amount);
    const curHighBid = Math.max(...curBids);
    const noDealerPass =
      curBids.length === this.playerNum - 1 && this.bids.filter((bid) => bid.amount !== 0).length === 0;

    const validBids = [
      Bid.Pass,
      ...Object.values(Bid).filter((bid) =>
        this.playersRoundData[this.activePlayer].isDealer
          ? bid > this.minBid && bid >= curHighBid
          : bid > this.minBid && bid > curHighBid
      ),
    ];
    noDealerPass && validBids.shift();

    return validBids;
  }

  setPlayerBid(bid: Bid) {
    const playerBid = {
      amount: bid,
      bidder: this.activePlayer,
      isTrump: bid % 1 === 0,
    };
    this.bids.push(playerBid);
    this.bids.length === this.playerNum && this.setWinningBid();
  }

  setWinningBid() {
    // const bidAmount = Math.max(...this.bids) as Bid;
    const winningBid = this.bids.reduce(
      (highBid, bid): { bidder: number; amount: Bid; isTrump: boolean } => {
        return bid.amount > highBid.amount
          ? { bidder: bid.bidder, amount: bid.amount, isTrump: bid.amount % 1 === 0 }
          : highBid;
      },
      { bidder: -1, amount: -1, isTrump: false }
    );

    this.bid = winningBid;
    this.playersRoundData[winningBid.bidder].bid = winningBid.amount;
  }

  setTrump(trump: Suit) {
    if (!this.bid.isTrump) return;
    this.trump = trump;
  }

  // CARD PLAY
  orderOfPlay() {
    let nextPlayer = -1;
    // bidding (left of dealer to play)
    if (this.bids.length === 0) {
      nextPlayer = this.dealer + 1 < this.playerNum ? this.dealer + 1 : 0;
    }
    // first turn (bid winner to play)
    if (this.bid.bidder && this.tricksTaken.length === 0) {
      nextPlayer = this.bid.bidder;
    }
    // turns after first turn (previous trick winner to play)
    if (this.bid && this.tricksTaken.length !== 0) {
      nextPlayer = this.tricksTaken[this.tricksTaken.length - 1].trickWonBy;
    }

    this.updateActivePlayer(nextPlayer);
    return nextPlayer;
  }

  updateActivePlayer(makeActivePlayer?: number) {
    let nextActivePlayer = -1;
    if (makeActivePlayer) {
      nextActivePlayer = makeActivePlayer;
    } else {
      nextActivePlayer = this.activePlayer <= this.playerNum ? this.activePlayer + 1 : 0;
    }

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
        this.roundPoints[this.playersRoundData[active].team] = this.roundPoints[this.playersRoundData[active].team] - 1;
      }
    }, TURN_LENGTH);

    return timer;
  }

  setPlayableCards(hand: CardType[]) {
    const ledSuit = this.curTrick[0].cardPlayed?.suit;
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
    const play = {
      cardPlayed,
      playedBy: this.activePlayer,
    };
    const updatedTrick = [...this.curTrick];
    updatedTrick.push(play);

    this.curTrick = updatedTrick;
    return updatedTrick;
  }

  getCardsPlayed() {
    return this.curTrick.map((play) => play.cardPlayed);
  }

  endPlayerTurn() {
    if (this.curTrick.length === this.playerNum) {
      this.endTrick();
    } else this.updateActivePlayer();
    this.resetPlayableCards();
  }

  private resetPlayableCards() {
    this.playableCards = [];
  }

  endTrick() {
    const trickValue = this.getTrickValue();
    const trickWinner = this.getTrickWinner();
    const trickData = {
      trickValue: trickValue,
      cardsPlayed: this.getCardsPlayed(),
      trickWonBy: trickWinner,
    };
    this.tricksTaken.push(trickData);
    this.updateRoundPoints(trickData);

    this.tricksTaken.length === HAND_SIZE ? this.evaluateRound() : this.orderOfPlay();
    return trickData;
  }

  private getTrickValue() {
    let value = 1;

    const cardsPlayed = this.getCardsPlayed();
    for (const card of cardsPlayed) {
      if (card.faceValue === 5 && card.suit === Suit.Hearts) value = value + card.faceValue;
      if (card.faceValue === 3 && card.suit === Suit.Spades) value = value - card.faceValue;
    }
    return value;
  }

  private getTrickWinner() {
    const ledSuit = this.curTrick[0].cardPlayed.suit;

    const winner = this.curTrick.reduce(
      (winningPlay, play): { playedBy: Seat; playValue: number } => {
        if (play.cardPlayed.suit !== ledSuit && play.cardPlayed.suit !== this.trump) play.cardPlayed.playValue = 0;
        if (play.cardPlayed.suit === this.trump) play.cardPlayed.playValue = play.cardPlayed.faceValue + TRUMP_VALUE;
        else play.cardPlayed.playValue = play.cardPlayed.faceValue;
        return play.cardPlayed.playValue > winningPlay.playValue
          ? { playedBy: play.playedBy, playValue: play.cardPlayed.playValue }
          : winningPlay;
      },
      { playedBy: -1, playValue: -1 }
    );

    const trickWinner = winner.playedBy;
    return trickWinner;
  }

  private updateRoundPoints(trickData: TrickType) {
    const trickWonByTeam = this.playersRoundData[trickData.trickWonBy].team;
    this.roundPoints[trickWonByTeam] = this.roundPoints[trickWonByTeam] + trickData.trickValue;
    this.playersRoundData[trickData.trickWonBy].tricksTaken =
      this.playersRoundData[trickData.trickWonBy].tricksTaken + trickData.trickValue;
  }

  evaluateRound() {
    const scoreTotals = this.isBidMade();
    const playerTricks = this.playerTrickTotals();
    const totals = { ...scoreTotals, playerTricks };

    this.endRound(totals);
    return totals;
  }

  isBidMade() {
    const biddingTeam = this.playersRoundData[this.bid.bidder].team;
    //FIXME: evaluate no trump
    const biddingTeamPoints =
      this.roundPoints[biddingTeam] - this.bid.amount >= 0 ? this.roundPoints[biddingTeam] : this.bid.amount * -1;
    const defendingTeamPoints = TOTAL_TRICK_POINTS - this.roundPoints[biddingTeam];
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
    }, new Array(this.playerNum).fill(0));

    return totals;
  }
}

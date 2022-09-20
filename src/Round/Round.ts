import {
  BidAmount,
  BidType,
  CardType,
  Deck,
  EvaluatedTrick,
  Hand,
  PlayerPointTotals,
  PlayerRoundData,
  PlayerType,
  RoundPointTotals,
  RoundTotals,
  RoundType,
  Seat,
  Suit,
  TeamType,
  TrickType,
} from '../@types/index';
import { TOTAL_TRICK_POINTS, TRUMP_VALUE, TURN_LENGTH } from '../constants/game';
import { HAND_SIZE } from '../constants/game';

export class Round implements RoundType {
  playersRoundData: PlayerRoundData[];
  hands: Hand[] = [];
  bids: BidType[] = [];
  winningBid: BidType = { amount: -1, bidder: -1, isTrump: false };
  trump: Suit | null = null;
  activePlayer: Seat = -1;
  playableCards: CardType[] = [];
  curTrick: TrickType = [];
  tricksTeam0: EvaluatedTrick[] = [];
  tricksTeam1: EvaluatedTrick[] = [];
  roundPoints: RoundPointTotals = [];

  constructor(
    public numPlayers: number,
    public minBid: BidAmount,
    public players: PlayerType[],
    public teams: TeamType[],
    public dealer: Seat,
    public deck: Deck,
    public endRound: (roundTotals: RoundTotals) => void
  ) {
    this.numPlayers = numPlayers;
    this.minBid = minBid;
    this.dealer = dealer;
    this.deck = deck;
    this.playersRoundData = players.map((player) => {
      return {
        playerId: player.playerId,
        name: player.name,
        seat: player.seat,
        teamId: player.teamId,
        bid: null,
        isDealer: dealer === player.seat,
      };
    });
    this.endRound = endRound;
  }

  // CARDS
  dealHands() {
    let dealToSeat = 0;

    for (let i = 0; i < this.numPlayers; i++) {
      this.hands.push([]);
    }
    for (const card of this.deck) {
      this.hands[dealToSeat].push(card);
      dealToSeat !== this.numPlayers - 1 ? dealToSeat++ : (dealToSeat = 0);
    }
  }

  sortHands(lowToHigh?: 'lowToHigh') {
    for (const hand of this.hands) {
      hand.sort(cardSort);
    }

    function cardSort(a: CardType, b: CardType) {
      return !lowToHigh
        ? a.suit.localeCompare(b.suit) || b.playValue - a.playValue
        : a.suit.localeCompare(b.suit) || a.playValue - b.playValue;
    }
  }

  // BIDDING
  validBids() {
    const curBids = this.bids.map((bid) => bid.amount);
    const curHighBid = Math.max(...curBids);
    const noDealerPass =
      curBids.length === this.numPlayers - 1 && this.bids.filter((bid) => bid.amount !== 0).length === 0;

    const validBids = [
      BidAmount.Pass,
      ...Object.values(BidAmount).filter((bid) =>
        this.playersRoundData[this.activePlayer].isDealer
          ? bid > this.minBid && bid >= curHighBid
          : bid > this.minBid && bid > curHighBid
      ),
    ];
    noDealerPass && validBids.shift();

    return validBids;
  }

  setPlayerBid(bid: BidAmount) {
    const playerBid = {
      amount: bid,
      bidder: this.activePlayer,
      isTrump: bid % 1 === 0,
    };
    this.bids.push(playerBid);
    this.playersRoundData[this.activePlayer].bid = playerBid.amount;
    if (this.bids.length === this.numPlayers) this.setWinningBid();
  }

  setWinningBid() {
    // const bidAmount = Math.max(...this.bids) as BidAmount;
    const winningBid = this.bids.reduce(
      (highBid, bid): { bidder: number; amount: BidAmount; isTrump: boolean } => {
        return bid.amount > highBid.amount
          ? { bidder: bid.bidder, amount: bid.amount, isTrump: bid.amount % 1 === 0 }
          : highBid;
      },
      { bidder: -1, amount: -1, isTrump: false }
    );

    this.winningBid = winningBid;
    this.playersRoundData[winningBid.bidder].winningBid = winningBid.amount;
    return winningBid;
  }

  setTrump(trump: Suit) {
    if (!this.winningBid.isTrump) return;
    this.trump = trump;
  }

  // CARD PLAY
  orderOfPlay() {
    let nextPlayer = -1;
    // bidding (left of dealer to play)
    if (this.bids.length === 0) {
      nextPlayer = this.dealer + 1 < this.numPlayers ? this.dealer + 1 : 0;
    }
    // first turn (bid winner to play)
    if (this.winningBid.bidder !== -1 && this.tricksTaken.length === 0) {
      nextPlayer = this.winningBid.bidder;
    }
    // turns after first turn (previous trick winner to play)
    if (this.tricksTaken.length !== 0) {
      nextPlayer = this.tricksTaken[this.tricksTaken.length - 1].trickWonBy;
    }

    this.updateActivePlayer(nextPlayer);
    return nextPlayer;
  }

  updateActivePlayer(makeActivePlayer?: number) {
    if (typeof makeActivePlayer === 'undefined' && this.activePlayer === -1)
      throw new Error('Must initialize orderOfPlay');
    if (typeof makeActivePlayer === 'number' && makeActivePlayer > this.numPlayers - 1)
      throw new Error(`There is no player in seat ${makeActivePlayer}`);

    let nextActivePlayer = -1;
    if (typeof makeActivePlayer === 'number') nextActivePlayer = makeActivePlayer;
    if (typeof makeActivePlayer === 'undefined')
      nextActivePlayer = this.activePlayer < this.numPlayers - 1 ? this.activePlayer + 1 : 0;

    this.activePlayer = nextActivePlayer;
    return this.activePlayer;
  }

  turnTimer(autoPlay?: boolean, pointPenalty?: boolean) {
    const timer = setTimeout(() => {
      if (autoPlay) {
        const cards = this.playableCards;
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        this.playCard(randomCard);
      }
      if (pointPenalty) {
        const penaltyTeam = this.playersRoundData[this.activePlayer].team;
        this.roundPoints[penaltyTeam].points = this.roundPoints[penaltyTeam].points - 1;
      }
    }, TURN_LENGTH);

    return timer;
  }

  setPlayableCards(hand: CardType[]) {
    const ledSuit = this.curTrick[0]?.cardPlayed.suit;
    const playable = ledSuit ? hand.filter((card) => card.suit === ledSuit) : hand;

    this.playableCards = playable;
    return playable;
  }

  playCard(cardPlayed: CardType) {
    const inHand = this.hands[this.activePlayer].includes(cardPlayed);
    // return !inHand;
    if (!inHand) throw new Error('Card not in hand');
    // if (!this.hands[this.activePlayer].includes(cardPlayed)) throw new Error('Card not in hand');
    this.removeCardFromHand(cardPlayed);
    this.updateCardsPlayed(cardPlayed);
    this.endPlayerTurn();
  }

  private removeCardFromHand(cardPlayed: CardType) {
    const hand = [...this.hands[this.activePlayer]];
    const cardIndex = this.hands[this.activePlayer].indexOf(cardPlayed);

    if (cardIndex !== -1) {
      hand.splice(cardIndex, 1);
      this.hands[this.activePlayer] = hand;
    } else throw new Error('Card not in hand');

    this.hands[this.activePlayer] = hand;
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

  endPlayerTurn() {
    if (this.curTrick.length === this.numPlayers) {
      this.endTrick();
    } else this.updateActivePlayer();
    this.resetPlayableCards();
  }

  private resetPlayableCards() {
    this.playableCards = [];
  }

  endTrick() {
    const trickPoints = this.getTrickValue();
    const trickWinner = this.getTrickWinner();
    const trickData = {
      trickPoints: trickPoints,
      cardsPlayed: this.curTrick,
      trickWonBy: trickWinner,
    };
    this.tricksTaken.push(trickData);
    this.updateRoundPoints(trickData);

    this.tricksTaken.length === HAND_SIZE ? this.evaluateRound() : this.orderOfPlay();
    return trickData;
  }

  private getTrickValue() {
    let value = 1;

    const cardsPlayed = this.curTrick.map((play) => play.cardPlayed);

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

  private updateRoundPoints(trickData: EvaluatedTrick) {
    const winner = this.playersRoundData[trickData.trickWonBy];
    const trickWonByTeam = winner.roundTeam || winner.team; // roundTeam used for 5 player
    this.roundPoints[trickWonByTeam].points = this.roundPoints[trickWonByTeam].points + trickData.trickPoints;
  }

  evaluateRound() {
    const { bidMade, roundPoints } = this.isBidMade();
    const playerPoints = this.playerTrickTotals();
    const totals = { bidMade, roundPoints, playerPoints };

    this.endRound(totals);
    return totals;
  }

  isBidMade() {
    const biddingTeam = this.playersRoundData[this.winningBid.bidder].team;
    const noBidMultiplier = this.winningBid.isTrump ? 1 : 2;
    const biddingTeamPoints =
      this.roundPoints[biddingTeam].points - this.winningBid.amount >= 0
        ? this.roundPoints[biddingTeam].points * noBidMultiplier
        : this.winningBid.amount * noBidMultiplier * -1;
    const defendingTeamPoints = TOTAL_TRICK_POINTS - this.roundPoints[biddingTeam].points;

    const points = this.roundPoints.map((pointData) => {
      const points = pointData.team === biddingTeam ? biddingTeamPoints : defendingTeamPoints;
      return {
        team: pointData.team,
        points: points,
      };
    });
    const totals = {
      bidMade: biddingTeamPoints > 0,
      roundPoints: points,
    };
    return totals;
  }

  playerTrickTotals(): PlayerPointTotals {
    const points = this.tricksTaken.reduce((playerTricks, trick) => {
      playerTricks[trick.trickWonBy] = {
        player: trick.trickWonBy,
        points: playerTricks[trick.trickWonBy].points + trick.trickPoints,
      };
      return playerTricks;
    }, new Array(this.numPlayers).fill(0));

    const totals = [];
    for (let i = 0; i < points.length; i++) {
      totals.push({
        player: i,
        points: points[i],
      });
    }

    return totals;
  }
}

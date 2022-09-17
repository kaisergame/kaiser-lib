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
  TakenTrickType,
  TrickType,
} from '../@types/index';
import { TOTAL_TRICK_POINTS, TRUMP_VALUE, TURN_LENGTH } from '../constants/game';
import { HAND_SIZE } from '../constants/game';

export class Round {
  playersRoundData: RoundData[];
  hands: Hand[] = [];
  bids: BidType[] = [];
  bid: BidType = { amount: -1, bidder: -1, isTrump: false };
  trump: Suit | null = null;
  activePlayer: Seat = -1;
  playableCards: CardType[] = [];
  curTrick: TrickType[] = [];
  roundPoints: number[] = [];
  tricksTaken: TakenTrickType[] = [];

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
        userId: player.userId,
        userName: player.userName,
        seat: player.seat,
        team: player.team,
        bid: null,
        winningBid: null,
        isDealer: dealer === player.seat,
        tricksTaken: 0,
      };
    });
    this.endRound = endRound;
  }

  // CARDS
  dealHands() {
    let dealToSeat = 0;

    for (let i = 0; i < this.playerNum; i++) {
      this.hands.push([]);
    }
    for (const card of this.deck) {
      this.hands[dealToSeat].push(card);
      dealToSeat !== this.playerNum - 1 ? dealToSeat++ : (dealToSeat = 0);
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
    this.playersRoundData[this.activePlayer].bid = playerBid.amount;
    if (this.bids.length === this.playerNum) this.setWinningBid();
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
    this.playersRoundData[winningBid.bidder].winningBid = winningBid;
    return winningBid;
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
    if (this.bid.bidder !== -1 && this.tricksTaken.length === 0) {
      nextPlayer = this.bid.bidder;
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
    if (typeof makeActivePlayer === 'number' && makeActivePlayer > this.playerNum - 1)
      throw new Error(`There is no player in seat ${makeActivePlayer}`);

    let nextActivePlayer = -1;
    if (typeof makeActivePlayer === 'number') nextActivePlayer = makeActivePlayer;
    if (typeof makeActivePlayer === 'undefined')
      nextActivePlayer = this.activePlayer < this.playerNum - 1 ? this.activePlayer + 1 : 0;

    this.activePlayer = nextActivePlayer;
    return this.activePlayer;
  }

  turnTimer(autoPlay?: boolean, pointPenalty?: boolean) {
    const timer = setTimeout(() => {
      const active = this.activePlayer;
      if (autoPlay) {
        const cards = this.playableCards;
        const randomCard = cards[Math.floor(Math.random() * cards.length)];
        this.playCard(randomCard);
      }
      if (pointPenalty) {
        this.roundPoints[this.playersRoundData[active].team] = this.roundPoints[this.playersRoundData[active].team] - 1;
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
      cardsPlayed: this.curTrick,
      trickWonBy: trickWinner,
    };
    this.tricksTaken.push(trickData);
    this.updateRoundPoints(trickData);
    this.updatePlayerRoundData(trickData);

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

  private updateRoundPoints(trickData: TakenTrickType) {
    const winner = this.playersRoundData[trickData.trickWonBy];
    const trickWonByTeam = winner.roundTeam || winner.team;
    this.roundPoints[trickWonByTeam] = this.roundPoints[trickWonByTeam] + trickData.trickValue;
  }

  private updatePlayerRoundData(trickData: TakenTrickType) {
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
    const noBid = this.bid.isTrump ? 1 : 2;
    const biddingTeamPoints =
      this.roundPoints[biddingTeam] - this.bid.amount >= 0
        ? this.roundPoints[biddingTeam] * noBid
        : this.bid.amount * noBid * -1;
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

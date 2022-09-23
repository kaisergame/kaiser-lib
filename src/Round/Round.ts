import {
  BidAmount,
  BidType,
  CardType,
  EvaluatedBid,
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
  TrickType,
} from '../@types/index';
import { Cards } from '../Cards/Cards';
import { TRUMP_VALUE } from '../constants/game';
import { HAND_SIZE } from '../constants/game';

export class Round implements RoundType {
  playersRoundData: PlayerRoundData[];
  hands: Hand[];
  bids: BidType[] = [];
  winningBid: BidType = { amount: -1, bidder: -1, isTrump: false };
  trump: Suit | null = null;
  activePlayer: Seat = -1;
  playableCards: CardType[] = [];
  curTrick: TrickType = [];
  tricksTeam0: EvaluatedTrick[] = [];
  tricksTeam1: EvaluatedTrick[] = [];
  roundPoints: RoundPointTotals = [
    { teamId: 'team0', points: 0 },
    { teamId: 'team1', points: 1 },
  ];

  constructor(
    public numPlayers: number,
    public minBid: BidAmount,
    public players: PlayerType[],
    public dealer: Seat,
    public endRound: (roundTotals: RoundTotals) => void
  ) {
    this.numPlayers = numPlayers;
    this.minBid = minBid;
    this.dealer = dealer;
    this.hands = this.dealHands();
    this.playersRoundData = players.map((player) => {
      return {
        playerId: player.playerId!,
        name: player.name!,
        seat: player.seat,
        teamId: player.teamId,
        bid: null,
        isDealer: dealer === player.seat,
      };
    });
    this.endRound = endRound;
  }

  // CARDS
  dealHands(): Hand[] {
    const cards = new Cards(this.numPlayers);
    const deck = cards.shuffleDeck(cards.createDeck());
    const hands: Hand[] = [];
    let dealToSeat = 0;

    for (let i = 0; i < this.numPlayers; i++) {
      hands.push([]);
    }
    for (const card of deck) {
      hands[dealToSeat].push(card);
      dealToSeat !== this.numPlayers - 1 ? dealToSeat++ : (dealToSeat = 0);
    }

    return hands;
  }

  sortHands(lowToHigh?: 'lowToHigh'): void {
    for (const hand of this.hands) {
      hand.sort(cardSort);
    }

    function cardSort(a: CardType, b: CardType) {
      //FIXME: it would be nice to have the suits red/black/red/black
      return !lowToHigh
        ? a.suit.localeCompare(b.suit) || b.playValue - a.playValue
        : a.suit.localeCompare(b.suit) || a.playValue - b.playValue;
    }
  }

  // BIDDING
  validBids(): BidAmount[] {
    const curBids = this.bids.map((bid) => bid.amount);
    const curHighBid = Math.max(...curBids);
    const noDealerPass =
      curBids.length === this.numPlayers - 1 && this.bids.filter((bid) => bid.amount !== 0).length === 0;

    const validBids = [
      BidAmount.Pass,
      // FIXME: Object.values is adding a string type union
      ...Object.values(BidAmount).filter((bid) =>
        this.playersRoundData[this.activePlayer].isDealer
          ? bid > this.minBid && bid >= curHighBid
          : bid > this.minBid && bid > curHighBid
      ),
    ];
    noDealerPass && validBids.shift();

    return validBids as BidAmount[];
  }

  setPlayerBid(bid: BidAmount): void {
    const playerBid = {
      amount: bid,
      bidder: this.activePlayer,
      isTrump: bid % 1 === 0,
    };
    this.bids.push(playerBid);
    this.playersRoundData[this.activePlayer].bid = playerBid.amount;
    if (this.bids.length === this.numPlayers) this.setWinningBid();
  }

  setWinningBid(): BidType {
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
    return winningBid;
  }

  setTrump(trump: Suit): void {
    if (!this.winningBid.isTrump) throw new Error('Trump cannot be called on a no trump bid');
    this.trump = trump;
  }

  // CARD PLAY
  orderOfPlay(next?: Seat): Seat {
    if (typeof next === 'number' && next <= this.numPlayers && next >= 0) {
      this.activePlayer = next;
      return next;
    }

    let nextPlayer = -1;
    // bidding (left of dealer to play)
    if (this.bids.length === 0) {
      nextPlayer = this.dealer + 1 < this.numPlayers ? this.dealer + 1 : 0;
    }
    // first turn (bid winner to play)
    if (this.winningBid.bidder !== -1 && this.tricksTeam0.length === 0 && this.tricksTeam1.length === 0) {
      nextPlayer = this.winningBid.bidder;
    }

    this.updateActivePlayer(nextPlayer);
    return nextPlayer;
  }

  updateActivePlayer(makeActivePlayer?: number): Seat {
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

  // turnTimer(autoPlay?: boolean, pointPenalty?: boolean) {
  //   const timer = setTimeout(() => {
  //     if (autoPlay) {
  //       const cards = this.playableCards;
  //       const randomCard = cards[Math.floor(Math.random() * cards.length)];
  //       this.playCard(randomCard);
  //     }
  //     if (pointPenalty) {
  //       const penaltyTeam = this.playersRoundData[this.activePlayer].teamId;
  //       this.roundPoints[penaltyTeam].points = this.roundPoints[penaltyTeam].points - 1;
  //     }
  //   }, TURN_LENGTH);

  //   return timer;
  // }

  setPlayableCards(hand: Hand): Hand {
    const ledSuit = this.curTrick[0]?.cardPlayed.suit;
    const playable = ledSuit ? hand.filter((card) => card.suit === ledSuit) : hand;

    this.playableCards = playable;
    return playable;
  }

  playCard(cardPlayed: CardType): void {
    if (this.bids.length !== this.numPlayers || this.activePlayer < 0) throw new Error('Cannot play a card now');
    const inHand = this.hands[this.activePlayer].includes(cardPlayed);
    if (!inHand) throw new Error('Card not in hand');
    this.removeCardFromHand(cardPlayed);
    this.updateCardsPlayed(cardPlayed);
    this.endPlayerTurn();
  }

  // private
  removeCardFromHand(cardPlayed: CardType): Hand {
    const hand = [...this.hands[this.activePlayer]];
    const cardIndex = this.hands[this.activePlayer].indexOf(cardPlayed);

    if (cardIndex !== -1) {
      hand.splice(cardIndex, 1);
      this.hands[this.activePlayer] = hand;
    } else throw new Error('Card not in hand');

    this.hands[this.activePlayer] = hand;
    return hand;
  }

  // private
  updateCardsPlayed(cardPlayed: CardType): TrickType {
    const play = {
      cardPlayed,
      playedBy: this.activePlayer,
    };
    const updatedTrick = [...this.curTrick];
    updatedTrick.push(play);

    this.curTrick = updatedTrick;
    return updatedTrick;
  }

  endPlayerTurn(): void {
    if (this.curTrick.length === this.numPlayers) {
      this.endTrick();
    } else this.updateActivePlayer();
    this.resetPlayableCards();
  }

  // private
  resetPlayableCards(): void {
    this.playableCards = [];
  }

  endTrick(): EvaluatedTrick {
    const pointValue = this.getTrickValue();
    const trickWinner = this.getTrickWinner();
    const trickData = {
      pointValue: pointValue,
      cardsPlayed: this.curTrick,
      trickWonBy: trickWinner,
    };
    const wonByPlayer = this.playersRoundData.find((player) => player.seat === trickWinner)!;
    if (wonByPlayer.teamId === 'team0') this.tricksTeam0.push(trickData);
    if (wonByPlayer.teamId === 'team1') this.tricksTeam1.push(trickData);
    this.updateRoundPoints(trickData, wonByPlayer);

    this.tricksTeam0.length + this.tricksTeam1.length === HAND_SIZE
      ? this.evaluateRound()
      : this.orderOfPlay(wonByPlayer.seat);

    return trickData;
  }

  // private
  getTrickValue(): number {
    let value = 1;

    const cardsPlayed = this.curTrick.map((play) => play.cardPlayed);

    for (const card of cardsPlayed) {
      if (card.faceValue === 5 && card.suit === Suit.Hearts) value = value + card.faceValue;
      if (card.faceValue === 3 && card.suit === Suit.Spades) value = value - card.faceValue;
    }
    return value;
  }

  // private
  getTrickWinner(): Seat {
    const ledSuit = this.curTrick[0].cardPlayed.suit;

    const winner = this.curTrick.reduce(
      (winningCard, play): { playedBy: Seat; playValue: number } => {
        if (play.cardPlayed.suit !== ledSuit && play.cardPlayed.suit !== this.trump) {
          play.cardPlayed.playValue = 0;
        }
        if (play.cardPlayed.suit === this.trump) {
          play.cardPlayed.playValue = play.cardPlayed.faceValue + TRUMP_VALUE;
        }
        if (play.cardPlayed.suit === ledSuit && play.cardPlayed.suit !== this.trump) {
          play.cardPlayed.playValue = play.cardPlayed.faceValue;
        }
        return play.cardPlayed.playValue > winningCard.playValue
          ? { playedBy: play.playedBy, playValue: play.cardPlayed.playValue }
          : winningCard;
      },
      {
        playedBy: -1,
        playValue: -1,
      }
    );

    const trickWinner = winner.playedBy;
    return trickWinner;
  }

  // private
  updateRoundPoints(takenTrick: EvaluatedTrick, takenBy: PlayerType): void {
    const addPointsToTeam = this.roundPoints.findIndex((team) => team.teamId === takenBy.teamId);
    this.roundPoints[addPointsToTeam].points = this.roundPoints[addPointsToTeam].points + takenTrick.pointValue;
  }

  evaluateRound(): RoundTotals {
    const bid = this.isBidMade();
    const playerPoints = this.playerTrickTotals();
    const totals = { bid, roundPoints: this.roundPoints, playerPoints };

    this.endRound(totals);
    return totals;
  }

  isBidMade(): EvaluatedBid {
    // const bidTeam = this.teams.find((team) => team.teamSeats.includes(this.winningBid.bidder))!.teamId;
    const bidTeam = this.players.find((player) => player.seat === this.winningBid.bidder)!.teamId;
    let pointsMade = this.roundPoints.find((points) => points.teamId === bidTeam)!.points;

    const noBidMultiplier = this.winningBid.isTrump ? 1 : 2;
    const bidTeamPoints =
      pointsMade - this.winningBid.amount >= 0
        ? pointsMade * noBidMultiplier
        : this.winningBid.amount * noBidMultiplier * -1;

    pointsMade = bidTeamPoints;

    const totals = {
      ...this.winningBid,
      bidMade: bidTeamPoints > 0,
    };

    return totals;
  }

  playerTrickTotals(): PlayerPointTotals {
    const tricks = this.tricksTeam0.concat(this.tricksTeam1);
    const initialPoints = new Array(this.numPlayers).fill({ playerId: '', points: 0 });

    const totals = tricks.reduce((playerTricks, trick) => {
      const trickWonBy = this.playersRoundData.find((player) => player.seat === trick.trickWonBy)!;
      playerTricks[trickWonBy.seat] = {
        playerSeat: trickWonBy,
        points: playerTricks[trickWonBy.seat].points + trick.pointValue,
      };
      return playerTricks;
    }, initialPoints);

    return totals;
  }
}

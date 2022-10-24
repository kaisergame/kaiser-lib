import {
  BidAmount,
  BidType,
  CardType,
  EvaluatedBid,
  EvaluatedTrick,
  Hand,
  PlayerPointTotals,
  PlayerPosition,
  PlayerRoundData,
  PlayerType,
  RoundPointTotals,
  RoundState,
  RoundTotals,
  RoundType,
  Seat,
  Suit,
  TrickType,
} from '../@types/index';
import { Cards } from '../Cards/Cards';
import { TRUMP_VALUE } from '../constants/game';
import { HAND_SIZE } from '../constants/game';
import _ from 'lodash';

export class Round implements RoundType {
  playersRoundData: PlayerRoundData[];
  hands: Hand[];
  bids: BidType[] = [];
  winningBid: BidType = { amount: -1, bidder: '', seat: -1, isTrump: false };
  trump: Suit | null = null;
  activePlayer: PlayerPosition = { seat: -1, playerId: null };
  playableCards: CardType[] = [];
  trick: TrickType = [];
  tricksTeam0: EvaluatedTrick[] = [];
  tricksTeam1: EvaluatedTrick[] = [];
  roundPoints: RoundPointTotals = [
    { teamId: 'team0', points: 0 },
    { teamId: 'team1', points: 0 },
  ];

  constructor(
    public numRound: number,
    public numPlayers: number,
    public minBid: BidAmount,
    public players: PlayerType[],
    public dealer: PlayerPosition,
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
        isDealer: dealer.seat === player.seat,
      };
    });
    this.updateActivePlayer();
    this.endRound = endRound;
  }

  toJSON(): RoundState {
    return {
      numRound: this.numRound,
      playersRoundData: this.playersRoundData,
      numPlayers: this.numPlayers,
      dealer: this.dealer,
      hands: this.hands,
      minBid: this.minBid,
      bids: this.bids,
      winningBid: this.winningBid,
      trump: this.trump,
      activePlayer: this.activePlayer,
      playableCards: this.playableCards,
      trick: this.trick,
      tricksTeam0: this.tricksTeam0,
      tricksTeam1: this.tricksTeam1,
      roundPoints: this.roundPoints,
    };
  }

  static fromJSON(state: RoundState, endRound: (roundTotals: RoundTotals) => void): Round {
    const round = new Round(state.numRound, state.numPlayers, state.minBid, [], state.dealer, endRound);
    round.updateStateFromJSON(state);

    return round;
  }

  updateStateFromJSON(state: RoundState): void {
    this.playersRoundData = state.playersRoundData;
    this.numPlayers = state.numPlayers;
    this.dealer = state.dealer;
    this.hands = state.hands;
    this.minBid = state.minBid;
    this.bids = state.bids;
    this.winningBid = state.winningBid;
    this.trump = state.trump;
    this.activePlayer = state.activePlayer;
    this.playableCards = state.playableCards;
    this.trick = state.trick;
    this.tricksTeam0 = state.tricksTeam0;
    this.tricksTeam1 = state.tricksTeam1;
    this.roundPoints = state.roundPoints;
  }

  // CARDS
  private dealHands(): Hand[] {
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
      let suitOrder;
      if (a.suit === Suit.Hearts && a.suit === b.suit) suitOrder = 0;
      else if (a.suit === Suit.Hearts) suitOrder = -1;
      else if (b.suit === Suit.Hearts) suitOrder = 1;
      else if (a.suit === Suit.Spades && a.suit === b.suit) suitOrder = 0;
      else if (a.suit === Suit.Spades) suitOrder = -1;
      else if (b.suit === Suit.Spades) suitOrder = 1;
      else if (a.suit === Suit.Diamonds && a.suit === b.suit) suitOrder = 0;
      else if (a.suit === Suit.Diamonds) suitOrder = -1;
      else if (b.suit === Suit.Diamonds) suitOrder = 1;
      else if (a.suit === Suit.Clubs && a.suit === b.suit) suitOrder = 0;
      else if (a.suit === Suit.Clubs) suitOrder = -1;
      else if (b.suit === Suit.Clubs) suitOrder = 1;

      return !lowToHigh ? suitOrder || b.playValue - a.playValue : suitOrder || a.playValue - b.playValue;
    }
  }

  // BIDDING
  validBids(): BidAmount[] {
    const curBids = this.bids.map((bid) => bid.amount);
    const curHighBid = Math.max(...curBids);
    const noDealerPass =
      this.activePlayer.seat === this.dealer.seat && this.bids.filter((bid) => bid.amount !== 0).length === 0;

    const validBids = [
      BidAmount.Pass,
      // FIXME: Object.values is adding a string type union
      ...Object.values(BidAmount).filter((bid) =>
        _.isEqual(this.activePlayer, this.dealer)
          ? bid >= this.minBid && bid >= curHighBid
          : bid >= this.minBid && bid > curHighBid
      ),
    ];
    noDealerPass && validBids.shift();

    return validBids as BidAmount[];
  }

  setPlayerBid(bid: BidAmount): void {
    if (!this.validBids().includes(bid)) throw new Error('That bid is not valid');
    if (this.bids.find((bid) => bid.seat === this.activePlayer.seat)) throw new Error('Player has already bid');
    if (this.bids.length >= this.numPlayers) throw new Error('Bids have already been placed');

    const playerBid = {
      amount: bid,
      bidder: this.activePlayer,
      isTrump: bid % 1 === 0,
    };

    this.bids.push(playerBid);
    this.playersRoundData[this.activePlayer].bid = playerBid.amount;
    if (this.bids.length === this.numPlayers) {
      this.setWinningBid();
    } else {
      this.updateActivePlayer();
    }
  }

  biddingOpen(): boolean {
    console.log('checking bidding open');
    if (this.bids.length >= this.numPlayers) return false;
    console.log('bid length is good', this.winningBid.bidder);
    if (this.winningBid.bidder >= 0) return false;
    console.log('no winning bidder');
    return true;
  }

  findBidForPlayer(player: number): BidType | null {
    const bid = this.bids.find((bid) => bid.bidder === player);

    return bid || null;
  }

  setWinningBid(): BidType {
    const winningBid = this.bids.reduce(
      (highBid, bid): { bidder: number; amount: BidAmount; isTrump: boolean } => {
        return bid.amount >= highBid.amount
          ? { bidder: bid.bidder, amount: bid.amount, isTrump: bid.amount % 1 === 0 }
          : highBid;
      },
      { bidder: -1, amount: -1, isTrump: false }
    );

    this.winningBid = winningBid;
    this.updateActivePlayer(winningBid.bidder);

    return winningBid;
  }

  setTrump(trump: Suit): void {
    if (!this.winningBid.isTrump) throw new Error('Trump cannot be called on a no trump bid');
    this.trump = trump;
  }

  getTrump(): Suit | null {
    return this.trump;
  }

  // CARD PLAY
  updateActivePlayer(makeActivePlayer?: Seat): Seat {
    let nextActivePlayer = -1;

    if (typeof makeActivePlayer === 'undefined') {
      // init bidding
      if (this.activePlayer === -1 && this.bids.length === 0)
        nextActivePlayer = this.dealer + 1 < this.numPlayers ? this.dealer + 1 : 0;

      // advance play around table
      if (nextActivePlayer === -1)
        nextActivePlayer = this.validateSeat(this.activePlayer + 1) ? this.activePlayer + 1 : 0;
    }

    // specific player to play (bid or trick is won)
    if (this.validateSeat(makeActivePlayer)) nextActivePlayer = makeActivePlayer!;
    if (!this.validateSeat(nextActivePlayer)) throw new Error(`There is no player asigned to seat ${nextActivePlayer}`);

    this.activePlayer = nextActivePlayer;
    this.setPlayableCards(this.hands[nextActivePlayer]);

    return nextActivePlayer;
  }

  private validateSeat(numSeat: Seat | undefined): boolean {
    return typeof numSeat === 'number' && numSeat < this.numPlayers && numSeat >= 0;
  }

  setPlayableCards(hand: Hand): Hand {
    const ledSuit = this.trick[0]?.cardPlayed.suit;
    const followSuit = hand.filter((card) => card.suit === ledSuit);
    const playable = followSuit.length > 0 ? followSuit : hand;

    this.playableCards = playable;
    return playable;
  }

  playCard(cardPlayed: CardType): void {
    if (this.bids.length !== this.numPlayers) throw new Error('Game requires 4 players for play');
    if (this.activePlayer === -1) throw new Error(`There is no player in seat ${this.activePlayer}`);
    if (!this.playableCards.includes(cardPlayed))
      throw new Error(`${cardPlayed} cannot be played by ${this.activePlayer}; they must play ${this.playableCards}`);
    if (this.trick.find((card) => card.playedBy === this.activePlayer))
      throw new Error(`Player ${this.activePlayer} has already played a card in this trick`);
    if (this.winningBid.isTrump && !this.trump) throw new Error('Trump must be set before card play');

    this.removeCardFromHand(cardPlayed);
    this.updateCardsPlayed(cardPlayed);
    this.endPlayerTurn();
  }

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

  updateCardsPlayed(cardPlayed: CardType): TrickType {
    const play = {
      cardPlayed,
      playedBy: this.activePlayer,
    };
    const updatedTrick = [...this.trick];
    updatedTrick.push(play);

    this.trick = updatedTrick;
    return updatedTrick;
  }

  endPlayerTurn(): void {
    this.resetPlayableCards();

    if (this.trick.length > this.numPlayers) throw new Error('Too many cards were played');
    if (this.trick.length < this.numPlayers) this.updateActivePlayer();
    if (this.trick.length === this.numPlayers) this.endTrick();
  }

  private resetPlayableCards(): void {
    this.playableCards = [];
  }

  endTrick(): EvaluatedTrick {
    const pointValue = this.getTrickValue();
    const trickWinner = this.getTrickWinner();
    const trickEvaluation = {
      pointValue: pointValue,
      cardsPlayed: this.trick,
      trickWonBy: trickWinner,
    };

    const wonByPlayer = this.playersRoundData.find((player) => player.seat === trickWinner)!;
    if (wonByPlayer.teamId === 'team0') this.tricksTeam0.push(trickEvaluation);
    if (wonByPlayer.teamId === 'team1') this.tricksTeam1.push(trickEvaluation);

    this.updateRoundPoints(trickEvaluation, wonByPlayer);
    this.resetTrick();

    this.tricksTeam0.length + this.tricksTeam1.length === HAND_SIZE
      ? this.evaluateRound()
      : this.updateActivePlayer(trickWinner);

    return trickEvaluation;
  }

  private getTrickValue(): number {
    let value = 1;

    const cardsPlayed = this.trick.map((play) => play.cardPlayed);

    for (const card of cardsPlayed) {
      if (card.faceValue === 5 && card.suit === Suit.Hearts) value = value + card.faceValue;
      if (card.faceValue === 3 && card.suit === Suit.Spades) value = value - card.faceValue;
    }
    return value;
  }

  private getTrickWinner(): Seat {
    const ledSuit = this.trick[0].cardPlayed.suit;

    const winner = this.trick.reduce(
      (winningCard, play): { playedBy: Seat; playValue: number } => {
        if (play.cardPlayed.suit !== ledSuit && play.cardPlayed.suit !== this.trump) {
          play.cardPlayed.playValue = 0;
        }
        if (play.cardPlayed.suit === this.trump) {
          play.cardPlayed.playValue = play.cardPlayed.playValue + TRUMP_VALUE;
        }
        if (play.cardPlayed.suit === ledSuit && play.cardPlayed.suit !== this.trump) {
          play.cardPlayed.playValue = play.cardPlayed.playValue;
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

    if (!this.validateSeat(winner.playedBy))
      throw new Error(`Could not determine who won the trick ${winner.playedBy}`);
    const trickWinner = winner.playedBy;
    return trickWinner;
  }

  private updateRoundPoints(takenTrick: EvaluatedTrick, takenBy: PlayerType): void {
    const addPointsToTeam = this.roundPoints.findIndex((team) => team.teamId === takenBy.teamId);
    this.roundPoints[addPointsToTeam].points = this.roundPoints[addPointsToTeam].points + takenTrick.pointValue;
  }

  private resetTrick(): void {
    this.trick = [];
  }

  evaluateRound(): RoundTotals {
    const bid = this.isBidMade();
    const playerPoints = this.playerTrickTotals();
    const totals = { bid, roundPoints: this.roundPoints, playerPoints };

    this.endRound(totals);
    return totals;
  }

  private isBidMade(): EvaluatedBid {
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

  private playerTrickTotals(): PlayerPointTotals {
    const tricks = this.tricksTeam0.concat(this.tricksTeam1);
    const initialPoints = [];

    for (let i = 0; i < this.numPlayers; i++) {
      initialPoints.push({ playerSeat: i, points: 0 });
    }

    const totals = tricks.reduce((playerTricks, trick) => {
      const trickWonBy = this.playersRoundData.find((player) => player.seat === trick.trickWonBy)!;
      playerTricks[trickWonBy.seat] = {
        playerSeat: trickWonBy.seat,
        points: playerTricks[trickWonBy.seat].points + trick.pointValue,
      };
      return playerTricks;
    }, initialPoints);

    return totals;
  }

  // todo test this
  canBid(playerId: string): boolean {
    if (!this.biddingOpen()) return false;

    if (!this.isActivePlayer(playerId)) return false;

    if (this.findBidForPlayer(this.activePlayer)) return false;

    return true;
  }

  // todo test this
  canSetTrump(playerId: string): boolean {
    if (this.biddingOpen()) return false;

    if (!this.isActivePlayer(playerId)) return false;

    if (this.getTrump()) return false;

    if (this.winningBid.bidder !== this.activePlayer) return false;

    return true;
  }

  isActivePlayer(playerId: string): boolean {
    const activePlayer = this.getActivePlayer();

    return Boolean(activePlayer && activePlayer.playerId === playerId);
  }

  getActivePlayer(): PlayerType | null {
    if (!this?.activePlayer) return null;

    return this.players[this.activePlayer];
  }
}

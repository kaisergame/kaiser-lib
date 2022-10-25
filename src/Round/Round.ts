import { findPlayerById, findPlayerBySeat } from 'src/utils/helpers';
import {
  BidAmount,
  BidType,
  CardType,
  EvaluatedBid,
  EvaluatedTrick,
  Hand,
  PlayerHand,
  PlayerId,
  PlayerPointTotals,
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
import { validateSeat } from 'src/utils/helpers';

export class Round implements RoundType {
  hands: PlayerHand[];
  bids: BidType[] = [];
  winningBid: BidType = { amount: -1, bidder: '', seat: -1, isTrump: false };
  trump: Suit | null = null;
  activePlayer: PlayerType;
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
    public dealer: PlayerType,
    public endRound: (roundTotals: RoundTotals) => void
  ) {
    this.numRound = numRound;
    this.numPlayers = numPlayers;
    this.minBid = minBid;
    this.dealer = dealer;
    this.hands = this.dealHands();
    this.players = players;
    this.activePlayer = this.updateActivePlayer();
    this.endRound = endRound;
  }

  toJSON(): RoundState {
    return {
      numRound: this.numRound,
      players: this.players,
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
    this.players = state.players;
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
  private dealHands(): PlayerHand[] {
    const cards = new Cards(this.numPlayers);
    const deck = cards.shuffleDeck(cards.createDeck());
    const hands: PlayerHand[] = [];
    let dealToSeat = 0;

    for (let i = 0; i < this.numPlayers; i++) {
      hands.push({ playerId: this.players[i].playerId!, hand: [] });
    }
    for (const card of deck) {
      hands[dealToSeat].hand.push(card);
      dealToSeat !== this.numPlayers - 1 ? dealToSeat++ : (dealToSeat = 0);
    }

    return hands;
  }

  sortHands(lowToHigh?: 'lowToHigh'): void {
    for (const playerHand of this.hands) {
      playerHand.hand.sort(cardSort);
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
    const isDealer = this.activePlayer.playerId === this.dealer.playerId;
    const noDealerPass = isDealer && this.bids.filter((bid) => bid.amount !== 0).length === 0;

    const validBids = [
      BidAmount.Pass,
      // FIXME: Object.values is adding a string type union
      ...Object.values(BidAmount).filter((bid) =>
        isDealer ? bid >= this.minBid && bid >= curHighBid : bid >= this.minBid && bid > curHighBid
      ),
    ];
    noDealerPass && validBids.shift();

    return validBids as BidAmount[];
  }

  setPlayerBid(bid: BidAmount, isTrump: boolean): void {
    if (!this.validBids().includes(bid)) throw new Error('That bid is not valid');
    if (this.bids.find((bid) => bid.bidder === this.activePlayer.playerId)) throw new Error('Player has already bid');
    if (this.bids.length >= this.numPlayers) throw new Error('Bids have already been placed');

    const playerBid = {
      amount: bid,
      bidder: this.activePlayer.playerId!,
      seat: this.activePlayer.seat,
      isTrump,
    };

    this.bids.push(playerBid);
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
    if (this.winningBid.bidder) return false;
    console.log('no winning bidder');
    return true;
  }

  findPlayerBid(playerId: PlayerId): BidType | null {
    const bid = this.bids.find((bid) => bid.bidder === playerId);

    return bid || null;
  }

  setWinningBid(): BidType {
    const winningBid = this.bids.reduce(
      (highBid, bid): { bidder: PlayerId; amount: BidAmount; seat: Seat; isTrump: boolean } => {
        return bid.amount >= highBid.amount ? bid : highBid;
      },
      { bidder: '', amount: -1, seat: -1, isTrump: false }
    );

    this.winningBid = winningBid;
    this.updateActivePlayer(winningBid.seat);

    return winningBid;
  }

  setTrump(trump: Suit): void {
    if (!this.winningBid.isTrump) throw new Error('Trump cannot be called on a no trump bid');
    if (this.winningBid.bidder !== this.activePlayer.playerId)
      throw new Error('Trump can only be called by bid winner');
    this.trump = trump;
  }

  getTrump(): Suit | null {
    return this.trump;
  }

  // CARD PLAY
  updateActivePlayer(makeActivePlayer?: Seat): PlayerType {
    let nextActiveSeat = -1;

    // init bidding
    if (typeof makeActivePlayer === 'undefined' && this.activePlayer.seat === -1 && this.bids.length === 0)
      nextActiveSeat = this.dealer.seat + 1 < this.numPlayers ? this.dealer.seat + 1 : 0;

    // advance play around table
    if (typeof makeActivePlayer === 'undefined' && nextActiveSeat === -1)
      nextActiveSeat = validateSeat(this.activePlayer.seat + 1) ? this.activePlayer.seat + 1 : 0;

    // specific player to play (bid or trick is won)
    if (validateSeat(makeActivePlayer)) nextActiveSeat = makeActivePlayer!;
    if (!validateSeat(nextActiveSeat)) throw new Error(`There is no player asigned to seat ${nextActiveSeat}`);

    const nextPlayer = findPlayerBySeat(this.players, nextActiveSeat);
    this.activePlayer = nextPlayer;
    this.setPlayableCards(this.hands[nextActiveSeat].hand);

    return nextPlayer;
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
    if (!validateSeat(this.activePlayer.seat)) throw new Error(`There is no player in seat ${this.activePlayer.seat}`);
    if (!this.playableCards.includes(cardPlayed))
      throw new Error(`${cardPlayed} cannot be played by ${this.activePlayer}; they must play ${this.playableCards}`);
    if (this.trick.find((card) => card.playedBy === this.activePlayer.playerId))
      throw new Error(`Player ${this.activePlayer} has already played a card in this trick`);
    if (this.winningBid.isTrump && !this.trump) throw new Error('Trump must be set before card play');

    this.removeCardFromHand(cardPlayed);
    this.updateCardsPlayed(cardPlayed);
    this.endPlayerTurn();
  }

  removeCardFromHand(cardPlayed: CardType): Hand {
    // const hand = [...this.hands[this.activePlayer.seat].hand];
    const hand = this.hands.find((playerHand) => playerHand.playerId === this.activePlayer.playerId)!.hand;
    const cardIndex = hand.indexOf(cardPlayed);

    if (cardIndex !== -1) {
      hand.splice(cardIndex, 1);
      // this.hands[this.activePlayer] = hand;
    } else throw new Error('Card not in hand');

    return hand;
  }

  updateCardsPlayed(cardPlayed: CardType): TrickType {
    const play = {
      cardPlayed,
      playedBy: this.activePlayer.playerId!,
      seat: this.activePlayer.seat,
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

    const wonByPlayer = this.players.find((player) => player.seat === trickWinner.seat)!;
    if (wonByPlayer.teamId === 'team0') this.tricksTeam0.push(trickEvaluation);
    if (wonByPlayer.teamId === 'team1') this.tricksTeam1.push(trickEvaluation);

    this.updateRoundPoints(trickEvaluation, wonByPlayer);
    this.resetTrick();

    this.tricksTeam0.length + this.tricksTeam1.length === HAND_SIZE
      ? this.evaluateRound()
      : this.updateActivePlayer(trickWinner.seat);

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

  private getTrickWinner(): PlayerType {
    const ledSuit = this.trick[0].cardPlayed.suit;

    const winner = this.trick.reduce(
      (winningCard, play): { playedBy: PlayerId; seat: Seat; playValue: number } => {
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
          ? { playedBy: play.playedBy, seat: play.seat, playValue: play.cardPlayed.playValue }
          : winningCard;
      },
      {
        playedBy: '',
        seat: -1,
        playValue: -1,
      }
    );

    if (!validateSeat(winner.seat)) throw new Error(`Could not determine who won the trick ${winner.playedBy}`);
    const trickWinner = findPlayerById(this.players, winner.playedBy);
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
    const bidTeam = this.players.find((player) => player.playerId === this.winningBid.bidder)!.teamId;
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
      const trickWonBy = this.players.find((player) => player.playerId === trick.trickWonBy.playerId)!;
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
    if (this.findPlayerBid(this.activePlayer.playerId!)) return false;

    return true;
  }

  // todo test this
  canSetTrump(playerId: string): boolean {
    if (this.biddingOpen()) return false;
    if (!this.isActivePlayer(playerId)) return false;
    if (this.getTrump()) return false;
    if (this.winningBid.bidder !== this.activePlayer.playerId) return false;

    return true;
  }

  isActivePlayer(playerId: string): boolean {
    const activePlayer = this.getActivePlayer();

    return Boolean(activePlayer && activePlayer.playerId === playerId);
  }

  getActivePlayer(): PlayerType | null {
    if (!this?.activePlayer) return null;

    return this.players[this.activePlayer.seat];
  }
}

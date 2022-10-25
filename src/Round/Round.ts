import { findPlayerById, findPlayerByPlayerIndex } from 'src/utils/helpers';
import {
  BidAmount,
  BidType,
  CardType,
  EvaluatedTrick,
  PlayerHand,
  PlayerId,
  PlayerPointTotals,
  PlayerType,
  RoundPointTotals,
  RoundState,
  RoundSummary,
  RoundType,
  PlayerIndex,
  Suit,
  TrickType,
  Trump,
  NoSuit,
} from '../@types/index';
import { Cards } from '../Cards/Cards';
import { TRUMP_VALUE } from '../constants/game';
import { HAND_SIZE } from '../constants/game';
import { validatePlayerIndex } from 'src/utils/helpers';

export class Round implements RoundType {
  hands: PlayerHand[] = [];
  bids: BidType[] = [];
  winningBid: BidType = { amount: -1, bidder: '', playerIndex: -1, isTrump: false };
  trump: Trump | null = null;
  activePlayerIndex: PlayerIndex = -1;
  playableCards: CardType[] = [];
  trick: TrickType = [];
  tricksTeam0: EvaluatedTrick[] = [];
  tricksTeam1: EvaluatedTrick[] = [];
  roundPoints: RoundPointTotals = [
    { teamId: 'team0', points: 0 },
    { teamId: 'team1', points: 0 },
  ];

  constructor(
    public roundNum: number,
    public numPlayers: number,
    public minBid: BidAmount,
    public players: PlayerType[],
    public dealerIndex: PlayerIndex,
    public endRound: (roundSummary: RoundSummary) => void
  ) {
    this.roundNum = roundNum;
    this.numPlayers = numPlayers;
    this.minBid = minBid;
    this.dealerIndex = dealerIndex;
    this.players = players;
    this.endRound = endRound;

    this.dealHands();
    this.updateActivePlayer();
  }

  toJSON(): RoundState {
    return {
      roundNum: this.roundNum,
      players: this.players,
      numPlayers: this.numPlayers,
      dealerIndex: this.dealerIndex,
      hands: this.hands,
      minBid: this.minBid,
      bids: this.bids,
      winningBid: this.winningBid,
      trump: this.trump,
      activePlayerIndex: this.activePlayerIndex,
      playableCards: this.playableCards,
      trick: this.trick,
      tricksTeam0: this.tricksTeam0,
      tricksTeam1: this.tricksTeam1,
      roundPoints: this.roundPoints,
    };
  }

  static fromJSON(state: RoundState, endRound: (roundSummary: RoundSummary) => void): Round {
    const round = new Round(state.roundNum, state.numPlayers, state.minBid, [], state.dealerIndex, endRound);
    round.updateStateFromJSON(state);

    return round;
  }

  updateStateFromJSON(state: RoundState): void {
    this.players = state.players;
    this.numPlayers = state.numPlayers;
    this.dealerIndex = state.dealerIndex;
    this.hands = state.hands;
    this.minBid = state.minBid;
    this.bids = state.bids;
    this.winningBid = state.winningBid;
    this.trump = state.trump;
    this.activePlayerIndex = state.activePlayerIndex;
    this.playableCards = state.playableCards;
    this.trick = state.trick;
    this.tricksTeam0 = state.tricksTeam0;
    this.tricksTeam1 = state.tricksTeam1;
    this.roundPoints = state.roundPoints;
  }

  // CARDS
  private dealHands(): void {
    const cards = new Cards(this.numPlayers);
    const deck = cards.shuffleDeck(cards.createDeck());
    const hands: PlayerHand[] = [];
    let dealToPlayerIndex = 0;

    for (let i = 0; i < this.numPlayers; i++) {
      hands.push({ playerId: this.players[i].playerId!, hand: [] });
    }
    for (const card of deck) {
      hands[dealToPlayerIndex].hand.push(card);
      dealToPlayerIndex !== this.numPlayers - 1 ? dealToPlayerIndex++ : (dealToPlayerIndex = 0);
    }

    this.hands = hands;
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

    const isDealer = this.getPlayer().playerId === this.getPlayer(this.dealerIndex).playerId;
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

  setPlayerBid(playerId: PlayerId, bid: BidAmount, isTrump: boolean): void {
    if (!this.canBid(playerId)) return;
    if (!this.validBids().includes(bid)) return;

    const player = this.getPlayer();
    const playerBid = {
      amount: bid,
      bidder: player.playerId!,
      playerIndex: player.playerIndex,
      isTrump,
    };

    this.bids.push(playerBid);
    if (this.bids.length === this.numPlayers) {
      this.setWinningBid();
    } else {
      this.updateActivePlayer();
    }
  }

  canBid(playerId: string): boolean {
    if (this.bids.find((bid) => bid.playerIndex === this.activePlayerIndex)) return false;
    if (this.bids.length >= this.numPlayers) return false;
    if (this.bids.length >= this.numPlayers) return false;
    if (this.winningBid.bidder) return false;
    if (!this.isActivePlayer(playerId)) return false;
    if (this.bids.findIndex((bid) => bid.bidder === playerId) < 0) return false;

    return true;
  }

  setWinningBid(): BidType {
    const winningBid = this.bids.reduce(
      (highBid, bid): { bidder: PlayerId; amount: BidAmount; playerIndex: PlayerIndex; isTrump: boolean } => {
        return bid.amount >= highBid.amount ? bid : highBid;
      },
      { bidder: '', amount: -1, playerIndex: -1, isTrump: false }
    );

    this.winningBid = winningBid;
    !winningBid.isTrump && this.setTrump(NoSuit.NoTrump);
    this.updateActivePlayer(winningBid.playerIndex);

    return winningBid;
  }

  canSetTrump(playerId: string): boolean {
    if (!this.winningBid.isTrump) return false;
    if (this.winningBid.bidder !== this.getPlayer().playerId) return false;
    if (this.winningBid.playerIndex !== this.activePlayerIndex) return false;
    if (!this.isActivePlayer(playerId)) return false;
    if (this.trump) return false;
    if (this.winningBid.bidder !== playerId) return false;

    return true;
  }

  setTrump(trump: Trump): void {
    this.trump = trump;
  }

  // CARD PLAY
  updateActivePlayer(makeActivePlayer?: PlayerIndex): void {
    // init bidding
    if (typeof makeActivePlayer === 'undefined' && this.activePlayerIndex === -1 && this.bids.length === 0)
      this.activePlayerIndex = this.dealerIndex + 1 < this.numPlayers ? this.dealerIndex + 1 : 0;

    // advance play around table
    if (typeof makeActivePlayer === 'undefined' && this.bids.length !== 0)
      this.activePlayerIndex = validatePlayerIndex(this.activePlayerIndex + 1) ? this.activePlayerIndex + 1 : 0;

    // specific player to play (bid or trick is won)
    if (validatePlayerIndex(makeActivePlayer)) this.activePlayerIndex = makeActivePlayer!;

    this.setPlayableCards();
  }

  getPlayer(playerIndex: PlayerIndex = this.activePlayerIndex): PlayerType {
    return this.players[playerIndex];
  }

  isActivePlayer(playerId: string): boolean {
    const activePlayer = this.getPlayer();
    return activePlayer.playerId === playerId;
  }

  setPlayableCards(): CardType[] {
    const hand = this.hands[this.activePlayerIndex].hand;
    const ledSuit = this.trick[0]?.cardPlayed.suit;
    const followSuit = hand.filter((card) => card.suit === ledSuit);
    const playable = followSuit.length > 0 ? followSuit : hand;

    this.playableCards = playable;
    return playable;
  }

  canPlayCard(id: PlayerId, cardPlayed: CardType): boolean {
    if (!this.trump) return false;
    if (this.trick.length > this.numPlayers) return false;
    if (this.bids.length !== this.numPlayers) return false;
    if (!validatePlayerIndex(this.activePlayerIndex)) return false;
    if (!this.isActivePlayer(id)) return false;
    if (!this.playableCards.includes(cardPlayed)) return false;
    if (this.trick.find((card) => card.playedBy === this.getPlayer().playerId)) return false;
    if (this.hands[this.activePlayerIndex].hand.indexOf(cardPlayed) === -1) return false;

    return true;
  }

  playCard(playerId: PlayerId, cardPlayed: CardType): void {
    if (!this.canPlayCard(playerId, cardPlayed)) return;

    this.removeCardFromHand(cardPlayed);
    this.updateCardsPlayed(cardPlayed);
    this.endPlayerTurn();
  }

  removeCardFromHand(cardPlayed: CardType): boolean {
    const hand = this.hands[this.activePlayerIndex].hand;
    const cardIndex = hand.indexOf(cardPlayed);

    if (cardIndex !== -1) hand.splice(cardIndex, 1);

    return cardIndex > 0;
  }

  updateCardsPlayed(cardPlayed: CardType): TrickType {
    const player = this.getPlayer();
    const play = {
      cardPlayed,
      playedBy: player.playerId!,
      playerIndex: player.playerIndex,
    };
    const updatedTrick = [...this.trick];
    updatedTrick.push(play);

    this.trick = updatedTrick;
    return updatedTrick;
  }

  endPlayerTurn(): void {
    this.resetPlayableCards();

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

    const wonByPlayer = this.players.find((player) => player.playerIndex === trickWinner.playerIndex)!;
    if (wonByPlayer.teamId === 'team0') this.tricksTeam0.push(trickEvaluation);
    if (wonByPlayer.teamId === 'team1') this.tricksTeam1.push(trickEvaluation);

    this.updateRoundPoints(trickEvaluation, wonByPlayer);
    this.resetTrick();

    this.tricksTeam0.length + this.tricksTeam1.length === HAND_SIZE
      ? this.evaluateRound()
      : this.updateActivePlayer(trickWinner.playerIndex);

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
      (winningCard, play): { playedBy: PlayerId; playerIndex: PlayerIndex; playValue: number } => {
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
          ? { playedBy: play.playedBy, playerIndex: play.playerIndex, playValue: play.cardPlayed.playValue }
          : winningCard;
      },
      {
        playedBy: '',
        playerIndex: -1,
        playValue: -1,
      }
    );

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

  evaluateRound(): RoundSummary {
    const isBidMade = this.isBidMade();
    const playerPoints = this.playerTrickTotals();
    const totals = {
      roundNum: this.roundNum,
      winningBid: this.winningBid,
      trump: this.trump!,
      isBidMade,
      roundPoints: this.roundPoints,
      playerPoints,
    };

    this.endRound(totals);
    return totals;
  }

  private isBidMade(): boolean {
    const bidTeam = this.players.find((player) => player.playerId === this.winningBid.bidder)!.teamId;
    let pointsMade = this.roundPoints.find((points) => points.teamId === bidTeam)!.points;

    const noBidMultiplier = this.winningBid.isTrump ? 1 : 2;
    const bidTeamPoints =
      pointsMade - this.winningBid.amount >= 0
        ? pointsMade * noBidMultiplier
        : this.winningBid.amount * noBidMultiplier * -1;

    pointsMade = bidTeamPoints;
    return bidTeamPoints > 0;
  }

  private playerTrickTotals(): PlayerPointTotals {
    const tricks = this.tricksTeam0.concat(this.tricksTeam1);
    const initialPoints: PlayerPointTotals = [];

    for (let i = 0; i < this.numPlayers; i++) {
      initialPoints.push({ playerId: this.players[i].playerId!, playerIndex: i, points: 0 });
    }

    const totals = tricks.reduce((playerTricks, trick): PlayerPointTotals => {
      const trickWonBy = this.players.find((player) => player.playerId === trick.trickWonBy.playerId)!;
      playerTricks[trickWonBy.playerIndex] = {
        ...playerTricks[trickWonBy.playerIndex],
        points: playerTricks[trickWonBy.playerIndex].points + trick.pointValue,
      };
      return playerTricks;
    }, initialPoints);

    return totals;
  }

  // todo test this

  // todo test this
}

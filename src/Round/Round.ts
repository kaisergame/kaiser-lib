import { findPlayerById } from 'src/utils/helpers';
import {
  BidAmount,
  BidValue,
  BidType,
  CardType,
  EvaluatedTrick,
  PlayerHand,
  PlayerId,
  PlayerPoints,
  PlayerType,
  RoundState,
  RoundSummary,
  RoundType,
  PlayerIndex,
  Suit,
  TrickType,
  Trump,
  TeamId,
  TeamTotals,
} from 'src/@types/index';
import { Cards } from 'src/Cards/Cards';
import { TRUMP_VALUE, TROIKA_POINTS, KAISER_POINTS, MISSED_BID, HAND_SIZE, TRANSLATE_BID } from 'src/constants/game';
import { validatePlayerIndex } from 'src/utils/helpers';

export class Round implements RoundType {
  hands: PlayerHand[] = [];
  bids: BidType[] = [];
  winningBid: BidType = { bidAmount: -1, bidValue: -1, bidder: { playerId: '', playerIndex: -1 }, isTrump: false };
  trump: Trump | null = null;
  activePlayerIndex: PlayerIndex = -1;
  playableCards: CardType[] = [];
  trickIndex: number = 1;
  trick: TrickType = [];
  teamTotals: TeamTotals = [
    { teamId: 'team0', points: 0, tricks: [] },
    { teamId: 'team1', points: 0, tricks: [] },
  ];

  constructor(
    public roundIndex: number,
    public numPlayers: number,
    public minBid: BidAmount,
    public players: PlayerType[],
    public dealerIndex: PlayerIndex,
    public endRound: (roundSummary: RoundSummary) => void
  ) {
    this.roundIndex = roundIndex;
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
      roundIndex: this.roundIndex,
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
      trickIndex: this.trickIndex,
      trick: this.trick,
      teamTotals: this.teamTotals,
    };
  }

  static fromJSON(state: RoundState, endRound: (roundSummary: RoundSummary) => void): Round {
    const round = new Round(state.roundIndex, state.numPlayers, state.minBid, [], state.dealerIndex, endRound);
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
    this.teamTotals = state.teamTotals;
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
  getValidBidValues(): BidValue[] {
    const curBids = this.bids.map((bid) => bid.bidValue);
    const curHighBid = Math.max(...curBids);

    const isDealer = this.getPlayer().playerId === this.getPlayer(this.dealerIndex).playerId;
    const noDealerPass = isDealer && this.bids.filter((bid) => bid.bidValue !== 0).length === 0;
    const BidValues = Object.values(BidValue) as BidValue[];
    const validBidValues = [
      BidValue.Pass,
      ...BidValues.filter((bid) =>
        isDealer
          ? bid >= this.minBid * TRANSLATE_BID && bid >= curHighBid
          : bid >= this.minBid * TRANSLATE_BID && bid > curHighBid
      ),
    ];

    noDealerPass && validBidValues.shift();

    return validBidValues;
  }

  canBid(playerId: string): boolean {
    if (this.bids.length >= this.numPlayers) return false;
    if (this.winningBid.bidder.playerId.length) return false;
    if (!this.isActivePlayer(playerId)) return false;
    if (this.bids.find((bid) => bid.bidder.playerIndex === this.activePlayerIndex || bid.bidder.playerId === playerId))
      return false;

    return true;
  }

  setPlayerBid(playerId: PlayerId, bidValue: BidValue): void {
    if (!this.canBid(playerId)) return;
    if (!this.getValidBidValues().includes(bidValue)) return;

    const { playerId: id, playerIndex } = this.getPlayer();
    const playerBid = {
      bidder: { playerId: id!, playerIndex },
      bidAmount: bidValue > 0 ? Math.floor(bidValue / TRANSLATE_BID) : 0,
      bidValue: bidValue,
      isTrump: bidValue % TRANSLATE_BID === 0,
    };
    this.bids.push(playerBid);

    if (this.bids.length === this.numPlayers) this.setWinningBid();
    else this.updateActivePlayer();
  }

  setWinningBid(): BidType {
    const winningBid = this.bids.reduce((highBid, bid): BidType => (bid.bidValue >= highBid.bidValue ? bid : highBid), {
      bidder: { playerId: '', playerIndex: -1 },
      bidAmount: -1,
      bidValue: -1,
      isTrump: false,
    });

    this.winningBid = winningBid;
    this.updateActivePlayer(winningBid.bidder.playerIndex);
    !winningBid.isTrump && this.setTrump(winningBid.bidder.playerId, 'NO_TRUMP');

    return winningBid;
  }

  canSetTrump(playerId: string): boolean {
    if (this.trump) return false;
    if (!this.winningBid.isTrump) return false;
    if (this.winningBid.bidder.playerId !== playerId) return false;
    if (this.winningBid.bidder.playerIndex !== this.activePlayerIndex) return false;
    if (this.winningBid.bidder.playerId !== this.getPlayer().playerId) return false;
    if (!this.isActivePlayer(playerId)) return false;
    return true;
  }

  setTrump(playerId: PlayerId, trump: Trump): void {
    if (!this.canSetTrump(playerId)) return;

    this.trump = trump;
  }

  getTrump(): Trump | null {
    return this.trump;
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

    this.winningBid.bidder.playerId.length && this.setPlayableCards();
  }

  getPlayer(playerData?: PlayerIndex | PlayerId): PlayerType {
    if (typeof playerData === 'number') return this.players[playerData];
    if (typeof playerData === 'string') return this.players.find((player) => player.playerId === playerData)!;
    return this.players[this.activePlayerIndex];
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
    this.trick.length === this.numPlayers ? this.endTrick() : this.updateActivePlayer();
  }

  private resetPlayableCards(): void {
    this.playableCards = [];
  }

  endTrick(): EvaluatedTrick {
    const trickPointValue = this.getTrickValue();
    const trickWinner = this.getTrickWinner();
    const evaluatedTrick = this.evaluateTrick(trickPointValue, trickWinner);

    this.updateTeamPoints(evaluatedTrick.trickWonBy.teamId, evaluatedTrick.pointValue);
    this.updateTeamTricks(evaluatedTrick.trickWonBy.teamId, evaluatedTrick);
    this.resetTrick();

    this.trickIndex === HAND_SIZE ? this.evaluateRound() : this.updateActivePlayer(trickWinner.playerIndex);
    this.trickIndex < HAND_SIZE && this.incrementTrickIndex();

    return evaluatedTrick;
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

  evaluateTrick(trickPointValue: number, trickWinner: PlayerType): EvaluatedTrick {
    return {
      trick: this.trick,
      pointValue: trickPointValue,
      trickWonBy: trickWinner,
    };
  }

  getTeamTotals(teamId: TeamId) {
    return this.teamTotals.find((team) => team.teamId === teamId)!;
  }

  private updateTeamPoints(teamId: TeamId, trickValue: number): void {
    const teamTotals = this.getTeamTotals(teamId);
    teamTotals.points = teamTotals.points + trickValue;
  }

  updateTeamTricks(teamId: TeamId, takenTrick: EvaluatedTrick): void {
    const teamTotals = this.getTeamTotals(teamId);
    teamTotals.tricks.push(takenTrick);
  }

  private resetTrick(): void {
    this.trick = [];
  }

  incrementTrickIndex(): void {
    this.trickIndex++;
  }

  evaluateRound(): RoundSummary {
    const { isBidMade } = this.evaluateBid();
    const playerPoints = this.playerTrickTotals();
    const teamPoints = this.teamTotals.map((team) => ({ teamId: team.teamId, points: team.points }));
    const totals = {
      roundIndex: this.roundIndex,
      winningBid: this.winningBid,
      trump: this.trump!,
      isBidMade,
      teamPoints,
      playerPoints,
    };

    this.endRound(totals);
    return totals;
  }

  evaluateBid(): { isBidMade: boolean; bidTeamPoints: number } {
    const bidTeamId = this.getPlayer(this.winningBid.bidder.playerId)!.teamId;
    const { isBidMade, tricksValue } = this.isBidMade(bidTeamId);
    const bidTeamPoints = this.getTeamPoints(isBidMade, tricksValue);

    const bidTeam = this.teamTotals.find((team) => team.teamId === bidTeamId)!;
    bidTeam.points = bidTeamPoints;
    return { isBidMade, bidTeamPoints };
  }

  getTeamPoints(isBidMade: boolean, tricksValue: number): number {
    const isTroika = this.winningBid.bidValue % 10 === 7;
    const isKaiser = this.winningBid.bidValue % 10 === 9;
    const noBidMultiplier = this.winningBid.isTrump ? 1 : 2;

    if (isTroika) return isBidMade ? TROIKA_POINTS : TROIKA_POINTS * MISSED_BID;
    if (isKaiser) return isBidMade ? KAISER_POINTS : KAISER_POINTS * MISSED_BID;
    return isBidMade ? tricksValue * noBidMultiplier : this.winningBid.bidAmount * noBidMultiplier * MISSED_BID;
  }

  private isBidMade(bidTeamId: TeamId): { isBidMade: boolean; tricksValue: number } {
    const tricksValue = this.teamTotals.find((points) => points.teamId === bidTeamId)!.points;
    const isBidMade = tricksValue - this.winningBid.bidAmount >= 0;

    return { isBidMade, tricksValue };
  }

  private playerTrickTotals(): PlayerPoints {
    const tricks = this.teamTotals.flatMap((team) => team.tricks);
    const initialPoints: PlayerPoints = [];

    for (let i = 0; i < this.numPlayers; i++) {
      initialPoints.push({ playerId: this.players[i].playerId!, playerIndex: i, points: 0 });
    }

    const totals = tricks.reduce((playerTricks, trick): PlayerPoints => {
      const trickWonBy = this.getPlayer(trick.trickWonBy.playerId!)!;
      playerTricks[trickWonBy.playerIndex] = {
        ...playerTricks[trickWonBy.playerIndex],
        points: playerTricks[trickWonBy.playerIndex].points + trick.pointValue,
      };
      return playerTricks;
    }, initialPoints);

    return totals;
  }
}

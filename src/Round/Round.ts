import { findPlayerById, findPlayerByIndex } from 'src/utils/helpers';
import {
  BidAmount,
  BidType,
  CardType,
  EvaluatedTrick,
  PlayerHand,
  PlayerId,
  PlayerStats,
  PlayerType,
  BaseRoundType,
  RoundSummary,
  RoundType,
  PlayerIndex,
  Suit,
  TrickType,
  Trump,
  TeamId,
  TeamTotals,
  CardName,
  BidStats,
  TrickStats,
} from 'src/@types/index';
import { Cards } from 'src/Cards/Cards';
import { TRUMP_VALUE, HAND_SIZE } from 'src/constants/game';
import { validatePlayerIndex } from 'src/utils/helpers';

export class Round implements RoundType {
  hands: PlayerHand[] = [];
  bids: BidType[] = [];
  winningBid: BidType = { bidAmount: -1, bidder: { playerId: '', playerIndex: -1 }, isTrump: null };
  trump: Trump | null = null;
  activePlayerIndex: PlayerIndex = -1;
  playableCards: CardType[] = [];
  trickIndex: number = 1;
  trick: TrickType = [];
  teamTotals: TeamTotals[] = [
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

  toJSON(): BaseRoundType {
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

  static fromJSON(state: BaseRoundType, endRound: (roundSummary: RoundSummary) => void): Round {
    const round = new Round(state.roundIndex, state.numPlayers, state.minBid, [], state.dealerIndex, endRound);
    round.updateStateFromJSON(state);

    return round;
  }

  updateStateFromJSON(state: BaseRoundType): void {
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
  dealHands(): void {
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
  canBid(playerId: string): boolean {
    if (this.bids.length >= this.numPlayers) return false;
    if (this.winningBid.isTrump !== null) return false;
    if (!this.isActivePlayer(playerId)) return false;
    if (this.bids.find((bid) => bid.bidder.playerIndex === this.activePlayerIndex || bid.bidder.playerId === playerId))
      return false;

    return true;
  }

  setPlayerBid(playerId: PlayerId, bidAmount: BidAmount, isTrump: boolean | null): void {
    if (!this.canBid(playerId)) throw new Error('Player is not allow to bid');
    if (!this.getValidBids().some((bid) => bid.bidAmount === bidAmount && bid.isTrump === isTrump))
      throw new Error('Bid is invalid');

    const { playerId: id, playerIndex } = this.getPlayer();
    const playerBid = {
      bidder: { playerId: id!, playerIndex },
      bidAmount,
      isTrump,
    };
    this.bids.push(playerBid);

    if (this.bids.length === this.numPlayers) this.setWinningBid();
    else this.updateActivePlayer();
  }

  getValidBids(): { bidAmount: BidAmount; isTrump: boolean | null }[] {
    const isDealer = this.getPlayer().playerId === this.getPlayer(this.dealerIndex).playerId;
    const noDealerPass = isDealer && this.bids.filter((bid) => bid.bidAmount !== 0).length === 0;

    const curHighBid = this.calcHighBid(this.bids);
    const bidAmounts = Object.values(BidAmount).filter(
      (value) => typeof value === 'number' && value >= this.minBid && value >= curHighBid.bidAmount
    ) as BidAmount[];

    const validBids = [
      { bidAmount: BidAmount.Pass, isTrump: null },
      ...bidAmounts.reduce((validBids, bidAmount) => {
        // prettier-ignore
        const bids = bidAmount <= 12 ? [ { bidAmount, isTrump: true }, { bidAmount, isTrump: false } ] : [{ bidAmount, isTrump: false }];
        const valid = [
          ...validBids,
          ...bids.filter((bid) =>
            isDealer ? this.compareBids(bid, curHighBid) >= 0 : this.compareBids(bid, curHighBid) > 0
          ),
        ];
        return valid;
      }, [] as { bidAmount: BidAmount; isTrump: boolean | null }[]),
    ];

    noDealerPass && validBids.shift();

    return validBids;
  }

  //prettier-ignore
  compareBids<T extends { bidAmount: BidAmount; isTrump: boolean | null }, U extends { bidAmount: BidAmount; isTrump: boolean | null }>(bidA: T, bidB: U): -1 | 0 | 1 {
    if (bidA.bidAmount > bidB.bidAmount) return 1;
    if (bidA.bidAmount < bidB.bidAmount) return -1;
    if (bidA.bidAmount === bidB.bidAmount && !bidA.isTrump && bidB.isTrump) return 1;
    if (bidA.bidAmount === bidB.bidAmount && bidA.isTrump && !bidB.isTrump) return -1;
    return 0;
  }

  calcHighBid(bids: BidType[]): BidType {
    const highBid = bids.reduce<BidType>((highBid, bid) => (this.compareBids(highBid, bid) > 0 ? highBid : bid), {
      bidAmount: -1,
      bidder: { playerId: '', playerIndex: -1 },
      isTrump: null,
    });

    return highBid;
  }

  setWinningBid(): BidType {
    const winningBid = this.calcHighBid(this.bids);

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

  resetPlayableCards(): void {
    this.playableCards = [];
  }

  endTrick(): EvaluatedTrick {
    const trickPointValue = this.getTrickValue();
    const trickWinner = this.getTrickWinner();
    const evaluatedTrick = this.evaluateTrick(trickPointValue, trickWinner);

    this.updateTeamPoints(evaluatedTrick.takenBy.teamId, evaluatedTrick.pointValue);
    this.updateTeamTricks(evaluatedTrick.takenBy.teamId, evaluatedTrick);
    this.resetTrick();

    this.trickIndex === HAND_SIZE ? this.evaluateRound() : this.updateActivePlayer(trickWinner.playerIndex);
    this.trickIndex < HAND_SIZE && this.incrementTrickIndex();

    return evaluatedTrick;
  }

  getTrickValue(): number {
    let value = 1;

    const cardsPlayed = this.trick.map((play) => play.cardPlayed);

    for (const card of cardsPlayed) {
      if (card.faceValue === 5 && card.suit === Suit.Hearts) value = value + card.faceValue;
      if (card.faceValue === 3 && card.suit === Suit.Spades) value = value - card.faceValue;
    }
    return value;
  }

  getTrickWinner(): PlayerType {
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
      trickIndex: this.trickIndex,
      trick: this.trick,
      pointValue: trickPointValue,
      takenBy: trickWinner,
    };
  }

  getTeamTotals(teamId: TeamId): TeamTotals {
    return this.teamTotals.find((team) => team.teamId === teamId)!;
  }

  updateTeamPoints(teamId: TeamId, trickValue: number): void {
    const teamTotals = this.getTeamTotals(teamId);
    teamTotals.points = teamTotals.points + trickValue;
  }

  updateTeamTricks(teamId: TeamId, takenTrick: EvaluatedTrick): void {
    const teamTotals = this.getTeamTotals(teamId);
    teamTotals.tricks.push(takenTrick);
  }

  resetTrick(): void {
    this.trick = [];
  }

  incrementTrickIndex(): void {
    this.trickIndex++;
  }

  evaluateRound(): RoundSummary {
    const { isBidMade } = this.evaluateBid();
    const playerStats = this.getPlayerStats();
    const teamPoints = this.teamTotals.map((team) => ({ teamId: team.teamId, points: team.points }));
    const totals = {
      roundIndex: this.roundIndex,
      winningBid: this.winningBid,
      trump: this.trump!,
      isBidMade,
      teamPoints,
      playerStats,
    };

    this.endRound(totals);
    return totals;
  }

  evaluateBid(): { isBidMade: boolean; evaluatedBidPoints: number } {
    const bidTeamId = this.getBidTeamId();
    const bidTeamPoints = this.teamTotals.find((points) => points.teamId === bidTeamId)!.points;
    const isBidMade = this.isBidMade();
    const evaluatedBidPoints = this.getRoundEndPoints(isBidMade, bidTeamPoints);

    const bidTeam = this.teamTotals.find((team) => team.teamId === bidTeamId)!;
    bidTeam.points = evaluatedBidPoints;
    return { isBidMade, evaluatedBidPoints };
  }

  getBidTeamId(): TeamId {
    const bidTeamId = findPlayerById(this.players, this.winningBid.bidder.playerId)!.teamId;
    return bidTeamId;
  }

  getRoundEndPoints(isBidMade: boolean, tricksValue: number): number {
    const isTroika = this.winningBid.bidAmount === 13;
    const isKaiser = this.winningBid.bidAmount === 14;
    const noBidMultiplier = this.winningBid.isTrump ? 1 : 2;
    const missedBidMultiplier = -1;

    if (isTroika) return isBidMade ? 52 : 52 * missedBidMultiplier;
    if (isKaiser) return isBidMade ? 1000 : 1000 * missedBidMultiplier;
    return isBidMade
      ? tricksValue * noBidMultiplier
      : this.winningBid.bidAmount * noBidMultiplier * missedBidMultiplier;
  }

  isBidMade(): boolean {
    const bidTeamId = this.getBidTeamId();
    const bidTeamPoints = this.teamTotals.find((team) => team.teamId === bidTeamId)!.points;
    const isBidMade = bidTeamPoints - this.winningBid.bidAmount >= 0;
    return isBidMade;
  }

  getPlayerStats(): PlayerStats {
    const playerStats = this.initializePlayerStats();

    return playerStats;
  }

  initializePlayerStats(): PlayerStats {
    const initialStats: PlayerStats = [];
    const trickStats = this.getPlayerTrickStats();

    for (let i = 0; i < this.numPlayers; i++) {
      const player = findPlayerByIndex(this.players, i);
      const bidStats = this.getPlayerBidStats(player);

      initialStats.push({
        playerId: player.playerId!,
        bidStats,
        trickStats: trickStats[i],
      });
    }

    return initialStats;
  }

  getPlayerBidStats(player: PlayerType): BidStats {
    const { bidAmount, isTrump } = this.bids.find((bid) => bid.bidder.playerIndex === player.playerIndex)!;
    const winningBidder = this.winningBid.bidder.playerId === player.playerId;
    const biddingTeam = findPlayerById(this.players, this.winningBid.bidder.playerId).teamId === player.teamId;
    const wonRound = biddingTeam ? this.isBidMade() : !this.isBidMade();

    const bidStats = {
      bidAmount,
      isTrump,
      winningBidder,
      biddingTeam,
      wonRound,
    };

    return bidStats;
  }

  getRoundTricks(): EvaluatedTrick[] {
    const roundTricks = this.teamTotals.flatMap((team) => team.tricks);
    return roundTricks;
  }

  getPlayerTrickStats(): TrickStats[] {
    const roundTricks = this.getRoundTricks();
    const initialStats = [];

    for (let i = 0; i < this.numPlayers; i++) {
      initialStats.push({ points: 0, tricksTaken: 0, fiveTaken: false, threeTaken: false });
    }

    const trickStats = roundTricks.reduce((playerTricks, trick): TrickStats[] => {
      const takenByIndex = findPlayerById(this.players, trick.takenBy.playerId).playerIndex;
      playerTricks[takenByIndex] = {
        ...playerTricks[takenByIndex],
        points: playerTricks[takenByIndex].points + trick.pointValue,
        tricksTaken: playerTricks[takenByIndex].tricksTaken++,
        fiveTaken: trick.trick.some(
          (play) => play.cardPlayed.suit === Suit.Hearts && play.cardPlayed.name === CardName.Five
        ),
        threeTaken: trick.trick.some(
          (play) => play.cardPlayed.suit === Suit.Spades && play.cardPlayed.name === CardName.Three
        ),
      };
      return playerTricks;
    }, initialStats);

    return trickStats;
  }
}

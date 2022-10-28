import { CardType, Suit } from './Cards';
import { PlayerId, PlayerType, PlayerIndex, TeamId } from './Game';

export type RoundState = {
  roundIndex: number;
  players: PlayerType[];
  hands: PlayerHand[];
  bids: BidType[];
  numPlayers: number;
  dealerIndex: PlayerIndex;
  minBid: BidAmount;
  winningBid: BidType;
  trump: Trump | null;
  activePlayerIndex: PlayerIndex;
  playableCards: CardType[];
  trickIndex: number;
  trick: TrickType;
  teamTotals: TeamTotals[];
};

export interface RoundType extends RoundState {
  toJSON(): RoundState;
  updateStateFromJSON(state: RoundState): void;
  dealHands(): void;
  sortHands(lowToHigh?: 'lowToHigh'): void;
  getValidBidValues(): { bidAmount: BidAmount; isTrump: boolean | null }[];
  canBid(playerId: string): boolean;
  setPlayerBid(id: PlayerId, bidValue: BidAmount, isTrump: boolean | null): void;
  setWinningBid(): BidType;
  canSetTrump(playerId: string): boolean;
  setTrump(playerId: PlayerId, trump: Suit): void;
  getTrump(): Trump | null;
  updateActivePlayer(makeActivePlayer?: number): void;
  getPlayer(playerIndex: PlayerIndex): PlayerType;
  isActivePlayer(playerId: string): boolean;
  setPlayableCards(): CardType[];
  playCard(playerId: PlayerId, cardPlayed: CardType): void;
  removeCardFromHand(cardPlayed: CardType): boolean;
  updateCardsPlayed(cardPlayed: CardType): TrickType;
  endPlayerTurn(): void;
  resetPlayableCards(): void;
  endTrick(): EvaluatedTrick;
  getTrickWinner(): PlayerType;
  evaluateTrick(trickPointValue: number, trickWinner: PlayerType): EvaluatedTrick;
  getTeamTotals(teamId: TeamId): TeamTotals;
  updateTeamPoints(teamId: TeamId, trickValue: number): void;
  resetTrick(): void;
  evaluateRound(): RoundSummary;
  isBidMade(bidTeamPoints: number): boolean;
  endRound: (roundSummary: RoundSummary) => void;
}

export type Hand = CardType[];

export type PlayerHand = {
  playerId: PlayerId;
  hand: Hand;
};

export type BidType = {
  bidAmount: BidAmount;
  bidder: { playerId: PlayerId; playerIndex: PlayerIndex };
  isTrump: boolean | null;
};

export enum BidAmount {
  Pass = 0,
  Five = 5,
  Six = 6,
  Seven = 7,
  Eight = 8,
  Nine = 9,
  Ten = 10,
  Eleven = 11,
  Twelve = 12,
  Troika = 13,
  Kaiser = 14,
}

export type Trump = Suit | 'NO_TRUMP';

export type TrickType = { cardPlayed: CardType; playedBy: PlayerId; playerIndex: PlayerIndex }[];

export type EvaluatedTrick = {
  trick: TrickType;
  pointValue: number;
  takenBy: PlayerType;
};

export type TeamTotals = { teamId: string; points: number; tricks: EvaluatedTrick[] };

export type TeamPoints = { teamId: string; points: number }[];

export type BidStats = {
  bidAmount: BidAmount;
  isTrump: boolean | null;
  winningBidder: boolean;
  biddingTeam: boolean;
  wonRound: boolean; // made bid or defended other team bid
};

export type TrickStats = {
  points: number;
  tricksTaken: number;
  fiveTaken: boolean;
  threeTaken: boolean;
};

export type PlayerStats = {
  playerId: PlayerId;
  bidStats: BidStats;
  trickStats: TrickStats;
}[];

export type RoundSummary = {
  roundIndex: number;
  winningBid: BidType;
  isBidMade: boolean;
  trump: Trump;
  teamPoints: TeamPoints;
  playerStats: PlayerStats;
};

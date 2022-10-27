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
  getValidBidValues(): BidValue[];
  canBid(playerId: string): boolean;
  setPlayerBid(id: PlayerId, bidValue: BidValue): void;
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
  isBidMade(bidTeamId: TeamId): { isBidMade: boolean; tricksValue: number };
  playerPointTotals(): PlayerPoints;
  endRound: (roundSummary: RoundSummary) => void;
}

export type Hand = CardType[];

export type PlayerHand = {
  playerId: PlayerId;
  hand: Hand;
};

export type BidType = {
  bidAmount: BidAmount;
  bidValue: BidValue;
  bidder: { playerId: PlayerId; playerIndex: PlayerIndex };
  isTrump: boolean;
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
}

export enum BidValue {
  Pass = 0,
  Five = 50,
  FiveNo = 55,
  Six = 60,
  SixNo = 65,
  Seven = 70,
  SevenNo = 75,
  Eight = 80,
  EightNo = 85,
  Nine = 90,
  NineNo = 95,
  Ten = 100,
  TenNo = 105,
  Eleven = 110,
  ElevenNo = 115,
  Twelve = 120,
  TwelveNo = 125,
  Troika = 127,
  Kaiser = 129,
}

export type Trump = Suit | 'NO_TRUMP';

export type TrickType = { cardPlayed: CardType; playedBy: PlayerId; playerIndex: PlayerIndex }[];

export type EvaluatedTrick = {
  trick: TrickType;
  pointValue: number;
  trickWonBy: PlayerType;
};

export type TeamTotals = { teamId: string; points: number; tricks: EvaluatedTrick[] };

export type TeamPoints = { teamId: string; points: number }[];

export type PlayerPoints = { playerId: PlayerId; playerIndex: PlayerIndex; points: number }[];

export type RoundSummary = {
  roundIndex: number;
  winningBid: BidType;
  isBidMade: boolean;
  trump: Trump;
  teamPoints: TeamPoints;
  playerPoints: PlayerPoints;
};

import { CardType, Suit } from './Cards';
import { PlayerId, PlayerType, PlayerIndex } from './Game';

export type RoundState = {
  roundNum: number;
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
  trick: TrickType;
  tricksTeam0: EvaluatedTrick[];
  tricksTeam1: EvaluatedTrick[];
  roundPoints: RoundPointTotals;
};

export interface RoundType extends RoundState {
  toJSON(): RoundState;
  updateStateFromJSON(state: RoundState): void;
  // dealHands(): Hand[]; // private
  sortHands(lowToHigh?: 'lowToHigh'): void;
  getValidBidValues(): BidValue[];
  canBid(playerId: string): boolean;
  setPlayerBid(id: PlayerId, bidValue: BidValue): void;
  setWinningBid(): BidType; // private
  canSetTrump(playerId: string): boolean;
  setTrump(playerId: PlayerId, trump: Suit): void; // private
  getTrump(): Trump | null;
  updateActivePlayer(makeActivePlayer?: number): void; // private
  getPlayer(playerIndex: PlayerIndex): PlayerType;
  isActivePlayer(playerId: string): boolean;
  setPlayableCards(): CardType[]; // private
  playCard(playerId: PlayerId, cardPlayed: CardType): void;
  removeCardFromHand(cardPlayed: CardType): boolean; // private
  updateCardsPlayed(cardPlayed: CardType): TrickType; // private
  endPlayerTurn(): void; // private
  // resetPlayableCards(): void; // private
  endTrick(): EvaluatedTrick; // private
  // getTrickValue(): number; // private
  // getTrickWinner(): { playedBy: PlayerId; playerIndex: PlayerIndex } // private
  // updateRoundPoints(takenTrick: EvaluatedTrick, takenBy: PlayerType): void; // private
  // resetTrick(): void; // private
  evaluateRound(): RoundSummary; // private
  // isBidMade(): EvaluatedBid; // private
  // playerTrickTotals(): PlayerPointTotals; // private
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
  // isTroika: boolean;
  // isKaiser: boolean;
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
  cardsPlayed: TrickType;
  pointValue: number;
  trickWonBy: PlayerType;
};

export type RoundPointTotals = { teamId: string; points: number }[];

export type PlayerPointTotals = { playerId: PlayerId; playerIndex: PlayerIndex; points: number }[];

export type RoundSummary = {
  roundNum: number;
  winningBid: BidType;
  isBidMade: boolean;
  trump: Trump;
  roundPoints: RoundPointTotals;
  playerPoints: PlayerPointTotals;
};

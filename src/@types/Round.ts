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
  validBids(): BidAmount[];
  canBid(playerId: string): boolean;
  setPlayerBid(playerId: PlayerId, bid: BidAmount, isTrump: boolean): void;
  setWinningBid(): BidType; // private
  canSetTrump(playerId: string): boolean;
  setTrump(playerId: PlayerId, trump: Suit): void; // private
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
  amount: BidAmount;
  bidder: PlayerId;
  playerIndex: PlayerIndex;
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

export enum NoSuit {
  NoTrump = 'NO_TRUMP',
}

export type Trump = Suit | NoSuit;

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

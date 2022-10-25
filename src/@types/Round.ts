import { CardType, Suit } from './Cards';
import { PlayerId, PlayerType, Seat } from './Game';

export type RoundState = {
  numRound: number;
  players: PlayerType[];
  hands: PlayerHand[];
  bids: BidType[];
  numPlayers: number;
  dealer: PlayerType;
  minBid: BidAmount;
  winningBid: BidType;
  trump: Suit | null;
  activePlayer: PlayerType;
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
  setPlayerBid(bid: BidAmount, isTrump: boolean): void;
  setWinningBid(): BidType; // private
  setTrump(trump: Suit): void; // private
  getTrump(): Suit | null; // public
  updateActivePlayer(makeActivePlayer?: number): PlayerType; // private
  setPlayableCards(hand: Hand): CardType[]; // private
  playCard(cardPlayed: CardType): void;
  removeCardFromHand(cardPlayed: CardType): Hand; // private
  updateCardsPlayed(cardPlayed: CardType): TrickType; // private
  endPlayerTurn(): void; // private
  biddingOpen(): boolean;
  findPlayerBid(playerId: PlayerId): BidType | null;
  // resetPlayableCards(): void; // private
  endTrick(): EvaluatedTrick; // private
  // getTrickValue(): number; // private
  // getTrickWinner(): { playedBy: PlayerId; seat: Seat } // private
  // updateRoundPoints(takenTrick: EvaluatedTrick, takenBy: PlayerType): void; // private
  // resetTrick(): void; // private
  evaluateRound(): RoundTotals; // private
  // isBidMade(): EvaluatedBid; // private
  // playerTrickTotals(): PlayerPointTotals; // private
  endRound: (roundTotals: RoundTotals) => void;
  canBid(playerId: string): boolean;
  getActivePlayer(): PlayerType | null;
  isActivePlayer(playerId: string): boolean;
  canSetTrump(playerId: string): boolean;
}

export type Hand = CardType[];

export type PlayerHand = {
  playerId: PlayerId;
  hand: Hand;
};

export type BidType = {
  amount: BidAmount;
  bidder: PlayerId;
  seat: Seat;
  isTrump: boolean;
};

export type EvaluatedBid = BidType & {
  bidMade: boolean;
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

export type EvaluatedTrick = {
  cardsPlayed: TrickType;
  pointValue: number;
  trickWonBy: PlayerType;
};

export type TrickType = { cardPlayed: CardType; playedBy: PlayerId; seat: Seat }[];

export type RoundTotals = {
  bid: EvaluatedBid;
  roundPoints: RoundPointTotals;
  playerPoints: PlayerPointTotals;
};

export type RoundPointTotals = { teamId: string; points: number }[];

export type PlayerPointTotals = { playerSeat: Seat; points: number }[];

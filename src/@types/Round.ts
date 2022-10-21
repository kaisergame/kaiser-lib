import { CardType, Suit } from './Cards';
import { PlayerType, Seat } from './Game';

export interface RoundType {
  playersRoundData: PlayerRoundData[];
  numPlayers: number;
  dealer: Seat;
  hands: Hand[];
  minBid: BidAmount;
  bids: BidType[];
  winningBid: BidType;
  trump: Suit | null;
  activePlayer: Seat;
  playableCards: CardType[];
  trick: TrickType;
  tricksTeam0: EvaluatedTrick[];
  tricksTeam1: EvaluatedTrick[];
  roundPoints: RoundPointTotals;
  toJSON(): RoundState;
  updateStateFromJSON(state: RoundState): void;
  // dealHands(): Hand[]; // private
  sortHands(lowToHigh?: 'lowToHigh'): void;
  validBids(): BidAmount[];
  setPlayerBid(bid: BidAmount): void;
  setWinningBid(): BidType; // private
  setTrump(trump: Suit): void; // private
  getTrump(): Suit | null; // public
  updateActivePlayer(makeActivePlayer?: number): Seat; // private
  setPlayableCards(hand: Hand): CardType[]; // private
  playCard(cardPlayed: CardType): void;
  removeCardFromHand(cardPlayed: CardType): Hand; // private
  updateCardsPlayed(cardPlayed: CardType): TrickType; // private
  endPlayerTurn(): void; // private
  biddingOpen(): boolean;
  findBidForPlayer(player: number): BidType | null;
  // resetPlayableCards(): void; // private
  endTrick(): EvaluatedTrick; // private
  // getTrickValue(): number; // private
  // getTrickWinner(): Seat; // private
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

export type RoundState = {
  playersRoundData: PlayerRoundData[];
  hands: Hand[];
  bids: BidType[];
  numPlayers: number;
  dealer: Seat;
  minBid: BidAmount;
  winningBid: BidType;
  trump: Suit | null;
  activePlayer: Seat;
  playableCards: CardType[];
  trick: TrickType;
  tricksTeam0: EvaluatedTrick[];
  tricksTeam1: EvaluatedTrick[];
  roundPoints: RoundPointTotals;
};

export type Hand = CardType[];

export type PlayerRoundData = PlayerType & {
  // roundTeam?: number; // needed for 5 player?
  bid: BidAmount | null;
  // wonBid: boolean;
  // madeBid: boolean;
  isDealer: boolean;
};

export type BidType = {
  amount: BidAmount;
  bidder: Seat;
  isTrump: boolean;
};

export type EvaluatedBid = BidType & {
  bidMade: boolean;
};

export enum BidAmount {
  Pass,
  Five,
  FiveNo,
  Six,
  SixNo,
  Seven,
  SevenNo,
  Eight,
  EightNo,
  Nine,
  NineNo,
  Ten,
  TenNo,
  Eleven,
  ElevenNo,
  Twelve,
  TwelveNo,
  Troika,
  Kaiser,
}

export type EvaluatedTrick = {
  cardsPlayed: TrickType;
  pointValue: number;
  trickWonBy: Seat;
};

export type TrickType = { cardPlayed: CardType; playedBy: Seat }[];

export type RoundTotals = {
  bid: EvaluatedBid;
  roundPoints: RoundPointTotals;
  playerPoints: PlayerPointTotals;
};

export type RoundPointTotals = { teamId: string; points: number }[];

export type PlayerPointTotals = { playerSeat: Seat; points: number }[];

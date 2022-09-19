import { CardType, Suit } from './Cards';
import { Seat } from './Game';

export interface RoundType {
  playersRoundData: PlayerRoundData[];
  playerNum: number;
  dealer: Seat;
  deck: CardType[];
  hands: Hand[];
  minBid: BidAmount;
  bids: BidType[];
  winningBid: BidType;
  trump: Suit | null;
  activePlayer: Seat;
  playableCards: CardType[];
  curTrick: TrickType;
  roundPoints: RoundPointTotals;
  tricksTaken: EvaluatedTrick[];
}

export type Hand = CardType[];

export type PlayerRoundData = {
  playerId: string;
  seat: Seat;
  team: number;
  roundTeam?: number; // for 5 player
  bid: BidAmount | null;
  winningBid: BidAmount | null;
  isDealer: boolean;
  // tricksTaken: number;
};

export type BidType = {
  amount: BidAmount;
  bidder: Seat;
  isTrump: boolean;
};

export enum BidAmount {
  Pass = 0,
  Five = 5,
  FiveNo = 5.5,
  Six = 6,
  SixNo = 6.5,
  Seven = 7,
  SevenNo = 7.5,
  Eight = 8,
  EightNo = 8.5,
  Nine = 9,
  NineNo = 9.5,
  Ten = 10,
  TenNo = 10.5,
  Eleven = 11,
  ElevenNo = 11.5,
  Twelve = 12,
  TwelveNo = 12.5,
  Troika = 12.7,
  Kaiser = 12.9,
}

export type EvaluatedTrick = {
  cardsPlayed: TrickType;
  trickPoints: number;
  trickWonBy: Seat;
};
export type TrickType = { cardPlayed: CardType; playedBy: Seat }[];

export type RoundTotals = {
  bidMade: boolean;
  roundPoints: RoundPointTotals;
  playerPoints: PlayerPointTotals;
};

export type RoundPointTotals = { team: number; points: number }[];

export type PlayerPointTotals = { player: Seat; points: number }[];

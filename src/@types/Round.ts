import { CardType, Suit } from './Card';
import { PlayerType, Seat } from './Game';
import { UserId } from './User';

export type TrickType = {
  trickValue: number;
  cardsPlayed: CardType[];
  trickWonBy: Seat;
};

export interface RoundType {
  hands: Hand[];
  bids: number[];
  bid: number | undefined;
  dealer: Seat;
  turnOrder: number;
  trump: Suit;
  cardsPlayed: CardType[];
  tricks: TrickType[];
}

export type TurnData = {
  playableCards: CardType[];
  cardPlayed?: CardType;
};

export type Hand = CardType[];

export type RoundData = {
  userID: UserId;
  seat: Seat;
  bid: number | null;
  isDealer: boolean;
  tricksTaken: number;
}[];

export type RoundTotals = {
  bidMade: boolean;
  points: number[];
  playerTricks: number[];
};

export type BidType = {
  amount: Bid;
  bidder: Seat;
  trump: Suit | boolean;
};

export enum Bid {
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
  Troika = 12.6,
  Kaiser = 12.9,
}

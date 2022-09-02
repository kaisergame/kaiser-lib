import { CardType, Suit } from './Card';
import { PlayerType, Seat } from './Game';
import { UserId } from './User';

export interface RoundType {
  roundNumber: number;
  hands: CardType[];
  bids: number[];
  bid: number | undefined;
  dealer: Seat;
  playOrder: number;
  trump: Suit;
  cardsPlayed: CardType[];
  tricks: {
    trickPoints: number;
    cardsPlayed: CardType[];
    trickWonBy: PlayerType;
  };
}

export type Hand = CardType[];

export type PlayerRoundData = {
  userID: UserId;
  seat: Seat;
  bid: number | undefined;
  isDealer: boolean;
  tricksTaken: number;
}[];

export enum Bid {
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

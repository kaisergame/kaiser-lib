import { RoundType } from './Round';
import { UserId } from './User';

export interface GameType {
  gameID: string;
  owner: UserId;
  config: GameConfig;
  players: PlayerType[];
  teams: { team: Seat[]; score: number }[];
  curRound: RoundType;
  gameHistory: {
    roundNum: number;
    tricksTaken: number[];
    bid: number;
    score: { team: Seat[]; score: number }[];
  }[];
}

export type GameConfig = {
  numOfPlayers: PlayerNum;
  minBid: number;
  scoreToWin: number;
  //bidOut: boolean;
  //kitty: boolean;
  //passCards: PassCards;
  //lowNo: boolean;
  //noBid62: boolean;
  //noAceFace53: boolean;
  //inviteOnly: boolean;
};

export type PlayerType = {
  userId: string;
  seat: Seat;
  team: number;
  score: number;
};

export type PlayerNum = number;

export type Seat = number;

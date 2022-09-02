import { RoundType } from './Round';

export interface GameType {
  gameID: string;
  gamePreferences: GameConfig;
  players: PlayerType[];
  teams: {
    team0: 0;
    team1: 1;
    [key: string]: number;
  };
  teamScores: number[];
  playerScores?: number[];
  curRound: RoundType;
  gameHistory: {
    roundNumber: number;
    tricksTaken: number[];
    bid: number;
  }[];
}

export type GameConfig = {
  numOfPlayers: PlayerNum;
  //inviteOnly: boolean;
  minBid: number;
  //bidOut: boolean;
  //kitty: boolean;
  //passCards: PassCards;
  //lowNo: boolean;
  //noBid62: boolean;
  //noAceFace53: boolean;
};

export type PlayerType = {
  userId: string;
  seat: Seat;
  team?: Seat[];
};

export type PlayerNum = 2 | 4 | 5 | 6;

export type Seat = 0 | 1 | 2 | 3;

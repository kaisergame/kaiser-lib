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
  team?: Seat[];
};

export type PlayerNum = number;

export type Seat = number;

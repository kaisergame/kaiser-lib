import { Suit } from './Cards';
import { BidAmount, RoundPointTotals, RoundTotals, RoundType } from './Round';

export interface GameType {
  gameId: GameId;
  owner: { id: string; name: string };
  config: GameConfig;
  players: PlayerType[];
  teams: TeamType[];
  scores: ScoreType[];
  dealer: Seat | null;
  round: RoundType | null;
  roundSummaries: RoundSummary[];
  gameStateToJson(): string;
  gameStateFromJson(jsonGameState: string): void;
  addPlayer(id: string, name: string): PlayerType;
  removePlayer(id: string): void;
  initializeTeams(): TeamType[]; // private
  initializePlayers(): PlayerType[]; // private
  getTeamSeats(teamIndex: number): number[]; // private
  switchPlayerSeat(movePlayer: PlayerId, moveToSeat?: Seat): void;
  startGame(): void;
  createRound(): void; // private
  setDealer(): Seat; // private
  endRound(roundTotals: RoundTotals): void;
  updateScores(roundPoints: RoundPointTotals): void; // private
  checkIsWinner(): string | null; // private
  endGame(teamId: string): void; // private
}

export interface GameStateType {
  gameId: GameId;
  owner: { id: string; name: string };
  config: GameConfig;
  players: PlayerType[];
  teams: TeamType[];
  scores: ScoreType[];
  dealer: Seat | null;
  round: RoundType | null;
  roundSummaries: RoundSummary[];
  version: GameVersion;
}

export enum GameVersion {
  One = '1.0.0',
}

export type GameId = string;

export type RoundSummary = {
  roundNum: number;
  winningBid: number;
  bidMade: boolean;
  trump: Suit | null;
  roundPoints: RoundPointTotals;
  roundTeams?: TeamType[];
};

export type GameConfig = {
  numPlayers: number;
  minBid: BidAmount;
  scoreToWin: number;
  //bidOut: boolean;
  //kitty: boolean;
  //passCards: PassCards;
  //lowNo: boolean;
  //noBid62: boolean;
  //noAceFace53: boolean;
  //inviteOnly: boolean;
};

export type TeamType = {
  teamId: string;
  teamSeats: Seat[];
  teamMembers: PlayerId[];
};

export type Seat = number;

export type PlayerType = {
  playerId: PlayerId | null;
  name: string | null;
  teamId: string;
  seat: Seat;
};

export type PlayerId = string;

export type ScoreType = {
  teamId: string;
  teamScore: number;
};

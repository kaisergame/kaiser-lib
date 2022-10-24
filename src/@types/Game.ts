import { Suit } from './Cards';
import { BidAmount, RoundPointTotals, RoundState, RoundTotals, RoundType } from './Round';

export type GameState = {
  gameId: GameId;
  owner: { id: string; name: string };
  config: GameConfig;
  players: PlayerType[];
  teams: TeamType[];
  scores: ScoreType[];
  dealer: PlayerPosition | null;
  numRound: number;
  round: RoundState | null;
  roundSummaries: RoundSummary[];
  version: GameVersion;
};

export interface GameType extends GameState {
  toJSON(): GameState;
  updateStateFromJSON(state: GameState): void;
  addPlayer(id: string, name: string): PlayerType;
  removePlayer(id: string): void;
  canBid(playerId: string): boolean;
  getActivePlayer(): PlayerType | null;
  isActivePlayer(playerId: string): boolean;
  canSetTrump(playerId: string): boolean;
  // initializeTeams(): TeamType[]; // private
  // initializePlayers(): PlayerType[]; // private
  // getTeamSeats(teamIndex: number): number[]; // private
  switchPlayerSeat(movePlayer: PlayerId, moveToSeat?: Seat): void;
  startGame(): void;
  // createRound(): void; // private
  // setDealer(): Seat; // private
  endRound(roundTotals: RoundTotals): void;
  // updateScores(roundPoints: RoundPointTotals): void; // private
  // checkIsWinner(): string | null; // private
  // endGame(teamId: string): void; // private
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

export type PlayerPosition = {
  playerId: PlayerId | null;
  seat: Seat;
};

export type PlayerType = PlayerPosition & {
  name: string | null;
  teamId: string;
};

export type PlayerId = string;

export type ScoreType = {
  teamId: string;
  teamScore: number;
};

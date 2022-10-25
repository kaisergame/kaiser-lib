import { BidAmount, RoundState, RoundSummary } from './Round';

export type GameState = {
  gameId: GameId;
  owner: { id: string; name: string };
  config: GameConfig;
  players: PlayerType[];
  teams: TeamType[];
  scores: ScoreType[];
  dealerIndex: PlayerIndex | null;
  roundNum: number;
  round: RoundState | null;
  roundSummaries: RoundSummary[];
  version: GameVersion;
};

export interface GameType extends GameState {
  toJSON(): GameState;
  updateStateFromJSON(state: GameState): void;
  addPlayer(id: string, name: string): PlayerType;
  removePlayer(id: string): void;
  // initializeTeams(): TeamType[]; // private
  // initializePlayers(): PlayerType[]; // private
  // getTeamPlayerIndexs(teamIndex: number): number[]; // private
  switchPlayerPlayerIndex(movePlayer: PlayerId, moveToPlayerIndex?: PlayerIndex): void;
  startGame(): void;
  // createRound(): void; // private
  // setDealer(): PlayerIndex; // private
  endRound(roundSummary: RoundSummary): void;
  // updateScores(roundPoints: RoundPointTotals): void; // private
  // checkIsWinner(): string | null; // private
  // endGame(teamId: string): void; // private
}

export enum GameVersion {
  One = '1.0.0',
}

export type GameId = string;

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
  teamPlayerIndexs: PlayerIndex[];
  teamMembers: PlayerId[];
};

export type PlayerIndex = number;

export type PlayerType = {
  playerId: PlayerId | null;
  playerIndex: PlayerIndex;
  name: string | null;
  teamId: string;
};

export type PlayerId = string;

export type ScoreType = {
  teamId: string;
  teamScore: number;
};

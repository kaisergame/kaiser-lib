import { BidAmount, BaseRoundType, RoundSummary } from './Round';

export type BaseGameType = {
  gameId: GameId;
  owner: { id: string; name: string };
  config: GameConfig;
  players: PlayerType[];
  teams: TeamType[];
  dealerIndex: PlayerIndex | null;
  round: BaseRoundType | null;
  roundSummaries: RoundSummary[];
  version: GameVersion | string;
};

export interface GameType extends BaseGameType {
  toJSON(): BaseGameType;
  updateStateFromJSON(state: BaseGameType): void;
  addPlayer(id: string, name: string): void;
  removePlayer(id: string): void;
  // initializeTeams(): void; // private
  // initializePlayers(): void; // private
  // getTeamPlayerIndexs(teamIndex: number): number[]; // private
  switchPlayerIndex(movePlayer: PlayerId, moveToPlayerIndex?: PlayerIndex): void;
  sortPlayers(): void;
  canStartGame(): boolean;
  startGame(): void;
  // createRound(): void; // private
  // setDealer(): PlayerIndex; // private
  endRound(roundSummary: RoundSummary): void;
  // updateScores(roundPoints: TeamPointTotals): void; // private
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

export type TeamId = string;

export type TeamType = {
  teamId: TeamId;
  teamMembers: PlayerId[];
  teamScore: number;
};

export type PlayerIndex = number;

export type PlayerType = {
  playerId: PlayerId | null;
  playerIndex: PlayerIndex;
  name: string | null;
  teamId: string;
};

export type PlayerId = string;

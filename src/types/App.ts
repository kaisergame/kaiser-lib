import { GameType } from './Game';
import { User } from './User';

export type AppState = {
  users: User[];
  activeGames: GameType[];
};

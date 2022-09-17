import { GameType } from './Game';
import { UserType } from './User';

export type AppState = {
  users: UserType[];
  activeGames: GameType[];
};

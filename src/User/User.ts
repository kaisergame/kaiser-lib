import { GameConfig, PassCards, PlayerNum, UserId, UserStatsType, UserType } from '../@types/index ';
import { Game } from '../Game/Game';

export class User implements UserType {
  constructor(
    readonly userID: UserId,
    public name: string,
    public email: string,
    public stats: UserStatsType,
    public gameID: string
  ) {
    //
  }

  createGameConfig(): GameConfig {
    const config = {
      numOfPlayers: 4 as PlayerNum,
      inviteOnly: false,
      minBid: 6,
      passCards: 1 as PassCards,
      lowNo: false,
      noAceFace53: false,
    };
    return config;
  }

  createGame(gameConfig: GameConfig): GameType {
    const newGame = new Game(this.userID, [this], gameConfig);

    return newGame;
  }

  invitePlayers() {}
}

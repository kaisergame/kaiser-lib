import { GameConfig, PlayerNum, UserId, UserStatsType, UserType } from '../@types/index';
import { Game } from '../Game/Game';

export class User implements UserType {
  constructor(
    readonly userId: UserId,
    public userName: string,
    public email: string,
    public stats: UserStatsType,
    public gameID?: string
  ) {
    //
  }

  createGameConfig(): GameConfig {
    const config = {
      numOfPlayers: 4 as PlayerNum,
      inviteOnly: false,
      minBid: 6,
      scoreToWin: 52,
      passCards: 0,
      lowNo: false,
      noAceFace53: false,
    };
    return config;
  }

  createGame(gameConfig: GameConfig): InstanceType<typeof Game> {
    const owner = { userId: this.userId, userName: this.userName };
    const newGame = new Game(owner, gameConfig);

    return newGame;
  }
}

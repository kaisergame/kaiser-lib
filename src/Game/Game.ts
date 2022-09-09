import { GameConfig, GameType, PlayerType, RoundType, Seat, User } from '../@types/index';
import { Round } from '../Round/Round';

export class Game {
  players: PlayerType[];
  dealer: Seat | undefined;

  constructor(public host: User, readonly config: GameConfig) {
    this.host = host;
    this.players = [];
    this.dealer = undefined;
  }

  addPlayer(user: User) {
    const players = [...this.players];

    const newPlayer = this.createPlayer(user);
    players.push(newPlayer);
  }

  createPlayer(user: User) {
    const player: PlayerType = {
      userId: user.userId,
      seat: (this.players.length - 1) as Sea,
    };
    return player;
  }

  startGame() {
    this.createRound();
  }

  setDealer() {
    let dealer = this.dealer;
    if (dealer === undefined) dealer = 0;
    if (dealer === this.players.length - 1) dealer = 0;
    else dealer++;

    this.dealer = dealer;
    return dealer;
  }

  createRound() {
    const dealer = this.setDealer();
    const round = new Round(this.players, dealer, this.endRound);
    return round;
  }

  endRound(roundPoints: number[]) {
    this.updateScores(roundPoints);
    const winner = this.checkIsWinner();
    if (winner) this.endGame();
    if (!winner) this.createRound();
  }

  updateScores(roundPoints: number[]) {
    // how
  }

  checkIsWinner(): boolean {
    return false;
  }

  endGame(winner?: PlayerType | PlayerType[]) {
    //
  }
}

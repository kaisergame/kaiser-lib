import { RoundCl } from './RoundCl';
import { Game, GameConfig, Player, Round, Seat, User } from './types/index';

export class GameCl {
  players: Player[];
  dealer: Seat | undefined;

  constructor(public host: User, readonly config: GameConfig) {
    this.host = host;
    this.players = [];
    this.dealer = undefined;
  }

  joinPlayer(user: User) {
    const players = [...this.players];

    const newPlayer = this.createPlayer(user);
    players.push(newPlayer);
  }

  createPlayer(user: User) {
    const player: Player = {
      userId: user.userId,
      seat: (this.players.length - 1) as Seat,
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

    this.dealer = dealer as Seat;
    return dealer as Seat;
  }

  createRound() {
    const dealer = this.setDealer();
    const round = new RoundCl(this.players, dealer, this.endRound);
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

  endGame(winner?: Player | Player[]) {
    //
  }
}

import { CardType, GameConfig, PlayerType, RoundTotals, Seat, UserType } from '../@types/index';
import { Cards } from '../Cards/Cards';
import { Round } from '../Round/Round';

export class Game {
  players: PlayerType[] = [];
  dealer: Seat | null = null;
  cards: InstanceType<typeof Cards> | null = null;
  deck: CardType[] = [];
  scores: number[] = [];
  curRound: InstanceType<typeof Round> | null = null;

  constructor(public owner: UserType, readonly config: GameConfig) {
    this.owner = owner;
    this.config = config;
    this.players = [{ ...this.createPlayer(owner) }];
  }

  addPlayer(user: UserType) {
    if (this.players.length === this.config.numOfPlayers) return;

    const players = [...this.players];
    const newPlayer = this.createPlayer(user);
    players.push(newPlayer);

    this.players = players;
  }

  private createPlayer(user: UserType) {
    const seat = this.players.length;

    const player: PlayerType = {
      userId: user.userId,
      userName: user.userName,
      seat: seat,
      team: this.setTeam(seat),
      score: 0,
    };

    return player;
  }

  setTeam(seat: number) {
    let team = -1;
    if (this.config.numOfPlayers === 4) {
      team = seat % 2;
    }

    // use w/ 5/6 player config options
    // if (this.config.numOfPlayers === 5) {
    //   team = seat;
    // }
    // if (this.config.numOfPlayers === 6) {
    //   team = seat % 3;
    // }

    return team;
  }

  createDeck() {
    const playerNum = this.players.length;
    const cards = new Cards(playerNum);
    const deck = cards.createCards(playerNum);
    this.cards = cards;
    this.deck = deck;
    return deck;
  }

  startGame() {
    if (this.players.length !== this.config.numOfPlayers) return;
    this.createDeck();
    this.createRound();
  }

  setDealer() {
    let dealer = this.dealer;
    if (dealer === null) dealer = 0;
    else dealer !== this.players.length - 1 ? dealer++ : (dealer = 0);

    this.dealer = dealer;
    return dealer;
  }

  createRound() {
    const dealer = this.setDealer();
    if (!this.cards) return;
    const shuffledDeck = this.cards.shuffleDeck(this.deck);
    const round = new Round(
      this.config.numOfPlayers,
      this.config.minBid,
      this.players,
      dealer,
      shuffledDeck,
      this.endRound
    );

    this.curRound = round;
    return round;
  }

  endRound(roundTotals: RoundTotals) {
    this.updateScores(roundTotals.points);
    const winner = this.checkIsWinner();

    if (winner >= 0) this.endGame(winner);
    if (winner < 0) this.createRound();
  }

  updateScores(roundPoints: number[]) {
    const curScores = this.scores;
    const updatedScores = [];
    for (let i = 0; i < roundPoints.length; i++) {
      const updated = curScores[i] + roundPoints[i];
      updatedScores.push(updated);
    }
    this.scores = updatedScores;
  }

  checkIsWinner() {
    const winScore = this.config.scoreToWin;

    const isWinner = this.scores.reduce(
      (highScore, score, i): { team: number; score: number } =>
        score >= winScore && score > highScore.score ? { team: i, score: score } : highScore,
      { team: -1, score: 0 }
    );

    return isWinner.team;
  }

  endGame(winner: number) {
    // record win
    // record stats
    // play again
  }
}

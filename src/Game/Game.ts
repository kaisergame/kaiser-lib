import { CardType, GameConfig, PlayerType, RoundTotals, RoundType, Seat, User, UserId } from '../@types/index';
import { Cards } from '../Cards/Cards';
import { Round } from '../Round/Round';

export class Game {
  players: PlayerType[] = [];
  dealer: Seat | null = null;
  cards: any | null = null; //FIXME:
  deck: CardType[] = [];
  scores: number[] = [];
  curRound: RoundType | null = null;

  constructor(public owner: UserId, readonly config: GameConfig) {
    this.owner = owner;
    this.config = config;
  }

  addPlayer(user: User) {
    const players = [...this.players];

    const newPlayer = this.createPlayer(user);
    players.push(newPlayer);

    this.players = players;
  }

  private createPlayer(user: User) {
    const seat = this.players.length - 1;

    const player: PlayerType = {
      userId: user.userId,
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

    // use w/ 5 or 6 player config options
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
    this.createRound();
  }

  setDealer() {
    let dealer = this.dealer;
    // if there is no dealer set
    if (dealer === null) dealer = 0;
    // if returns to initial dealer
    if (dealer === this.players.length - 1) dealer = 0;
    else dealer++;

    this.dealer = dealer;
    return dealer;
  }

  createRound() {
    const dealer = this.setDealer();
    const shuffledDeck = this.cards.shuffleDeck(this.deck);
    const round = new Round(
      this.config.numOfPlayers,
      this.config.minBid,
      this.players,
      dealer,
      shuffledDeck,
      this.endRound
    );

    // this.curRound = round; // TODO:
    return round;
  }

  endRound(roundTotals: RoundTotals) {
    this.updateScores(roundTotals.points);
    const winner = this.checkIsWinner();
    if (winner) this.endGame(winner);

    if (!winner) this.createRound();
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
      (highScore, score, i) => (score >= winScore && score > highScore.score ? { team: i, score: score } : highScore),
      { team: null, score: 0 } as { team: null | number; score: number }
    );

    return isWinner.team;
  }

  endGame(winner: number) {
    // record win
    // record stats
    // play again
  }
}

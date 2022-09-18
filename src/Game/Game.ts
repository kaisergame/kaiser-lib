import {
  Deck,
  GameConfig,
  GameId,
  GameType,
  PlayerType,
  PrevRoundData,
  RoundPointTotals,
  RoundTotals,
  RoundType,
  Seat,
  TeamData,
  UserId,
  UserType,
} from '../@types/index';
import { Cards } from '../Cards/Cards';
import { Round } from '../Round/Round';

// interface GameType {
//   gameId: string;
//   owner: PlayerId;
//   config: GameConfig;
//   players: PlayerType[];
//   teams: TeamData[];
//   curRound: RoundType;
//   prevRounds: {
//     roundNum: number;
//     winningBid: number;
//     trump: Suit | null;
//     roundPoints: RoundPointTotals;
//     roundTeams: TeamData[];
//   }[];
// }

export class Game implements GameType {
  gameId: GameId;
  players: PlayerType[] = [];
  teams: TeamData[] = [];
  scores: number[] = [];
  dealer: Seat | null = null;
  cards: Cards | null = null;
  deck: Deck = [];
  curRound: RoundType | null = null;
  prevRounds: PrevRoundData[] = [];

  constructor(public owner: UserType, readonly config: GameConfig) {
    this.gameId = this.setGameId();
    this.owner = owner;
    this.config = config;
    this.players = [{ ...this.addPlayer(owner) }];
  }

  setGameId() {
    const gameId = 'game12345';
    return gameId;
  }

  addPlayer(user: UserType) {
    if (this.players.length === this.config.numOfPlayers)
      throw new Error(`Already ${this.config.numOfPlayers} players in game`);

    const players = [...this.players];
    const playerSeat = this.players.length;
    const player: PlayerType = {
      playerId: user.userId,
      userName: user.userName,
      seat: playerSeat,
      team: this.setTeam(playerSeat),
    };
    players.push(player);

    this.players = players;
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

  initializeDeck() {
    const playerNum = this.players.length;
    const cards = new Cards(playerNum);
    const deck = cards.createCards(playerNum);
    this.cards = cards;
    this.deck = deck;
    return deck;
  }

  startGame() {
    if (this.players.length !== this.config.numOfPlayers) return;
    this.initializeDeck();
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
    this.updateScores(roundTotals.roundPoints);
    const winner = this.checkIsWinner();

    if (winner >= 0) this.endGame(winner);
    if (winner < 0) this.createRound();
  }

  updateScores(roundPoints: RoundPointTotals) {
    const curScores = this.scores;
    const updatedScores = [];
    for (let i = 0; i < roundPoints.length; i++) {
      const updated = curScores[roundPoints[i].team] + roundPoints[i].points;
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

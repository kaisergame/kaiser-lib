import {
  Deck,
  GameConfig,
  GameId,
  GameType,
  PlayerId,
  PlayerType,
  PrevRoundData,
  RoundPointTotals,
  RoundTotals,
  RoundType,
  Seat,
  TeamType,
  UserType,
} from '../@types/index';
import { Cards } from '../Cards/Cards';
import { Round } from '../Round/Round';

// interface GameType {
//   gameId: string;
//   owner: PlayerId;
//   config: GameConfig;
//   players: PlayerType[];
//   teams: TeamType[];
//   curRound: RoundType;
//   prevRounds: {
//     roundNum: number;
//     winningBid: number;
//     trump: Suit | null;
//     roundPoints: RoundPointTotals;
//     roundTeams: TeamType[];
//   }[];
// }

export class Game implements GameType {
  gameId: GameId;
  players: PlayerId[];
  teams: TeamType[] = [];
  dealer: Seat = 0;
  cards: Cards;
  deck: Deck;
  curRound: RoundType | null = null;
  prevRounds: PrevRoundData[] = [];

  constructor(public owner: UserType, readonly config: GameConfig) {
    this.gameId = this.setGameId();
    this.owner = owner;
    this.config = config;
    this.players = [owner.userId];
    this.cards = new Cards(config.numOfPlayers);
    this.deck = this.cards.createCards();
  }

  setGameId() {
    const gameId = 'game12345';
    return gameId;
  }

  addPlayer(user: UserType) {
    if (this.players.length === this.config.numOfPlayers)
      throw new Error(`Already ${this.config.numOfPlayers} players in game`);

    const player: PlayerType = {
      playerId: user.userId,
      userName: user.userName,
      seat: this.setPlayerSeat(),
      // team: this.setTeam(playerSeat),
    };

    this.players.push(user.userId);
    return player;
  }

  setPlayerSeat() {
    const seats = Array.from(Array(this.config.numOfPlayers).keys());
    // const seatsTaken = this.players.map((player) => player.seat);
    const seatsTaken = this.teams.flatMap((team) => {
      const seats = [];
      for (const player of team.teamMembers) {
        seats.push(player.seat);
      }
      return seats;
    });
    const openSeats = seats.filter((seat) => !seatsTaken.includes(seat));

    return Math.min(...openSeats);
  }

  initializeTeams() {
    //
  }

  createTeamId() {
    const id = Math.trunc(Math.random() * 1000000).toString();
    return id;
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

  changePlayerSeat() {
    //
  }

  startGame() {
    if (this.players.length !== this.config.numOfPlayers) return;
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
    const curScores = this.teams.map((team) => team.score);
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
    console.log(`Team ${winner} wins!`);
  }
}

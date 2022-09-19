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
  teams: TeamType[];
  dealer: Seat = 0;
  cards: Cards;
  deck: Deck;
  curRound: RoundType | null = null;
  prevRounds: PrevRoundData[] = [];

  constructor(public owner: UserType, readonly config: GameConfig) {
    this.gameId = this.setGameId();
    this.owner = owner;
    this.config = config;
    this.players = [];
    this.teams = this.initializeTeams(owner);
    this.cards = new Cards(config.playerNum);
    this.deck = this.cards.createCards();
  }

  setGameId() {
    // TODO:
    const gameId = 'game12345';
    return gameId;
  }

  addPlayer(user: UserType) {
    if (this.players.length === this.config.playerNum)
      throw new Error(`Already ${this.config.playerNum} players in game`);

    const player: PlayerType = {
      playerId: user.userId,
      userName: user.userName,
      seat: this.setPlayerSeat(),
      // team: this.setTeam(playerSeat),
    };

    this.players.push(player.playerId);
    for (const team of this.teams) {
      if (team.teamSeats.includes(player.seat)) team.teamMembers.push(player);
    }

    return player;
  }

  setPlayerSeat() {
    const seats = Array.from(Array(this.config.playerNum).keys());
    // const seatsTaken = this.players.map((player) => player.seat);
    const seatsTaken = this.teams.flatMap((team) => {
      const taken = [];
      for (const player of team.teamMembers) {
        taken.push(player.seat);
      }
      return taken;
    });
    const openSeats = seats.filter((seat) => !seatsTaken.includes(seat));

    return Math.min(...openSeats);
  }

  initializeTeams(owner: UserType) {
    let numOfTeams = -1;
    const { playerNum } = this.config;
    const teams = [];

    if (playerNum === 4) numOfTeams = 2;

    for (let i = 0; i < numOfTeams; i++) {
      const team: TeamType = {
        teamId: this.createTeamId(),
        teamSeats: this.getTeamSeats(i),
        teamMembers: [],
        teamScore: 0,
      };
      teams.push(team);
    }

    this.addPlayer(owner);

    return teams;
  }

  createTeamId() {
    const id = Math.trunc(Math.random() * 1000000).toString();
    return id;
  }

  getTeamSeats(teamIndex: number) {
    const seats = [];
    const { playerNum } = this.config;

    if (playerNum === 4) {
      for (let i = teamIndex; i < playerNum; i += 2) {
        seats.push(i);
      }
    }

    return seats;
  }

  setTeam(seat: number) {
    let team = -1;
    if (this.config.playerNum === 4) {
      team = seat % 2;
    }

    // use w/ 5/6 player config options
    // if (this.config.playerNum === 5) {
    //   team = seat;
    // }
    // if (this.config.playerNum === 6) {
    //   team = seat % 3;
    // }

    return team;
  }

  changePlayerSeat() {
    //
  }

  startGame() {
    if (this.players.length !== this.config.playerNum) return;
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
      this.config.playerNum,
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

    if (winner) this.endGame(winner);
    if (!winner) this.createRound();
  }

  updateScores(roundPoints: RoundPointTotals) {
    for (const pointData of roundPoints) {
      for (const team of this.teams) {
        if (pointData.teamId === team.teamId) team.teamScore += pointData.points;
      }
    }
  }

  checkIsWinner() {
    const winScore = this.config.scoreToWin;
    const isWinner = this.teams.reduce<{ teamId: string | null; teamScore: number }>(
      (highScore, team) => {
        const { teamId, teamScore } = team;
        return teamScore >= winScore && teamScore > highScore.teamScore ? { teamId, teamScore } : highScore;
      },
      { teamId: null, teamScore: 0 }
    );

    return isWinner.teamId;
  }

  endGame(teamId: string) {
    console.log(`Team ${teamId} wins!`);
  }
}

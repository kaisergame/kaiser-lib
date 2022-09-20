import {
  Deck,
  GameConfig,
  GameId,
  GameType,
  PlayerId,
  PlayerType,
  RoundPointTotals,
  RoundSummary,
  RoundTotals,
  RoundType,
  ScoreType,
  Seat,
  TeamType,
} from '../@types/index';
import { Cards } from '../Cards/Cards';
import { Round } from '../Round/Round';

export class Game implements GameType {
  players: PlayerType[];
  teams: TeamType[];
  scores: ScoreType[];
  dealer: Seat = 0;
  cards: Cards;
  deck: Deck;
  curRound: RoundType | null = null;
  RoundSummaries: RoundSummary[] = [];

  constructor(public owner: { id: string; name: string }, readonly gameId: string, readonly config: GameConfig) {
    this.gameId = gameId;
    this.owner = owner;
    this.config = config;
    this.players = this.initializePlayers();
    this.teams = this.initializeTeams();
    this.scores = [
      { teamId: 'team0', teamScore: 0 },
      { teamId: 'team1', teamScore: 0 },
    ];
    this.cards = new Cards(config.numPlayers);
    this.deck = this.cards.createDeck();
  }

  // setTeam(seat: number) {
  //   let team = -1;
  //   if (this.config.numOfPlayers === 4) {
  //     team = seat % 2;
  //   }

  //   // use w/ 5/6 player config options
  //   // if (this.config.numOfPlayers === 5) {
  //   //   team = seat;
  //   // }
  //   // if (this.config.numOfPlayers === 6) {
  //   //   team = seat % 3;
  //   // }

  //   return team;
  // }

  addPlayer(id: string, name: string): PlayerType {
    if (this.players.length === this.config.numPlayers)
      throw new Error(`Already ${this.config.numPlayers} players in game`);

    const playerSeat = this.setPlayerSeat();
    const playerTeam = this.teams.findIndex((team) => team.teamSeats.includes(playerSeat));
    const player: PlayerType = {
      playerId: id,
      teamId: this.teams[playerTeam].teamId,
      name: name,
      seat: playerSeat,
    };

    this.players.push(player);
    for (const team of this.teams) {
      if (team.teamSeats.includes(player.seat)) team.teamMembers.push(player.playerId!);
    }

    return player;
  }

  setPlayerSeat(): number {
    const openSeat = this.players.findIndex((player) => player.playerId === null);
    return openSeat;
  }

  initializeTeams(): TeamType[] {
    const numTeams = this.config.numPlayers / 2;
    const teams = [];

    for (let i = 0; i < numTeams; i++) {
      const team: TeamType = {
        teamId: `team${i}`,
        teamSeats: this.getTeamSeats(i),
        teamMembers: [],
      };
      teams.push(team);
    }

    return teams;
  }

  initializePlayers(): PlayerType[] {
    const players: PlayerType[] = [];

    for (let i = 0; i < this.config.numPlayers; i++) {
      const player = {
        playerId: null,
        name: null,
        teamId: `team${i % 2}`,
        seat: i,
      };
      players.push(player);
    }

    return players;
  }

  getTeamSeats(teamIndex: number) {
    const seats = [];
    const { numPlayers } = this.config;

    if (numPlayers === 4) {
      for (let i = teamIndex; i < numPlayers; i += 2) {
        seats.push(i);
      }
    }

    return seats;
  }

  setTeam(seat: number) {
    let team = -1;
    if (this.config.numPlayers === 4) {
      team = seat % 2;
    }

    return team;
  }

  changePlayerSeat() {
    //
  }

  startGame() {
    if (this.players.length !== this.config.numPlayers)
      throw new Error(`Game requires ${this.config.numPlayers} to start`);
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
      this.config.numPlayers,
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
      for (const score of this.scores) {
        if (pointData.teamId === score.teamId) score.teamScore += pointData.points;
      }
    }
  }

  checkIsWinner() {
    const winScore = this.config.scoreToWin;
    const isWinner = this.scores.reduce<{ teamId: string | null; teamScore: number }>(
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

import {
  Deck,
  GameConfig,
  GameType,
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
    this.teams = [];
    this.players = [];
    this.scores = [
      { teamId: 'team0', teamScore: 0 },
      { teamId: 'team1', teamScore: 0 },
    ];
    this.cards = new Cards(config.numPlayers);
    this.deck = this.cards.createDeck();
  }

  initializeGame = (() => {
    this.initializeTeams();
    this.initializePlayers();
    this.addPlayer(this.owner.id, this.owner.name);
  })();

  addPlayer(id: string, name: string): PlayerType {
    if (this.players.length === this.config.numPlayers)
      throw new Error(`Already ${this.config.numPlayers} players in game`);

    const openSeat = this.findOpenSeat();
    const player = { ...this.players[openSeat], playerId: id, name: name };
    const playerTeam = this.teams.find((team) => team.teamId === player.teamId);

    if (!playerTeam) throw new Error('Player not added could not asign player to team');

    this.players[openSeat] = player;
    playerTeam.teamMembers.push(player.playerId!);
    return player;
  }

  findOpenSeat(): number {
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

  getTeamSeats(teamIndex: number): number[] {
    const seats = [];
    const { numPlayers } = this.config;

    for (let i = teamIndex; i < numPlayers; i += numPlayers / 2) {
      seats.push(i);
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

  switchPlayerSeat(movePlayer: PlayerType, moveToSeat?: Seat): void {
    if (this.curRound) throw new Error('Cannot change seats while game is in progress');

    const seatLeft = movePlayer.seat < this.config.numPlayers - 1 ? movePlayer.seat + 1 : 0;
    const switchSeat = moveToSeat || seatLeft;

    const movePlayerIndex = this.players.findIndex((player) => player.seat === movePlayer.seat);
    const switchPlayerIndex = this.players.findIndex((player) => player.seat === switchSeat);
    const { playerId: movePlayerId, name: movePlayerName } = [...this.players][movePlayerIndex];
    const { playerId: switchPlayerId, name: switchPlayerName } = [...this.players][switchPlayerIndex];

    this.players[movePlayerIndex] = {
      ...this.players[movePlayerIndex],
      playerId: switchPlayerId,
      name: switchPlayerName,
    };
    this.players[switchPlayerIndex] = {
      ...this.players[switchPlayerIndex],
      playerId: movePlayerId,
      name: movePlayerName,
    };
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

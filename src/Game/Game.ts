import {
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
import { Round } from '../Round/Round';

export class Game implements GameType {
  players: PlayerType[];
  teams: TeamType[];
  scores: ScoreType[];
  dealer: Seat | null = null;
  round: RoundType | null = null;
  roundSummaries: RoundSummary[] = [];

  constructor(public owner: { id: string; name: string }, readonly gameId: string, readonly config: GameConfig) {
    this.gameId = gameId;
    this.owner = owner;
    this.config = config;
    this.teams = this.initializeTeams();
    this.players = this.initializePlayers();
    this.scores = [
      { teamId: 'team0', teamScore: 0 },
      { teamId: 'team1', teamScore: 0 },
    ];
  }

  addPlayer(id: string, name: string): PlayerType {
    const curPlayers = this.players.filter((player) => player.playerId !== null);
    if (curPlayers.length === this.config.numPlayers)
      throw new Error(`Already ${this.config.numPlayers} players in game`);
    if (curPlayers.find((player) => player.playerId === id))
      throw new Error(`Player ${name} has alread joined the game`);

    const openSeat = this.players.findIndex((player) => player.playerId === null);
    const player = { ...this.players[openSeat], playerId: id, name: name };
    const playerTeam = this.teams.find((team) => team.teamId === player.teamId);

    if (!playerTeam) throw new Error('Player not added could not asign player to team');

    this.players[openSeat] = player;
    playerTeam.teamMembers.push(player.playerId!);
    if (this.round) {
      const playerData = this.round.playersRoundData.find((player) => player.playerId === null);
      playerData!.playerId = id;
      playerData!.name = name;
    }

    return player;
  }

  removePlayer(id: string): void {
    const player = this.players.find((player) => player.playerId === id);
    player!.playerId = null;

    this.teams.map((team) => team.teamMembers.filter((playerId) => playerId !== id));

    if (this.round) {
      const playerData = this.round.playersRoundData.find((player) => player.playerId === id);
      playerData!.playerId = null;
      playerData!.name = null;
    }
  }

  private initializeTeams(): TeamType[] {
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

  private initializePlayers(): PlayerType[] {
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

  private getTeamSeats(teamIndex: number): number[] {
    const seats = [];
    const { numPlayers } = this.config;

    for (let i = teamIndex; i < numPlayers; i += numPlayers / 2) {
      seats.push(i);
    }

    return seats;
  }

  switchPlayerSeat(movePlayer: PlayerType, moveToSeat?: Seat): void {
    if (this.round) throw new Error('Cannot change seats while game is in progress');

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

  startGame(): void {
    if (this.scores.find((score) => score.teamScore !== 0)) throw new Error('Cannot start game during play');
    this.createRound();
  }

  private createRound(): void {
    if (this.players.find((player) => player.playerId === null))
      throw new Error(`Game requires ${this.config.numPlayers} to start`);

    const dealer = this.setDealer();
    const round = new Round(this.config.numPlayers, this.config.minBid, this.players, dealer, this.endRound.bind(this));

    this.round = round;
  }

  private setDealer(): Seat {
    let dealer = this.dealer;
    if (dealer === null) dealer = 0;
    else dealer !== this.players.length - 1 ? dealer++ : (dealer = 0);

    this.dealer = dealer;
    return dealer;
  }

  endRound(roundTotals: RoundTotals): void {
    this.updateScores(roundTotals.roundPoints);
    const winner = this.checkIsWinner();

    if (winner) this.endGame(winner);
    if (!winner) this.createRound();
  }

  private updateScores(roundPoints: RoundPointTotals): void {
    for (const pointData of roundPoints) {
      for (const score of this.scores) {
        if (pointData.teamId === score.teamId) score.teamScore += pointData.points;
      }
    }
  }

  private checkIsWinner(): string | null {
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

  private endGame(teamId: string): void {
    console.log(`Team ${teamId} wins!`);
  }
}

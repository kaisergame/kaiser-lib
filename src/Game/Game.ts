import {
  GameConfig,
  GameType,
  BaseGameType,
  GameVersion,
  PlayerId,
  PlayerType,
  TeamPoints,
  RoundSummary,
  RoundType,
  PlayerIndex,
  TeamType,
  TeamId,
} from '../@types/index';
import { findPlayerById, findPlayerByIndex, findTeamById, validatePlayerIndex } from 'src/utils/helpers';
import { Round } from '../Round/Round';

export class Game implements GameType {
  players: PlayerType[] = [];
  teams: TeamType[] = [];
  dealerIndex: PlayerIndex | null = null;
  round: RoundType | null = null;
  roundSummaries: RoundSummary[] = [];
  version: GameVersion = GameVersion.One;

  constructor(public owner: { id: string; name: string }, readonly gameId: string, readonly config: GameConfig) {
    this.gameId = gameId;
    this.owner = owner;
    this.config = config;

    this.initializeTeams();
    this.initializePlayers();
    this.addPlayer(owner.id, owner.name);
    console.log(this.toJSON());
  }

  toJSON(): BaseGameType {
    return {
      gameId: this.gameId,
      config: this.config,
      owner: this.owner,
      players: this.players,
      teams: this.teams,
      dealerIndex: this.dealerIndex,
      round: this.round?.toJSON() || null,
      roundSummaries: this.roundSummaries,
      version: GameVersion.One,
    };
  }

  static fromJSON(state: BaseGameType): Game {
    const game = new Game(state.owner, state.gameId, state.config);
    game.updateStateFromJSON(state);

    return game;
  }

  updateStateFromJSON(state: BaseGameType): void {
    this.owner = state.owner;
    this.players = state.players;
    this.teams = state.teams;
    this.dealerIndex = state.dealerIndex;
    if (state.round) this.round = Round.fromJSON(state.round, this.endRound.bind(this));
    this.roundSummaries = state.roundSummaries;
  }

  // PLAYERS
  initializeTeams(): void {
    const numTeams = this.config.numPlayers / 2;
    const teams = [];

    for (let i = 0; i < numTeams; i++) {
      const team: TeamType = {
        teamId: `team${i}`,
        teamMembers: [],
        teamScore: 0,
      };
      teams.push(team);
    }

    this.teams = teams;
  }

  initializePlayers(): void {
    const players: PlayerType[] = [];

    for (let i = 0; i < this.config.numPlayers; i++) {
      const player = {
        playerId: null,
        name: null,
        teamId: `team${i % 2}`,
        playerIndex: i,
      };
      players.push(player);
    }

    this.players = players;
  }

  canAddPlayer(id: string): boolean {
    const openPlayer = this.players.find((player) => player.playerId === null);

    if (!openPlayer) return false;
    if (this.players.find((player) => player.playerId === id)) return false;
    if (this.players.length > this.config.numPlayers) return false;

    return true;
  }

  addPlayer(id: string, name: string): void {
    if (!this.canAddPlayer(id)) throw new Error('Player cannot be added');

    const openPlayer = findPlayerById(this.players, null);
    const player = { ...openPlayer, playerId: id, name: name };
    this.addPlayerToTeam(player.playerId, player.teamId);
    this.players[player.playerIndex] = player;

    if (this.round) {
      const playerData = this.round.players.find((player) => player.playerId === null);
      playerData!.playerId = id;
      playerData!.name = name;
    }
  }

  addPlayerToTeam(playerId: PlayerId, teamId: TeamId): void {
    const playerTeam = findTeamById(this.teams, teamId);
    playerTeam.teamMembers.push(playerId);
  }

  removePlayer(playerId: PlayerId): void {
    const player = findPlayerById(this.players, playerId);
    this.removePlayerFromTeam(player.playerId!, player.teamId);
    player.playerId = null;
    player.name = null;

    if (this.round) {
      const player = findPlayerById(this.round.players, playerId);
      player.playerId = null;
      player.name = null;
    }
  }

  removePlayerFromTeam(playerId: PlayerId, teamId: TeamId): void {
    const playerTeam = findTeamById(this.teams, teamId);
    playerTeam.teamMembers.filter((teamMemberId) => teamMemberId !== playerId);
  }

  getTeamPlayerIndex(teamIndex: number): number[] {
    const playerIndexs = [];
    const { numPlayers } = this.config;

    for (let i = teamIndex; i < numPlayers; i += numPlayers / 2) {
      playerIndexs.push(i);
    }

    return playerIndexs;
  }

  switchPlayerIndex(playerIdToMove: PlayerId, moveToIndex: PlayerIndex): void {
    if (this.round) return;
    if (!validatePlayerIndex(moveToIndex)) throw new Error('Cannot move there');

    const movePlayer = findPlayerById(this.players, playerIdToMove)!;
    const copyMovePlayer: PlayerType = JSON.parse(JSON.stringify(movePlayer));
    let { teamMembers: moveTeamMembers } = findTeamById(this.teams, movePlayer.teamId)!;

    const switchPlayer = findPlayerByIndex(this.players, moveToIndex);
    const copySwitchPlayer: PlayerType = JSON.parse(JSON.stringify(switchPlayer));
    let { teamMembers: switchTeamMembers } = findTeamById(this.teams, switchPlayer.teamId)!;

    moveTeamMembers = moveTeamMembers.filter((playerId) => playerId !== copyMovePlayer.playerId);
    copySwitchPlayer.playerId && moveTeamMembers.push(copySwitchPlayer.playerId);
    switchTeamMembers = switchTeamMembers.filter((playerId) => playerId !== copySwitchPlayer.playerId);
    copyMovePlayer.playerId && switchTeamMembers.push(copyMovePlayer.playerId);

    movePlayer.teamId = copySwitchPlayer.teamId;
    movePlayer.playerIndex = copySwitchPlayer.playerIndex;
    switchPlayer.teamId = copyMovePlayer.teamId;
    switchPlayer.playerIndex = copyMovePlayer.playerIndex;

    this.sortPlayers();
  }

  sortPlayers(): void {
    this.players.sort((playerA: PlayerType, playerB: PlayerType) => playerA.playerIndex - playerB.playerIndex);
  }

  canStartGame(): boolean {
    if (this.teams.find((team) => team.teamScore !== 0)) return false;
    if (this.players.find((player) => player.playerId === null)) return false;
    if (this.players.length !== this.config.numPlayers) return false;

    return true;
  }

  // GAMEPLAY
  startGame(): void {
    this.canStartGame() && this.createRound();
  }

  createRound(): void {
    const dealer = this.setDealer();
    const round = new Round(
      this.roundSummaries.length + 1,
      this.config.numPlayers,
      this.config.minBid,
      this.players,
      dealer,
      this.endRound.bind(this)
    );

    this.round = round;
  }

  setDealer(): PlayerIndex {
    let dealer = this.dealerIndex;

    if (dealer === null) dealer = 0;
    else dealer !== this.players.length - 1 ? dealer++ : (dealer = 0);

    this.dealerIndex = dealer;
    return dealer;
  }

  endRound(roundSummary: RoundSummary): void {
    this.updateRoundSummaries(roundSummary);
    this.updateScores(roundSummary.teamPoints);
    // TODO: add Kaiser check
    const winner = this.checkIsWinner();

    if (winner) this.endGame(winner);
    if (!winner) this.createRound();
  }

  updateRoundSummaries(roundSummary: RoundSummary): void {
    this.roundSummaries.push(roundSummary);
  }

  updateScores(teamPoints: TeamPoints): void {
    teamPoints.forEach((pointData) => {
      const team = findTeamById(this.teams, pointData.teamId);
      team.teamScore = team.teamScore + pointData.points;
    });
  }

  checkIsWinner(): string | null {
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

  endGame(teamId: string): void {
    console.log(`Team ${teamId} wins!`);
  }
}

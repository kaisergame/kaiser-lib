import {
  GameConfig,
  GameState,
  GameType,
  GameVersion,
  PlayerId,
  PlayerType,
  TeamPoints,
  RoundSummary,
  RoundType,
  ScoreType,
  PlayerIndex,
  TeamType,
} from '../@types/index';
import { findPlayerById, findPlayerByPlayerIndex, checkPlayerOrder } from 'src/utils/helpers';
import { Round } from '../Round/Round';

export class Game implements GameType {
  players: PlayerType[] = [];
  teams: TeamType[] = [];
  scores: ScoreType[];
  dealerIndex: PlayerIndex | null = null;
  round: RoundType | null = null;
  roundSummaries: RoundSummary[] = [];
  version: GameVersion = GameVersion.One;

  constructor(public owner: { id: string; name: string }, readonly gameId: string, readonly config: GameConfig) {
    this.gameId = gameId;
    this.owner = owner;
    this.config = config;
    this.scores = [
      { teamId: 'team0', teamScore: 0 },
      { teamId: 'team1', teamScore: 0 },
    ];
    this.initializeTeams();
    this.initializePlayers();
    this.addPlayer(owner.id, owner.name);
  }

  toJSON(): GameState {
    return {
      gameId: this.gameId,
      config: this.config,
      owner: this.owner,
      players: this.players,
      teams: this.teams,
      scores: this.scores,
      dealerIndex: this.dealerIndex,
      round: this.round?.toJSON() || null,
      roundSummaries: this.roundSummaries,
      version: GameVersion.One,
    };
  }

  static fromJSON(state: GameState): Game {
    const game = new Game(state.owner, state.gameId, state.config);
    game.updateStateFromJSON(state);

    return game;
  }

  updateStateFromJSON(state: GameState): void {
    this.owner = state.owner;
    this.players = state.players;
    this.teams = state.teams;
    this.scores = state.scores;
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
        teamPlayerIndexs: this.getTeamPlayerIndexs(i),
        teamMembers: [],
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

  canAddPlayer(id: string): false | PlayerType {
    const openPlayer = this.players.find((player) => player.playerId === null);

    if (!openPlayer) return false;
    if (this.players.find((player) => player.playerId === id)) return false;
    if (this.players.length > this.config.numPlayers) return false;

    return openPlayer;
  }

  addPlayer(id: string, name: string): void {
    const openPlayer = this.canAddPlayer(id);
    if (!openPlayer) return;

    const player = { ...openPlayer, playerId: id, name: name };
    const playerTeam = this.teams.find((team) => team.teamId === player.teamId);
    if (!playerTeam) return;

    this.players[player.playerIndex] = player;
    playerTeam.teamMembers.push(player.playerId!);

    if (this.round) {
      const playerData = this.round.players.find((player) => player.playerId === null);
      playerData!.playerId = id;
      playerData!.name = name;
    }
  }

  removePlayer(id: string): void {
    const player = this.players.find((player) => player.playerId === id);
    player!.playerId = null;

    this.teams.map((team) => team.teamMembers.filter((playerId) => playerId !== id));

    if (this.round) {
      const playerData = this.round.players.find((player) => player.playerId === id);
      playerData!.playerId = null;
      playerData!.name = null;
    }
  }

  getTeamPlayerIndexs(teamIndex: number): number[] {
    const playerIndexs = [];
    const { numPlayers } = this.config;

    for (let i = teamIndex; i < numPlayers; i += numPlayers / 2) {
      playerIndexs.push(i);
    }

    return playerIndexs;
  }

  switchPlayerPlayerIndex(playerToMove: PlayerId, moveToPlayerIndex?: PlayerIndex): void {
    if (this.round) return;
    if (
      moveToPlayerIndex &&
      (typeof moveToPlayerIndex !== 'number' || moveToPlayerIndex >= this.config.numPlayers || moveToPlayerIndex < 0)
    )
      return;

    const movePlayer = this.players.find((player) => player.playerId === playerToMove);
    if (movePlayer === undefined) return;

    const playerIndexLeft = movePlayer.playerIndex < this.config.numPlayers - 1 ? movePlayer.playerIndex + 1 : 0;
    const switchPlayerIndex = moveToPlayerIndex || playerIndexLeft;
    const switchPlayer = this.players.find((player) => player.playerIndex === switchPlayerIndex);
    if (switchPlayer === undefined) return;

    const copyMovePlayer: PlayerType = JSON.parse(JSON.stringify(movePlayer));
    const copySwitchPlayer: PlayerType = JSON.parse(JSON.stringify(switchPlayer));
    const moveTeam = this.teams.find((team) => team.teamId === movePlayer.teamId)!;
    const switchTeam = this.teams.find((team) => team.teamPlayerIndexs.includes(switchPlayerIndex))!;

    moveTeam.teamMembers.splice(moveTeam.teamMembers.indexOf(playerToMove), 1);
    switchTeam.teamMembers.push(playerToMove);

    if (switchPlayer.playerId) {
      switchTeam.teamMembers.splice(switchTeam.teamMembers.indexOf(switchPlayer.playerId), 1);
      moveTeam.teamMembers.push(switchPlayer.playerId);
    }

    movePlayer.playerId = copyMovePlayer.playerId;
    movePlayer.name = copyMovePlayer.name;
    movePlayer.teamId = copySwitchPlayer.teamId;
    movePlayer.playerIndex = copySwitchPlayer.playerIndex;

    switchPlayer.playerId = copySwitchPlayer.playerId;
    switchPlayer.name = copySwitchPlayer.name;
    switchPlayer.teamId = copyMovePlayer.teamId;
    switchPlayer.playerIndex = copyMovePlayer.playerIndex;

    this.sortPlayers();
  }

  sortPlayers(): void {
    this.players.sort((playerA: PlayerType, playerB: PlayerType) => playerA.playerIndex - playerB.playerIndex);
  }

  canStartGame(): boolean {
    if (this.scores.find((score) => score.teamScore !== 0)) return false;
    if (this.players.find((player) => player.playerId === null)) return false;
    if (this.players.length > this.config.numPlayers) return false;

    return true;
  }

  // GAMEPLAY
  startGame(): void {
    this.canStartGame() && this.createRound();
  }

  createRound(): void {
    if (!checkPlayerOrder(this.players)) this.sortPlayers;
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

    const winner = this.checkIsWinner();

    if (winner) this.endGame(winner);
    if (!winner) this.createRound();
  }

  updateRoundSummaries(roundSummary: RoundSummary): void {
    this.roundSummaries.push(roundSummary);
  }

  updateScores(teamPoints: TeamPoints): void {
    for (const pointData of teamPoints) {
      for (const score of this.scores) {
        if (pointData.teamId === score.teamId) score.teamScore += pointData.points;
      }
    }
  }

  checkIsWinner(): string | null {
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

  endGame(teamId: string): void {
    console.log(`Team ${teamId} wins!`);
  }
}

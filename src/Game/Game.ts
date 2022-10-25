import {
  GameConfig,
  GameState,
  GameType,
  GameVersion,
  PlayerId,
  PlayerType,
  RoundPointTotals,
  RoundSummary,
  RoundType,
  ScoreType,
  PlayerIndex,
  TeamType,
} from '../@types/index';
import { findPlayerById, findPlayerByPlayerIndex, checkPlayerOrder } from 'src/utils/helpers';
import { Round } from '../Round/Round';

export class Game implements GameType {
  players: PlayerType[];
  teams: TeamType[];
  scores: ScoreType[];
  dealerIndex: PlayerIndex | null = null;
  // eventually round should be private
  roundNum: number = 0;
  round: RoundType | null = null;
  roundSummaries: RoundSummary[] = [];
  version: GameVersion = GameVersion.One;

  constructor(public owner: { id: string; name: string }, readonly gameId: string, readonly config: GameConfig) {
    this.gameId = gameId;
    this.teams = this.initializeTeams();
    this.players = this.initializePlayers();
    this.owner = this.initializeOwner(owner);
    this.config = config;
    this.scores = [
      { teamId: 'team0', teamScore: 0 },
      { teamId: 'team1', teamScore: 0 },
    ];
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
      roundNum: this.roundNum,
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
    if (state.round) {
      this.round = Round.fromJSON(state.round, this.endRound.bind(this));
    }
    this.roundSummaries = state.roundSummaries;
  }

  // PLAYERS
  initializeTeams(): TeamType[] {
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

    return teams;
  }

  initializePlayers(): PlayerType[] {
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

    return players;
  }

  initializeOwner(owner: { id: string; name: string }): { id: string; name: string } {
    this.addPlayer(owner.id, owner.name);
    return owner;
  }

  addPlayer(id: string, name: string): PlayerType {
    const curPlayers = this.players.filter((player) => player.playerId !== null);
    // console.log(curPlayers);

    if (curPlayers.length === this.config.numPlayers)
      throw new Error(`Already ${this.config.numPlayers} players in game`);
    if (curPlayers.find((player) => player.playerId === id))
      throw new Error(`Player ${name} has alread joined the game`);

    const openPlayer = this.players.findIndex((player) => player.playerId === null)!;
    const player = { ...this.players[openPlayer], playerId: id, name: name };
    const playerTeam = this.teams.find((team) => team.teamId === player.teamId);
    // console.log(this.players, player, playerTeam);

    if (!playerTeam) throw new Error('Player not added could not asign player to team');

    this.players[openPlayer] = player;
    playerTeam.teamMembers.push(player.playerId!);
    if (this.round) {
      const playerData = this.round.players.find((player) => player.playerId === null);
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
    if (this.round) throw new Error('Cannot change playerIndexs while game is in progress');
    if (
      moveToPlayerIndex &&
      (typeof moveToPlayerIndex !== 'number' || moveToPlayerIndex >= this.config.numPlayers || moveToPlayerIndex < 0)
    )
      throw new Error(`There is no playerIndex ${moveToPlayerIndex}`);

    const movePlayer = this.players.find((player) => player.playerId === playerToMove);
    if (movePlayer === undefined) throw new Error('Could not find player to move');

    const playerIndexLeft = movePlayer.playerIndex < this.config.numPlayers - 1 ? movePlayer.playerIndex + 1 : 0;
    const switchPlayerIndex = moveToPlayerIndex || playerIndexLeft;
    const switchPlayer = this.players.find((player) => player.playerIndex === switchPlayerIndex);
    if (switchPlayer === undefined) throw new Error('Could not find player to switch');

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

  // GAMEPLAY
  startGame(): void {
    if (this.scores.find((score) => score.teamScore !== 0)) throw new Error('Cannot start game during play');
    if (this.players.find((player) => player.playerId === null))
      throw new Error(`Game requires ${this.config.numPlayers} to start`);

    this.createRound();
  }

  createRound(): void {
    if (!checkPlayerOrder(this.players)) this.sortPlayers;
    const dealer = this.setDealer();
    const round = new Round(
      this.roundNum,
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
    this.updateScores(roundSummary.roundPoints);
    this.roundSummaries.push(roundSummary);

    const winner = this.checkIsWinner();

    if (winner) this.endGame(winner);
    if (!winner) this.createRound();
  }

  updateScores(roundPoints: RoundPointTotals): void {
    for (const pointData of roundPoints) {
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

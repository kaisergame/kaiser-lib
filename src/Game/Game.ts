import {
  GameConfig,
  GameStateType,
  GameType,
  GameVersion,
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
    this.teams = this.initializeTeams();
    this.players = this.initializePlayers();
    this.owner = this.initializeOwner(owner);
    this.config = config;
    this.scores = [
      { teamId: 'team0', teamScore: 0 },
      { teamId: 'team1', teamScore: 0 },
    ];
  }

  toJSON(): GameStateType {
    return {
      gameId: this.gameId,
      config: this.config,
      owner: this.owner,
      players: this.players,
      teams: this.teams,
      scores: this.scores,
      dealer: this.dealer,
      round: this.round?.toJSON() || null,
      roundSummaries: this.roundSummaries,
      version: GameVersion.One,
    };
  }

  static fromJSON(state: GameStateType): Game {
    const game = new Game(state.owner, state.gameId, state.config);
    game.updateStateFromJSON(state);

    return game;
  }

  updateStateFromJSON(state: GameStateType): void {
    this.owner = state.owner;
    this.players = state.players;
    this.teams = state.teams;
    this.scores = state.scores;
    this.dealer = state.dealer;
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

  getTeamSeats(teamIndex: number): number[] {
    const seats = [];
    const { numPlayers } = this.config;

    for (let i = teamIndex; i < numPlayers; i += numPlayers / 2) {
      seats.push(i);
    }

    return seats;
  }

  switchPlayerSeat(playerToMove: PlayerId, moveToSeat?: Seat): void {
    if (this.round) throw new Error('Cannot change seats while game is in progress');
    if (moveToSeat && (typeof moveToSeat !== 'number' || moveToSeat >= this.config.numPlayers || moveToSeat < 0))
      throw new Error(`There is no seat ${moveToSeat}`);

    const movePlayer = this.players.find((player) => player.playerId === playerToMove);
    if (movePlayer === undefined) throw new Error('Could not find player to move');

    const seatLeft = movePlayer.seat < this.config.numPlayers - 1 ? movePlayer.seat + 1 : 0;
    const switchSeat = moveToSeat || seatLeft;
    const switchPlayer = this.players.find((player) => player.seat === switchSeat);
    if (switchPlayer === undefined) throw new Error('Could not find player to switch');

    const copyMovePlayer: PlayerType = JSON.parse(JSON.stringify(movePlayer));
    const copySwitchPlayer: PlayerType = JSON.parse(JSON.stringify(switchPlayer));
    const moveTeam = this.teams.find((team) => team.teamId === movePlayer.teamId)!;
    const switchTeam = this.teams.find((team) => team.teamSeats.includes(switchSeat))!;

    moveTeam.teamMembers.splice(moveTeam.teamMembers.indexOf(playerToMove), 1);
    switchTeam.teamMembers.push(playerToMove);

    if (switchPlayer.playerId) {
      switchTeam.teamMembers.splice(switchTeam.teamMembers.indexOf(switchPlayer.playerId), 1);
      moveTeam.teamMembers.push(switchPlayer.playerId);
    }

    movePlayer.playerId = copyMovePlayer.playerId;
    movePlayer.name = copyMovePlayer.name;
    movePlayer.teamId = copySwitchPlayer.teamId;
    movePlayer.seat = copySwitchPlayer.seat;

    switchPlayer.playerId = copySwitchPlayer.playerId;
    switchPlayer.name = copySwitchPlayer.name;
    switchPlayer.teamId = copyMovePlayer.teamId;
    switchPlayer.seat = copyMovePlayer.seat;
  }

  // GAMEPLAY
  startGame(): void {
    if (this.scores.find((score) => score.teamScore !== 0)) throw new Error('Cannot start game during play');
    if (this.players.find((player) => player.playerId === null))
      throw new Error(`Game requires ${this.config.numPlayers} to start`);

    this.createRound();
  }

  createRound(): void {
    const dealer = this.setDealer();
    const round = new Round(this.config.numPlayers, this.config.minBid, this.players, dealer, this.endRound.bind(this));

    this.round = round;
  }

  setDealer(): Seat {
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

  // todo test this
  canBid(playerId: string): boolean {
    if (!this.round?.biddingOpen()) return false;
    console.log('bidding open');
    if (!this.isActivePlayer(playerId)) return false;
    console.log('is active');
    if (this.round.findBidForPlayer(this.round.activePlayer)) return false;
    console.log('uhh');
    return true;
  }

  // todo test this
  canSetTrump(playerId: string): boolean {
    if (!this.round) return false;

    if (this.round.biddingOpen()) return false;

    if (!this.isActivePlayer(playerId)) return false;

    if (this.round.getTrump()) return false;
    console.log(this.round.winningBid);
    if (this.round.winningBid.bidder !== this.round.activePlayer) return false;

    return true;
  }

  isActivePlayer(playerId: string): boolean {
    const activePlayer = this.getActivePlayer();
    console.log('activePlayer', activePlayer);
    return Boolean(activePlayer && activePlayer.playerId === playerId);
  }

  getActivePlayer(): PlayerType | null {
    if (!this.round?.activePlayer) return null;
    console.log('this.players', this.players);
    console.log('this.round.activePlayer', this.round.activePlayer);
    return this.players[this.round.activePlayer];
  }

  endGame(teamId: string): void {
    console.log(`Team ${teamId} wins!`);
  }
}

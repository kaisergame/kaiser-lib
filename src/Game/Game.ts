import {
  Deck,
  GameConfig,
  GameId,
  GameType,
  PlayerId,
  PlayerType,
  RoundSummary,
  RoundPointTotals,
  RoundTotals,
  RoundType,
  Seat,
  TeamType,
  ScoreType,
} from '../@types/index';
import { Cards } from '../Cards/Cards';
import { Round } from '../Round/Round';

export class Game implements GameType {
  players: PlayerType[];
  teams: TeamType[];
  score: ScoreType[];
  dealer: Seat = 0;
  cards: Cards;
  deck: Deck;
  curRound: RoundType | null = null;
  RoundSummaries: RoundSummary[] = [];

  constructor(public owner: { id: string; name: string }, readonly gameId: string, readonly config: GameConfig) {
    this.gameId = gameId;
    this.owner = owner;
    this.config = config;
    this.players = [];
    this.teams = this.initializeTeams(owner);
    this.score = this.initializeScore();
    this.cards = new Cards(config.numPlayers);
    this.deck = this.cards.createDeck();
  }

  addPlayer(id: string, name: string) {
    if (this.players.length === this.config.numPlayers)
      throw new Error(`Already ${this.config.numPlayers} players in game`);

    const playerSeat = this.setPlayerSeat(),
    const player: PlayerType = {
      playerId: id,
      teamId:
      name: name,
      seat: playerSeat
      // team: this.setTeam(playerSeat),
    };

    this.players.push(player);
    for (const team of this.teams) {
      if (team.teamSeats.includes(player.seat)) team.teamMembers.push(player);
    }

    return player;
  }

  setPlayerSeat() {
    const seats = Array.from(Array(this.config.numPlayers).keys());
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

  initializeTeams(owner: { id: string; name: string }) {
    let numTeams = -1;
    const { numPlayers } = this.config;
    const teams = [];

    if (numPlayers === 4) numTeams = 2;

    for (let i = 0; i < numTeams; i++) {
      const team: TeamType = {
        teamId: `team${i}`,
        teamSeats: this.getTeamSeats(i),
        teamMembers: [],
        teamScore: 0,
      };
      teams.push(team);
    }

    this.addPlayer(owner.id, owner.name);

    return teams;
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
    if (this.players.length !== this.config.numPlayers) throw new Error(`Game requires ${this.config.numPlayers} to start`);
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

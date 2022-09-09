import { CardType, GameConfig, GameType, PlayerType, RoundType, Seat, User } from '../@types/index';
import { Cards } from '../Cards/Cards';
import { Round } from '../Round/Round';

export class Game {
  players: PlayerType[] = [];
  dealer: Seat | null = null;
  cards: any | null = null; //FIXME:
  deck: CardType[] = [];

  constructor(public host: User, readonly config: GameConfig) {
    this.host = host;
    this.config = config;
  }

  addPlayer(user: User) {
    const players = [...this.players];

    const newPlayer = this.createPlayer(user);
    players.push(newPlayer);
  }

  createPlayer(user: User) {
    const player: PlayerType = {
      userId: user.userId,
      seat: this.players.length - 1,
    };
    return player;
  }

  createDeck() {
    const playerNum = this.players.length;
    const cards = new Cards(playerNum);
    const deck = cards.createCards(playerNum);
    this.cards = cards;
    this.deck = deck;
    return deck;
  }

  startGame() {
    this.createRound();
  }

  setDealer() {
    let dealer = this.dealer;
    // if there is no dealer set
    if (dealer === null) dealer = 0;
    // if returns to initial dealer
    if (dealer === this.players.length - 1) dealer = 0;
    else dealer++;

    this.dealer = dealer;
    return dealer;
  }

  createRound() {
    const dealer = this.setDealer();
    const shuffledDeck = this.cards.shuffleDeck(this.deck);
    const round = new Round(this.players, dealer, shuffledDeck, this.endRound);
    return round;
  }

  endRound(roundPoints: number[]) {
    this.updateScores(roundPoints);
    const winner = this.checkIsWinner();
    if (winner) this.endGame();
    if (!winner) this.createRound();
  }

  updateScores(roundPoints: number[]) {
    // how
  }

  checkIsWinner(): boolean {
    return false;
  }

  endGame(winner?: PlayerType | PlayerType[]) {
    //
  }
}

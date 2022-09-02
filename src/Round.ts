import { DeckCl } from './Deck/Deck';
import { TrickCl } from './Trick';
import { Hand, Player, PlayerRoundData, Seat, UserId } from './types/index';

export class Round {
  playerRoundData: PlayerRoundData;
  hands: Hand[];

  constructor(public players: Player[], dealer: Seat, public endRound: (roundPoints: number[]) => number[]) {
    this.players = players;
    this.hands = [];
    this.playerRoundData = players.map((player, i) => {
      return {
        userID: player.userId,
        seat: i as Seat,
        bid: undefined,
        dealer: dealer,
        tricksTaken: 0,
      };
    });
    this.endRound = endRound;
  }
  dealHands() {
    const playerNum = this.players.length;
    const deck = new DeckCl(playerNum);
  }
  playerBid(dealer: number) {
    //
  }
  updateBids(bid: number) {
    //
  }
  createTrick() {
    const trick = new TrickCl(this.players);
  }

  updatePoints() {
    //
  }

  evaluateRound() {
    endRound();
  }

  isBidMade() {
    //
  }
}

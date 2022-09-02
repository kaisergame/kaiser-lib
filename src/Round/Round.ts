import { Hand, PlayerRoundData, PlayerType, Seat, UserId } from '../@types/index';
import { Deck } from '../Deck/Deck';
import { Trick } from '../Trick';

export class Round {
  playerRoundData: PlayerRoundData;
  hands: Hand[];

  constructor(public players: PlayerType[], dealer: Seat, public endRound: (roundPoints: number[]) => number[]) {
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
    const deck = new Deck(playerNum);
    const cards = deck.createCards(playerNum);
    const shuffled = deck.shuffleDeck(cards);
  }

  turnOrder(bids: number[]) {
    // turn order needs to be based off of winning bidder (who plays first)
  }

  playerBid(dealer: number) {
    //
  }
  updateBids(bid: number) {
    //
  }
  createTrick() {
    const trick = new Trick(this.players, hands);
  }

  updatePoints() {
    //
  }

  evaluateRound() {
    // endRound();
  }

  isBidMade() {
    //
  }
}

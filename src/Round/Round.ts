import { Bid, CardType, Hand, PlayerRoundData, PlayerType, Seat, UserId } from '../@types/index';
import { Cards } from '../Cards/Cards';
import { Trick } from '../Trick/Trick';

export class Round {
  playerRoundData: PlayerRoundData;
  hands: Hand[];
  bids: Bid[];
  tricks: {
    trickPoints: number;
    cardsPlayed: CardType[];
    trickWonBy: PlayerType;
  }[];

  constructor(public players: PlayerType[], dealer: Seat, public endRound: (roundPoints: number[]) => number[]) {
    this.players = players;
    this.hands = [];
    this.bids = [];
    this.tricks = [];
    this.playerRoundData = players.map((player, i) => {
      return {
        userID: player.userId,
        seat: i as Seat,
        bid: undefined,
        isDealer: dealer === i,
        tricksTaken: 0,
      };
    });
    this.endRound = endRound;
  }
  createHands() {
    const playerNum = this.players.length;
    const cards = new Cards(playerNum);
    const deck = cards.createCards(playerNum);
    const shuffledDeck = cards.shuffleDeck(deck);

    this.dealHands(playerNum, shuffledDeck);
  }

  dealHands(playerNum: number, deck: CardType[]) {
    let dealToSeat = 0;
    // create empty hands
    for (let i = 0; i < playerNum; i++) {
      this.hands.push([]);
    }
    deck.map((card) => {
      this.hands[dealToSeat].push(card);
      dealToSeat !== playerNum - 1 ? dealToSeat++ : (dealToSeat = 0);
    });
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

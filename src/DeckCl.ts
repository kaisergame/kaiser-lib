import { CARDS_IN_DECK, HAND_SIZE, SUITS_NUM } from './constants/index';
import { Card, CardName, Suit } from './types/index';

export class DeckCl {
  cards: Card[];

  constructor(public playerNum: number) {
    this.playerNum = playerNum;
    this.cards = [];
  }

  public createCards(players: number): Card[] {
    const newCards: Card[] = [];
    let faceValue = 1;
    const playValue = faceValue === 1 ? 14 : faceValue;
    const cardsPerSuit = (players * HAND_SIZE) / SUITS_NUM;
    const suits: Suit[] = [Suit.Spades, Suit.Hearts, Suit.Clubs, Suit.Diamonds];
    for (let i = 1; i <= CARDS_IN_DECK; i++) {
      if (!(i % 13)) {
        suits.shift();
        faceValue = 1;
      }

      if (faceValue > 1 && faceValue <= 13 - cardsPerSuit + 1) {
        faceValue++;
        continue;
      }
      const name: string = Object.keys(CardName)[i];

      const card = {
        suit: suits[0],
        name: name,
        value: faceValue,
        playValue: playValue,
        trump: false,
      };
      newCards.push(card as Card);
      faceValue++;
    }
    return newCards;
  }

  public setTrumpCardValue(deck: Card[], trump: Suit | null) {
    if (!trump) return deck;

    const trumpDeck = deck.map((card) => {
      if (card.suit === trump) card.trump = true;
      card.playValue = card.playValue + 14;
      return card;
    });

    return trumpDeck;
  }

  public shuffleDeck(deck: Card[]) {
    // Fisher–Yates Shuffle
    let unshuffled = deck.length;
    let t, cardIndex;
    // TODO: add better randomization to shuffling w/ Date
    // const random = new Date().getMilliseconds()

    while (unshuffled) {
      // select a random card from the unshuffled part of the array
      cardIndex = Math.floor(Math.random() * unshuffled--);

      // place the random card at the back of the unshuffled cards
      t = deck[unshuffled];
      deck[unshuffled] = deck[cardIndex];
      deck[cardIndex] = t;
    }

    return deck;
  }
}

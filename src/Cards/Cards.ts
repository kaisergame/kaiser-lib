import { CardName, CardType, Suit } from '../@types/index';
import { CARDS_IN_DECK, CARDS_PER_SUIT, HAND_SIZE, SUITS_NUM } from '../constants/index';

export class Deck {
  cards: CardType[];

  constructor(public playerNum: number) {
    this.playerNum = playerNum;
    this.cards = [];
  }

  public createCards(players: number): CardType[] {
    const newCards: CardType[] = [];

    const cardsInPlay = (players * HAND_SIZE) / SUITS_NUM;
    const suits: Suit[] = [Suit.Spades, Suit.Hearts, Suit.Clubs, Suit.Diamonds];
    let faceValue = 1;

    for (let i = 0; i < CARDS_IN_DECK; i++) {
      // make Aces high
      const playValue = faceValue === 1 ? 14 : faceValue;
      // check if i has reached a multiple of 13 and change suit
      if (i !== 0 && !(i % CARDS_PER_SUIT)) {
        suits.shift();
        faceValue = 1;
      }
      // skip over cards that are not used
      if (faceValue > 1 && faceValue <= CARDS_PER_SUIT - cardsInPlay + 1) {
        faceValue++;
        continue;
      }
      const name: CardName = Object.values(CardName)[faceValue - 1];

      let card = {
        suit: suits[0],
        name: name,
        value: faceValue,
        playValue: playValue,
        trump: false,
      };

      // add 5H and 3S to the deck
      if (card.suit === Suit.Hearts && card.value === 7)
        card = { ...card, name: CardName.Five, value: 5, playValue: 5 };
      if (card.suit === Suit.Spades && card.value === 7)
        card = { ...card, name: CardName.Three, value: 3, playValue: 3 };

      newCards.push(card as CardType);
      faceValue++;
    }
    return newCards;
  }

  public setTrumpCardValue(deck: CardType[], trump: Suit | null) {
    if (!trump) return deck;

    const trumpDeck = deck.map((card) => {
      if (card.suit === trump) card.trump = true;
      card.playValue = card.playValue + 14;
      return card;
    });

    return trumpDeck;
  }

  public shuffleDeck(deck: CardType[]) {
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

import { CardType } from 'src/@types';

import { Cards } from './Cards';

describe('Deck', () => {
  let numPlayers: number, cards: InstanceType<typeof Cards>, deck: CardType[];
  beforeAll(() => {
    numPlayers = 4;
    cards = new Cards(numPlayers);
    deck = cards.createCards(numPlayers);
  });

  describe('initializeDeck for a 4 player game', () => {
    test('deck should have 32 cards', () => {
      const cardsLength = deck.length;
      expect(cardsLength).toBe(32);
    });

    test('deck should have one 5 (of Hearts)', () => {
      const five = deck.filter((card) => card.name === 'FIVE');

      expect(five).toStrictEqual([
        {
          suit: 'HEARTS',
          name: 'FIVE',
          faceValue: 5,
          playValue: 5,
        },
      ]);
    });

    test('deck should have one 3 (of Spades)', () => {
      const three = deck.filter((card) => card.name === 'THREE');

      expect(three).toStrictEqual([
        {
          suit: 'SPADES',
          name: 'THREE',
          faceValue: 3,
          playValue: 3,
        },
      ]);
    });

    test('deck should have four kings', () => {
      const kingsNum = deck.filter((card) => card.name === 'KING').length;
      expect(kingsNum).toBe(4);
    });

    test('ace should have a playValue of 14', () => {
      const ace = deck.find((card) => card.name === 'ACE');
      expect(ace?.playValue).toBe(14);
    });
  });

  describe('shuffle 4 player deck', () => {
    test('shuffled deck differs from unshuffled deck', () => {
      const deckCopy = [...deck];

      expect(deck).toEqual(deckCopy);

      cards.shuffleDeck(deckCopy);
      console.log(deckCopy);
      expect(deck).not.toEqual(deckCopy);
    });
  });
});

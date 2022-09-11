import { Cards } from './Cards';

describe('Deck', () => {
  describe('createDeck for a 4 player game', () => {
    // beforeEach(() => {});

    test('deck should have 32 cards', () => {
      const playerNum = 4;
      const cards = new Cards(playerNum);
      const deck = cards.createCards(playerNum);

      const cardsLength = deck.length;
      expect(cardsLength).toBe(32);
    });

    test('deck should have one 5 (of Hearts)', () => {
      const playerNum = 4;
      const cards = new Cards(playerNum);
      const deck = cards.createCards(playerNum);
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
      const playerNum = 4;
      const cards = new Cards(playerNum);
      const deck = cards.createCards(playerNum);
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
      const playerNum = 4;
      const cards = new Cards(playerNum);
      const deck = cards.createCards(playerNum);

      const kingsNum = deck.filter((card) => card.name === 'KING').length;
      expect(kingsNum).toBe(4);
    });

    test('ace should have a playValue of 14', () => {
      const playerNum = 4;
      const cards = new Cards(playerNum);
      const deck = cards.createCards(playerNum);

      const ace = deck.find((card) => card.name === 'ACE');
      expect(ace?.playValue).toBe(14);
    });
  });

  describe('shuffle 4 player deck', () => {
    test('shuffled deck differs from unshuffled deck', () => {
      const playerNum = 4;
      const cards = new Cards(playerNum);
      const deck = cards.createCards(playerNum);
      const deckCopy = [...deck];

      expect(deck).toEqual(deckCopy);

      cards.shuffleDeck(deckCopy);
      console.log(deckCopy);
      expect(deck).not.toEqual(deckCopy);
    });
  });
});

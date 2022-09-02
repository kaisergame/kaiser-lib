import { Deck } from './Cards';

describe('Deck', () => {
  describe('createDeck for a 4 player game', () => {
    // beforeEach(() => {});

    test('deck should have 32 cards', () => {
      const playerNum = 4;
      const deck = new Deck(playerNum);
      const cards = deck.createCards(playerNum);

      const cardsLength = cards.length;
      expect(cardsLength).toBe(32);
    });

    test('deck should have one 5 (of Hearts)', () => {
      const playerNum = 4;
      const deck = new Deck(playerNum);
      const cards = deck.createCards(playerNum);
      const five = cards.filter((card) => card.name === 'FIVE');

      expect(five).toStrictEqual([
        {
          suit: 'HEARTS',
          name: 'FIVE',
          value: 5,
          playValue: 5,
          trump: false,
        },
      ]);
    });

    test('deck should have one 3 (of Spades)', () => {
      const playerNum = 4;
      const deck = new Deck(playerNum);
      const cards = deck.createCards(playerNum);
      const three = cards.filter((card) => card.name === 'THREE');

      expect(three).toStrictEqual([
        {
          suit: 'SPADES',
          name: 'THREE',
          value: 3,
          playValue: 3,
          trump: false,
        },
      ]);
    });

    test('deck should have four kings', () => {
      const playerNum = 4;
      const deck = new Deck(playerNum);
      const cards = deck.createCards(playerNum);

      const kingsNum = cards.filter((card) => card.name === 'KING').length;
      expect(kingsNum).toBe(4);
    });

    test('ace should have a playValue of 14', () => {
      const playerNum = 4;
      const deck = new Deck(playerNum);
      const cards = deck.createCards(playerNum);

      const ace = cards.find((card) => card.name === 'ACE');
      expect(ace?.playValue).toBe(14);
    });
  });

  describe('shuffle 4 player deck', () => {
    test('shuffled deck differs from unshuffled deck', () => {
      const playerNum = 4;
      const deck = new Deck(playerNum);
      const cards = deck.createCards(playerNum);
      const cardsCopy = [...cards];

      expect(cards).toEqual(cardsCopy);

      deck.shuffleDeck(cardsCopy);
      console.log(cardsCopy);
      expect(cards).not.toEqual(cardsCopy);
    });
  });
});

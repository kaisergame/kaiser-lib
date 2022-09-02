import { Deck } from './Deck';

describe('Deck', () => {
  describe('a deck object for 4 player game', () => {
    // beforeEach(() => {});

    test('deck should have 32 cards', () => {
      const playerNum = 4;
      const deck = new Deck(playerNum);
      const cards = deck.createCards(playerNum);
      const cardsLength = cards.length;

      expect(cardsLength).toBe(32);
    });

    // test('deck should have A-7S', () => {
    //   const playerNum = 4;
    //   const deck = new Deck(playerNum);
    //   const cards = deck.createCards(playerNum);
    //   const spades;
    //   expect(cardsLength).toBe(32);
    // });

    test('ace should have a playValue of 14', () => {
      const playerNum = 4;
      const deck = new Deck(playerNum);
      const cards = deck.createCards(playerNum);
      const ace = cards.find((card) => card.name === 'ACE');
      console.log(cards);

      //   expect(ace?.playValue).toBe(14);
    });
  });
});

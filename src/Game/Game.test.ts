import { Round } from '../Round/Round';
import { Game } from './Game';

const game = new Game();

describe('Game', () => {
  describe('create a new Round within a game', () => {
    // beforeEach(() => {});

    test('4 player round should have 4 players', () => {
      const round = new Round(4, 5, players, 0, shuffledDeck, endRound);
      const playerNum = round.players.length;

      expect(playerNum).toBe(4);
    });

    //   describe('shuffle 4 player deck', () => {
    //     test('shuffled deck differs from unshuffled deck', () => {
    //       const playerNum = 4;
    //       const cards = new Cards(playerNum);
    //       const deck = cards.createCards(playerNum);
    //       const deckCopy = [...deck];

    //       expect(deck).toEqual(deckCopy);

    //       cards.shuffleDeck(deckCopy);
    //       console.log(deckCopy);
    //       expect(deck).not.toEqual(deckCopy);
    //     });
  });
});

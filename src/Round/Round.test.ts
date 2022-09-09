import { Seat } from '../@types/index';
import { Round } from './Round';

const players = [
  {
    userId: 'player1',
    seat: 0,
  },
  {
    userId: 'player2',
    seat: 1,
  },
  {
    userId: 'player3',
    seat: 2,
  },
  {
    userId: 'player4',
    seat: 3,
  },
];

const endRound = (roundPoints: number[]) => {
  return roundPoints;
};

describe('Round', () => {
  describe('create a new Round within a game', () => {
    // beforeEach(() => {});

    test('4 player round should have 4 players', () => {
      const round = new Round(players, 0, endRound);
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

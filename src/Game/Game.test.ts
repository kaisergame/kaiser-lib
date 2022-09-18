import { CardName, Suit } from '../@types';
import { Cards } from '../Cards/Cards';
import * as mock from '../constants/mocks';
import { Round } from '../Round/Round';
import { Game } from './Game';

describe('Game with 4 players', () => {
  let game: InstanceType<typeof Game>;
  beforeAll(() => {
    game = new Game(mock.MOCK_USER_1, mock.MOCK_GAME_CONFIG);
  });

  describe('addPlayer method', () => {
    test('addPlayer should increase Game players by 1', () => {
      const initialPlayerNum = game.players.length;
      game.addPlayer(mock.MOCK_USER_2);

      expect(game.players.length).toBe(initialPlayerNum + 1);
    });

    test('addPlayer should give expected values for userId, seat, and team', () => {
      game.addPlayer(mock.MOCK_USER_2);
      game.addPlayer(mock.MOCK_USER_3);

      expect(game.players[1].playerId).toBe(mock.MOCK_USER_2.userId);
      expect(game.players[1].team).toBe(1);
      expect(game.players[2].seat).toBe(2);
      expect(game.players[2].team).toBe(0);
    });
  });

  describe('setTeam method', () => {
    test('setTeam should return 0 for even/zero Seat numbers, 1 for odd', () => {
      const zeroSeat = game.setTeam(0);
      const twoSeat = game.setTeam(2);
      const threeSeat = game.setTeam(3);

      expect(zeroSeat).toBe(0);
      expect(twoSeat).toBe(0);
      expect(threeSeat).toBe(1);
    });
  });

  describe('initializeDeck method', () => {
    test('cards should be instance of Cards', () => {
      game.initializeDeck();

      expect(game.cards).toBeInstanceOf(Cards);
    });

    test('the deck should have 32 cards', () => {
      game.initializeDeck();

      expect(game.deck.length).toBe(32);
      expect(game.deck[0]).toStrictEqual({ suit: Suit.Spades, name: CardName.Ace, faceValue: 1, playValue: 14 });
    });
  });

  describe('setDealer method', () => {
    test('dealer starts null; setDealer should iterate through 0,1,2,3', () => {
      expect(game.dealer).toBeNull();

      game.setDealer();
      expect(game.dealer).toBe(0);
      game.setDealer();
      expect(game.dealer).toBe(1);

      for (let i = 0; i < 7; i++) {
        game.setDealer();
      }
      expect(game.dealer).toBe(0);
    });
  });

  describe('createRound method', () => {
    beforeAll(() => {
      game.players = mock.MOCK_PLAYERS;
      game.createRound();
    });

    test('curRound should be instance of Round', () => {
      expect(game.curRound).toBeInstanceOf(Round);
    });

    test('4 player round should have 4 players', () => {
      expect(game.curRound?.playersRoundData.length).toBe(4);
    });
  });

  describe('updateScore method', () => {
    beforeEach(() => {
      game.teams[0].score = 23;
      game.teams[0].score = -10;
    });

    test('score of 8 and 2 should be added to respective teams', () => {
      game.updateScores([8, 2]);
      expect(game.teams).toStrictEqual([31, -8]);
    });
    test('score of -16 and 5 should be added to respective teams', () => {
      game.updateScores([-16, 5]);
      expect(game.scores).toStrictEqual([7, -5]);
    });
  });

  describe('checkIsWinner method', () => {
    test('team 1 should be winner', () => {
      game.scores = [30, 54];
      const isWinner = game.checkIsWinner();
      expect(isWinner).toBe(1);
    });
    test('there should be no winner (return -1)', () => {
      game.scores = [-53, 51];
      const isWinner = game.checkIsWinner();
      expect(isWinner).toBe(-1);
    });
    test('if both teams are over scoreToWin the higher score should win', () => {
      game.scores = [58, 53];
      const isWinner = game.checkIsWinner();
      expect(isWinner).toBe(0);
    });
  });

  describe('endRound method', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('if a team score is over scoreToWin endGame is called', () => {
      game.scores = [50, 42];
      const spy = jest.spyOn(game, 'endGame');
      game.endRound(mock.MOCK_ROUND_TOTALS);
      expect(spy).toBeCalledTimes(1);
    });

    test('if a team score is not over scoreToWin createRound is called', () => {
      game.scores = [12, 18];
      const spy = jest.spyOn(game, 'createRound');
      game.endRound(mock.MOCK_ROUND_TOTALS);
      expect(spy).toBeCalledTimes(1);
    });
  });
});

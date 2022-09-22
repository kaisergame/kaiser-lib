import * as mock from '../constants/mocks';
import { Round } from '../Round/Round';
import { Game } from './Game';

describe('Game with 4 players', () => {
  let game: Game;
  beforeAll(() => {
    game = new Game(mock.MOCK_USER_1, 'gameId12345', mock.MOCK_GAME_CONFIG);
  });

  describe('addPlayer method', () => {
    test('addPlayer should increase non-null Game players.playerId by 1', () => {
      const initialPlayerNum = 0;
      game.addPlayer(mock.MOCK_USER_2.id, mock.MOCK_USER_2.name);

      expect(game.players.filter((player) => player.playerId !== null).length).toBe(initialPlayerNum + 1);
    });

    test('addPlayer should give expected values for userId, seat, and team', () => {
      game.addPlayer(mock.MOCK_USER_2.id, mock.MOCK_USER_2.name);
      game.addPlayer(mock.MOCK_USER_3.id, mock.MOCK_USER_3.name);

      expect(game.players[1].playerId).toBe(mock.MOCK_USER_2.id);
      expect(game.players[1].teamId).toBe('team1');
      expect(game.players[2].seat).toBe(2);
      expect(game.players[2].teamId).toBe('team0');
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
      game.scores[0] = { teamId: 'team0', teamScore: 23 };
      game.scores[1] = { teamId: 'team1', teamScore: -10 };
    });

    test('score of -9 and 4 should be added to respective teams', () => {
      game.updateScores(mock.MOCK_ROUND_TOTALS.roundPoints);
      expect(game.scores).toStrictEqual([
        { teamId: 'team0', teamScore: 14 },
        { teamId: 'team1', teamScore: -6 },
      ]);
    });
    test('score of -1 and 22 should be added to respective teams', () => {
      game.updateScores(mock.MOCK_ROUND_TOTALS_2.roundPoints);
      expect(game.scores).toStrictEqual([
        { teamId: 'team0', teamScore: 22 },
        { teamId: 'team1', teamScore: 12 },
      ]);
    });
  });

  describe('checkIsWinner method', () => {
    test('team 1 should be winner', () => {
      game.scores[0] = { teamId: 'team0', teamScore: 30 };
      game.scores[1] = { teamId: 'team1', teamScore: 54 };
      const isWinner = game.checkIsWinner();
      expect(isWinner).toBe('team1');
    });
    test('there should be no winner (return -1)', () => {
      game.scores[0] = { teamId: 'team0', teamScore: -53 };
      game.scores[1] = { teamId: 'team1', teamScore: 51 };
      const isWinner = game.checkIsWinner();
      expect(isWinner).toBe(null);
    });
    test('if both teams are over scoreToWin the higher score should win', () => {
      game.scores[0] = { teamId: 'team0', teamScore: 58 };
      game.scores[1] = { teamId: 'team1', teamScore: 53 };
      const isWinner = game.checkIsWinner();
      expect(isWinner).toBe('team0');
    });
  });

  describe('endRound method', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('if a team score is over scoreToWin endGame is called', () => {
      game.scores[0] = { teamId: 'team0', teamScore: 42 };
      game.scores[1] = { teamId: 'team1', teamScore: 50 };
      const spy = jest.spyOn(game, 'endGame');
      game.endRound(mock.MOCK_ROUND_TOTALS);
      expect(spy).toBeCalledTimes(1);
    });

    test('if a team score is not over scoreToWin createRound is called', () => {
      game.scores[0] = { teamId: 'team0', teamScore: 12 };
      game.scores[1] = { teamId: 'team1', teamScore: 18 };
      const spy = jest.spyOn(game, 'createRound');
      game.endRound(mock.MOCK_ROUND_TOTALS);
      expect(spy).toBeCalledTimes(1);
    });
  });
});

describe('4 Player Game playthrough', () => {
  let game: Game;
  beforeAll(() => {
    game = new Game(mock.MOCK_USER_1, 'gameId12345', mock.MOCK_GAME_CONFIG);
  });

  describe('add players to game', () => {
    test('addPlayer', () => {
      game.addPlayer(mock.MOCK_USER_1.id, mock.MOCK_USER_1.name);
      game.addPlayer(mock.MOCK_USER_2.id, mock.MOCK_USER_2.name);
      expect(game.players.filter((player) => player.playerId !== null).length).toBe(2);
      game.addPlayer(mock.MOCK_USER_3.id, mock.MOCK_USER_3.name);
      game.addPlayer(mock.MOCK_USER_4.id, mock.MOCK_USER_4.name);

      expect(game.players.filter((player) => player.playerId !== null).length).toBe(4);
      expect(game.players).toStrictEqual(mock.MOCK_PLAYERS);
    });
  });

  // describe('create Round', () => {
  //   test('round is created', () => {
  //     game.createRound();
  //     expect(game.curRound).toMatchObject<InstanceType<typeof Round>>();
  //   });
  // });
});

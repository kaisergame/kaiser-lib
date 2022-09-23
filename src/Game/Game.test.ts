import { BidAmount, CardName, Suit } from '../@types';
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
      game.addPlayer(mock.MOCK_USER_1.id, mock.MOCK_USER_1.name);

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

    test('round should be instance of Round', () => {
      expect(game.round).toBeInstanceOf(Round);
    });

    test('4 player round should have 4 players', () => {
      expect(game.round?.playersRoundData.length).toBe(4);
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

// GAME START AND ROUND PLAYTHROUGH
describe('4 Player Game playthrough', () => {
  let game: Game;
  beforeAll(() => {
    game = new Game(mock.MOCK_USER_1, 'gameId12345', mock.MOCK_GAME_CONFIG);
  });

  describe('add players to game', () => {
    test('addPlayer adds players to game.players', () => {
      game.addPlayer(mock.MOCK_USER_1.id, mock.MOCK_USER_1.name);
      game.addPlayer(mock.MOCK_USER_2.id, mock.MOCK_USER_2.name);
      expect(game.players.filter((player) => player.playerId !== null).length).toBe(2);
      expect(game.players[1]).toStrictEqual(mock.MOCK_PLAYERS[1]);
    });

    test('if less than 4 players, cannot start gameplay (createRound)', () => {
      game.addPlayer(mock.MOCK_USER_3.id, mock.MOCK_USER_3.name);
      expect(() => game.createRound()).toThrowError();
    });
    test('cannot add the same player twice', () => {
      expect(() => game.addPlayer(mock.MOCK_USER_2.id, mock.MOCK_USER_2.name)).toThrowError();
    });

    test('if 4 players are added, cannot add more players to game of 4', () => {
      game.addPlayer(mock.MOCK_USER_4.id, mock.MOCK_USER_4.name);
      expect(() => game.addPlayer(mock.MOCK_USER_5.id, mock.MOCK_USER_5.name)).toThrowError();
      expect(game.players.filter((player) => player.playerId !== null).length).toBe(4);
      expect(game.players).toStrictEqual(mock.MOCK_PLAYERS);
    });
  });

  describe('create Round', () => {
    test('if 4 players, can call createRound', () => {
      const spy = jest.spyOn(game, 'createRound');
      game.createRound();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('round is an instance of Round', () => {
      expect(game.round).toBeInstanceOf(Round);
    });
  });

  describe('orderOfPlay', () => {
    test('orderOfPlay will initiate activePlayer to Seat 1', () => {
      const spy = jest.spyOn(game.round!, 'orderOfPlay');
      game.round?.orderOfPlay();
      expect(spy).toBeCalledTimes(1);
      expect(game.round?.dealer).toBe(0);
      expect(game.round?.activePlayer).toBe(1);
    });
  });

  describe('bidding', () => {
    test('cannot call playCard before each player has bid', () => {
      expect(() =>
        game.round?.playCard({ suit: Suit.Diamonds, name: CardName.Ace, faceValue: 1, playValue: 14 })
      ).toThrowError();
    });

    test('validBids will return all valid bids to player', () => {
      expect(game.round?.validBids()).toStrictEqual(mock.MOCK_VALID_BIDS);
    });

    test('if setPlayerBid is passed an invalid bid it throws an error', () => {
      expect(() => game.round?.setPlayerBid(BidAmount.Five)).toThrowError();
    });

    test('if setPlayerBid is passed a valid bid it is added to end of bids array', () => {
      expect(game.round?.activePlayer).toBe(1);
      game.round?.setPlayerBid(BidAmount.Seven);
    });

    test('updateActivePlayer will move turn one position "left"', () => {
      game.round?.updateActivePlayer();
      expect(game.round?.activePlayer).toBe(2);
      game.round?.setPlayerBid(BidAmount.SevenNo);
    });

    test('dealer can take bid for current high bid; setWinningBid is called after 4 bids', () => {
      game.round?.updateActivePlayer();
      expect(game.round?.activePlayer).toBe(3);
      expect(() => game.round?.setPlayerBid(BidAmount.SevenNo)).toThrowError();
      game.round?.setPlayerBid(BidAmount.Eight);

      game.round?.updateActivePlayer();
      expect(game.round?.activePlayer).toBe(game.round?.dealer);

      const spyWin = jest.spyOn(game.round!, 'setWinningBid');
      const spyOrder = jest.spyOn(game.round!, 'orderOfPlay');

      game.round?.setPlayerBid(BidAmount.Eight);
      expect(spyWin).toBeCalledTimes(1);
      expect(spyOrder).toBeCalledTimes(1);
      expect(game.round?.winningBid).toStrictEqual({ amount: 8, bidder: 0, isTrump: true });
      expect(game.round?.activePlayer).toBe(0);
    });

    test('setPlayerBid will throw error if 4 bids have already been made', () => {
      expect(() => game.round?.setPlayerBid(BidAmount.Ten)).toThrowError();
    });

    test('setPlayerBid will throw error if 4 bids have already been made', () => {
      expect(() => game.round?.setPlayerBid(BidAmount.Ten)).toThrowError();
    });

    test('setTrump must be called for trump bids before playCard', () => {
      expect(() =>
        game.round?.playCard({ suit: Suit.Diamonds, name: CardName.Ace, faceValue: 1, playValue: 14 })
      ).toThrowError();
    });

    test('setTrump asigns passed suit to round trump', () => {
      game.round?.setTrump(Suit.Hearts);
      expect(game.round?.trump).toBe(Suit.Hearts);
    });
  });

  describe('card play', () => {
    beforeAll(() => {
      game.round!.hands = mock.MOCK_HANDS;
      game.round?.sortHands();
      console.log(game.round?.hands);
    });
    test('activePlayer will be bid winner', () => {
      expect(game.round?.activePlayer).toBe(game.round?.winningBid.bidder);
    });

    test('activePlayer will be bid winning', () => {
      expect(game.round?.activePlayer).toBe(0);
    });
  });
});

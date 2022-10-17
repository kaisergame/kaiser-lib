import { BidAmount, CardName, Suit } from '../@types';
import { HAND_SIZE } from '../constants/index';
import * as mock from '../constants/mocks';
import { Round } from '../Round/Round';
import { Game } from './Game';

describe('Game with 4 players', () => {
  let game: Game;
  beforeAll(() => {
    game = new Game(mock.MOCK_USER_0, 'gameId12345', mock.MOCK_GAME_CONFIG);
  });

  describe('addPlayer method', () => {
    test('addPlayer should increase non-null Game players.playerId by 1', () => {
      const initialPlayerNum = 0;

      expect(game.players.filter((player) => player.playerId !== null).length).toBe(initialPlayerNum + 1);
    });

    test('addPlayer should give expected values for userId, seat, and team', () => {
      game.addPlayer(mock.MOCK_USER_1.id, mock.MOCK_USER_1.name);
      game.addPlayer(mock.MOCK_USER_2.id, mock.MOCK_USER_2.name);

      expect(game.players[1].playerId).toBe(mock.MOCK_USER_1.id);
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

  describe('switchPlayerSeat method', () => {
    beforeEach(() => {
      game.teams = game.initializeTeams();
      game.players = game.initializePlayers();

      game.addPlayer(mock.MOCK_USER_0.id, mock.MOCK_USER_0.name);
      game.addPlayer(mock.MOCK_USER_1.id, mock.MOCK_USER_1.name);
      game.addPlayer(mock.MOCK_USER_2.id, mock.MOCK_USER_2.name);
      game.addPlayer(mock.MOCK_USER_3.id, mock.MOCK_USER_3.name);
    });
    test('a player passed to switchPlayerSeat will be moved 1 seat left', () => {
      console.log(game.teams);

      game.switchPlayerSeat('mockUser0000');
      console.log(game.teams);

      expect(game.players[0]).toStrictEqual({
        playerId: 'mockUser0000',
        name: 'Ryan',
        teamId: 'team1',
        seat: 1,
      });
      expect(game.players[1]).toStrictEqual({
        playerId: 'mockUser1111',
        name: 'Cody',
        teamId: 'team0',
        seat: 0,
      });

      expect(game.teams[0].teamMembers).toStrictEqual(['mockUser2222', 'mockUser1111']);
      expect(game.teams[1].teamMembers).toStrictEqual(['mockUser3333', 'mockUser0000']);
    });

    test('if called with seat, player switches to that seat, player in that seat goes to player position', () => {
      game.switchPlayerSeat('mockUser0000', 2);
      expect(game.players[0]).toStrictEqual({
        playerId: 'mockUser0000',
        name: 'Ryan',
        teamId: 'team0',
        seat: 2,
      });
      expect(game.players[2]).toStrictEqual({
        playerId: 'mockUser2222',
        name: 'Stacey',
        teamId: 'team0',
        seat: 0,
      });

      game.switchPlayerSeat('mockUser2222', 3);
      expect(game.players[2]).toStrictEqual({
        playerId: 'mockUser2222',
        name: 'Stacey',
        teamId: 'team1',
        seat: 3,
      });
      expect(game.players[3]).toStrictEqual({
        playerId: 'mockUser3333',
        name: 'Paul',
        teamId: 'team0',
        seat: 0,
      });
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
    game = new Game(mock.MOCK_USER_0, 'gameId12345', mock.MOCK_GAME_CONFIG);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('add players to game', () => {
    test('addPlayer adds players to game.players', () => {
      game.addPlayer(mock.MOCK_USER_1.id, mock.MOCK_USER_1.name);
      expect(game.players.filter((player) => player.playerId !== null).length).toBe(2);
      expect(game.players[1]).toStrictEqual(mock.MOCK_PLAYERS[1]);
    });

    test('if less than 4 players, cannot start gameplay (createRound)', () => {
      game.addPlayer(mock.MOCK_USER_2.id, mock.MOCK_USER_2.name);
      expect(() => game.startGame()).toThrowError();
    });

    test('cannot add the same player twice', () => {
      expect(() => game.addPlayer(mock.MOCK_USER_1.id, mock.MOCK_USER_1.name)).toThrowError();
    });

    test('cannot add more players than game is configured for', () => {
      game.addPlayer(mock.MOCK_USER_3.id, mock.MOCK_USER_3.name);
      expect(() => game.addPlayer(mock.MOCK_USER_4.id, mock.MOCK_USER_4.name)).toThrowError();
      expect(game.players.filter((player) => player.playerId !== null).length).toBe(4);
      expect(game.players).toStrictEqual(mock.MOCK_PLAYERS);
    });
  });
  describe('gameStateToJson', () => {
    it.todo('test gameStateToJson()');
  });
  describe('create Round', () => {
    test('if 4 players, can call startGame', () => {
      const spy = jest.spyOn(game, 'createRound');
      game.startGame();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('round is an instance of Round', () => {
      expect(game.round).toBeInstanceOf(Round);
    });
  });

  describe('Round play', () => {
    beforeAll(() => {
      game.round!.hands = mock.MOCK_HANDS;
      game.round?.sortHands();
    });

    describe('updateActivePlayer', () => {
      test('updateActivePlayer will initiate activePlayer to Seat 1', () => {
        const spy = jest.spyOn(game.round!, 'updateActivePlayer');
        game.round?.updateActivePlayer();
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

        // game.round?.updateActivePlayer();
        expect(game.round?.activePlayer).toBe(game.round?.dealer);

        const spyWin = jest.spyOn(game.round!, 'setWinningBid');
        const spyActive = jest.spyOn(game.round!, 'updateActivePlayer');
        const spyPlay = jest.spyOn(game.round!, 'setPlayableCards');

        game.round?.setPlayerBid(BidAmount.Eight);
        expect(spyWin).toBeCalledTimes(1);
        expect(spyActive).toBeCalledTimes(1);
        expect(game.round?.winningBid.bidder !== -1).toBe(true);
        expect(spyPlay).toBeCalledTimes(1);
        expect(game.round?.winningBid).toStrictEqual({ amount: 8, bidder: 0, isTrump: true });
        expect(game.round?.activePlayer).toBe(0);
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
      test('sortHands will sort hands H,S,D,C', () => {
        expect(game.round?.hands).toStrictEqual(mock.MOCK_HANDS_SORTED);
      });

      test('activePlayer will be bid winner', () => {
        expect(game.round?.activePlayer).toBe(game.round?.winningBid.bidder);
        expect(game.round?.activePlayer).toBe(0);
      });

      test('playable cards are set from active players hand', () => {
        expect(game.round?.playableCards).toStrictEqual(mock.MOCK_HANDS_SORTED[0]);
      });

      test('playCard will remove card from activePlayer hand', () => {
        const playedCard = game.round!.hands[0][0];
        expect(playedCard).toStrictEqual({ suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 });

        const spyRemove = jest.spyOn(game.round!, 'removeCardFromHand');
        const spyUpdate = jest.spyOn(game.round!, 'updateCardsPlayed');
        const spyEnd = jest.spyOn(game.round!, 'endPlayerTurn');
        expect(game.round?.activePlayer).toBe(0);
        game.round?.playCard(playedCard);

        expect(spyRemove).toBeCalledTimes(1);
        expect(spyUpdate).toBeCalledTimes(1);
        expect(spyEnd).toBeCalledTimes(1);

        mock.MOCK_HANDS_SORTED[0].splice(0, 1);
        expect(game.round?.hands[0]).toStrictEqual(mock.MOCK_HANDS_SORTED[0]);
      });

      test('played card will be added to trick', () => {
        expect(game.round?.trick).toStrictEqual([mock.MOCK_TRICK_0[0]]);
      });

      test('turn will pass to player in seat 1 (to the "left")', () => {
        expect(game.round?.activePlayer).toBe(1);
      });

      test('players must follow suit if possible or an error will be throw', () => {
        const invalidCard = game.round!.hands[1][3];
        expect(invalidCard).toStrictEqual({ suit: Suit.Diamonds, name: CardName.Queen, faceValue: 12, playValue: 12 });
        expect(() => game.round?.playCard(invalidCard)).toThrowError();
      });

      test('after each player plays, trick will be evaluated', () => {
        const spyEndTrick = jest.spyOn(game.round!, 'endTrick');

        expect(game.round?.activePlayer).toBe(1);
        game.round?.playCard(game.round!.hands[1][0]);

        expect(game.round?.activePlayer).toBe(2);
        game.round?.playCard(game.round!.hands[2][0]);

        expect(game.round?.activePlayer).toBe(3);
        game.round?.playCard(game.round!.hands[3][0]);

        expect(spyEndTrick).toBeCalledTimes(1);
      });

      test('after trick, activePlayer is set to trick winner', () => {
        expect(game.round?.tricksTeam0[0].trickWonBy).toBe(0);
        expect(game.round?.activePlayer).toBe(0);
      });

      test('after 8 tricks, evaluateRound and endRound are called', () => {
        const spyEval = jest.spyOn(game.round!, 'evaluateRound');
        const spyEndRound = jest.spyOn(game.round!, 'endRound');
        const spyCreateRound = jest.spyOn(game, 'createRound');
        const spyEndGame = jest.spyOn(game, 'endGame');

        for (let i = 0; i < HAND_SIZE - 1; i++) {
          expect(game.round?.activePlayer).toBe(0);
          for (let j = 0; j < game.config.numPlayers; j++) {
            expect(game.round?.playableCards).toContain(game.round!.hands[j][0]);
            game.round?.playCard(game.round!.hands[j][0]);
          }
        }
        expect(spyEval).toBeCalledTimes(1);
        expect(spyEndRound).toBeCalledTimes(1);
        expect(spyEndRound).toBeCalledWith({
          bid: { amount: 8, bidder: 0, isTrump: true, bidMade: true },
          roundPoints: [
            { teamId: 'team0', points: 9 },
            { teamId: 'team1', points: 1 },
          ],
          playerPoints: [
            { playerSeat: 0, points: 9 },
            { playerSeat: 1, points: 1 },
            { playerSeat: 2, points: 0 },
            { playerSeat: 3, points: 0 },
          ],
        });
        expect(spyCreateRound).toBeCalledTimes(1);
        expect(spyEndGame).not.toBeCalled();
      });
    });
    describe('new Round', () => {
      test('dealer will be moved left to seat 1', () => {
        expect(game.round?.dealer).toBe(1);
      });

      test('expect no bids', () => {
        expect(game.round?.bids.length).toBe(0);
      });
    });
  });

  describe('canBid', () => {
    it('validates whether someone can bid', () => {
      const game = new Game({ id: 'hashbrowns', name: 'hashbrowns' }, 'uuid', {
        minBid: 7,
        scoreToWin: 56,
        numPlayers: 4,
      });
      game.addPlayer('bacon', 'bacon');
      game.addPlayer('eggs', 'eggs');
      game.addPlayer('toast', 'toast');
      game.startGame();
      expect(game.canBid('hashbrowns')).toBeFalsy(); // dealer so not first to bid
      expect(game.canBid('bacon')).toBeTruthy();
      game.round?.setPlayerBid(BidAmount.Eight);
      expect(game.canBid('bacon')).toBeFalsy(); // can't bid again
      expect(game.canBid('eggs')).toBeTruthy();
      game.round?.setPlayerBid(BidAmount.EightNo);
      game.round?.setPlayerBid(BidAmount.Pass);
      game.round?.setPlayerBid(BidAmount.Pass);

      expect(game.canBid('hashbrowns')).toBeFalsy();
      expect(game.canBid('bacon')).toBeFalsy();
      expect(game.canBid('eggs')).toBeFalsy();
      expect(game.canBid('toast')).toBeFalsy();
    });
  });

  describe('canSetTrump', () => {
    it('validates whether someone can set trump', () => {
      const game = new Game({ id: 'hashbrowns', name: 'hashbrowns' }, 'uuid', {
        minBid: 7,
        scoreToWin: 56,
        numPlayers: 4,
      });
      game.addPlayer('bacon', 'bacon');
      game.addPlayer('eggs', 'eggs');
      game.addPlayer('toast', 'toast');

      expect(game.canSetTrump('hashbrowns')).toBeFalsy();

      game.startGame();
      game.round?.setPlayerBid(BidAmount.Eight);

      expect(game.canSetTrump('eggs')).toBeFalsy(); // bidding still open, falsy

      game.round?.setPlayerBid(BidAmount.EightNo); // this would be ... eggs... I think we should track bid with player id
      game.round?.setPlayerBid(BidAmount.Pass);
      game.round?.setPlayerBid(BidAmount.Pass);

      expect(game.canSetTrump('hashbrowns')).toBeFalsy();
      expect(game.canSetTrump('eggs')).toBeTruthy();
    });
  });
});

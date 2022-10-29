import { BidAmount, CardName, Suit } from '../@types';
import { HAND_SIZE } from '../constants/index';
import { Round } from '../Round/Round';
import * as mock from './__mocks__/Game';
import { Game } from './Game';

// GAME START AND ROUND PLAYTHROUGH
describe('managing game state with toJSON and fromJSON', () => {
  let game: Game;
  beforeEach(() => {
    game = new Game(mock.MOCK_USER_0, 'gameId12345', mock.MOCK_GAME_CONFIG);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('toJSON creates a JSON object of game', () => {
    expect(game.toJSON()).toStrictEqual(mock.MOCK_INIT_GAME_JSON);
  });

  test('fromJSON instantiates Game from JSON state', () => {
    const fromJSONGame = Game.fromJSON(mock.MOCK_INIT_GAME_JSON);
    expect(fromJSONGame).toStrictEqual(game);
  });
  test('fromJSON instantiates Game and Round from JSON state', () => {
    game.addPlayer(mock.MOCK_USER_1.id, mock.MOCK_USER_1.name);
    game.addPlayer(mock.MOCK_USER_2.id, mock.MOCK_USER_2.name);
    game.addPlayer(mock.MOCK_USER_3.id, mock.MOCK_USER_3.name);
    game.startGame();
    game.round!.hands = mock.MOCK_HANDS_SORTED;
    expect(game.round?.activePlayerIndex).toBe(1);
    game.round?.setPlayerBid('mockUser1', BidAmount.Seven, true);
    game.round?.setPlayerBid('mockUser2', BidAmount.Seven, false);
    game.round?.setPlayerBid('mockUser3', BidAmount.Eight, true);
    game.round?.setPlayerBid('mockUser0', BidAmount.Eight, true);
    game.round?.setTrump('mockUser0', Suit.Hearts);
    expect(game.round?.activePlayerIndex).toBe(0);
    game.round?.playCard('mockUser0', { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 });
    game.round?.playCard('mockUser0', { suit: Suit.Hearts, name: CardName.Queen, faceValue: 12, playValue: 12 });
    game.round?.playCard('mockUser0', { suit: Suit.Hearts, name: CardName.Five, faceValue: 5, playValue: 5 });
    game.round?.playCard('mockUser0', { suit: Suit.Hearts, name: CardName.Nine, faceValue: 9, playValue: 9 });
    expect(game.toJSON()).toStrictEqual(mock.MOCK_TRICK_1_JSON);
    // const fromJSONGame = Game.fromJSON(mock.MOCK_TRICK_1_JSON);
    // expect(fromJSONGame).toStrictEqual(game);
  });
});

describe('4 player Game playthrough', () => {
  let game: Game;
  beforeAll(() => {
    // config { numPlayers: 4, minBid: 7, scoreToWin: 52 }
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
      game.startGame();
      expect(game.round).toBeNull();
    });

    test('cannot add the same player twice', () => {
      expect(() => game.addPlayer(mock.MOCK_USER_1.id, mock.MOCK_USER_1.name)).toThrow();
      expect(game.players.filter((player) => player.playerId !== null).length).toBe(3);
    });

    test('cannot add more players than game is configured for', () => {
      game.addPlayer(mock.MOCK_USER_3.id, mock.MOCK_USER_3.name);
      expect(() => game.addPlayer(mock.MOCK_USER_4.id, mock.MOCK_USER_4.name)).toThrow();
      expect(game.players.length).toBe(4);
      expect(game.players.filter((player) => player.playerId !== null).length).toBe(4);
      expect(game.players).toStrictEqual(mock.MOCK_PLAYERS);
    });

    test('switchPlayerIndex exchanges playerIndex / teamId for 2 players then re-sorts players', () => {
      game.switchPlayerIndex('mockUser0', 3);
      expect(game.players).toStrictEqual(mock.MOCK_SWITCH_PLAYERS);
      game.switchPlayerIndex('mockUser3', 3);
      expect(game.players).toStrictEqual(mock.MOCK_PLAYERS);
      expect(() => game.switchPlayerIndex('mockUser0', 4)).toThrow();
    });
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
      test('updateActivePlayer will initiate activePlayer to PlayerIndex 1', () => {
        expect(game.round?.dealerIndex).toBe(0);
        expect(game.round?.activePlayerIndex).toBe(1);
      });
    });

    describe('bidding', () => {
      test('cannot call playCard before each player has bid', () => {
        game.round?.playCard('mockUser0', { suit: Suit.Diamonds, name: CardName.Ace, faceValue: 1, playValue: 14 });
        expect(game.round?.trick.length).toBe(0);
      });

      test('validBids will return all valid bids to player', () => {
        expect(game.round?.getValidBids()).toStrictEqual(mock.MOCK_VALID_BIDS);
      });

      test('if setPlayerBid is passed an invalid bid it is not recorded', () => {
        const spyUpdateActive = jest.spyOn(game.round!, 'updateActivePlayer');
        expect(() => game.round?.setPlayerBid('mockUser1', BidAmount.Five, true)).toThrow();
        expect(spyUpdateActive).not.toBeCalled();
        expect(game.round?.bids.length).toBe(0);
      });

      test('if setPlayerBid is passed a valid bid it is added to end of bids array', () => {
        expect(game.round?.activePlayerIndex).toBe(1);
        game.round?.setPlayerBid('mockUser1', BidAmount.Seven, true);
        expect(game.round?.bids.length).toBe(1);
      });

      test('updateActivePlayer will move turn one position "left" on valid setPlayerBid', () => {
        const spyUpdateActive = jest.spyOn(game.round!, 'updateActivePlayer');
        expect(game.round?.activePlayerIndex).toBe(2);
        game.round?.setPlayerBid('mockUser2', BidAmount.Seven, false);
        expect(game.round?.bids.length).toBe(2);
        expect(spyUpdateActive).toBeCalledTimes(1);
        expect(game.round?.activePlayerIndex).toBe(3);
      });

      test('dealer can take bid for current high bid; setWinningBid is called after 4 bids', () => {
        expect(game.round?.activePlayerIndex).toBe(3);
        game.round?.setPlayerBid('mockUser3', BidAmount.Eight, true);
        expect(game.round?.activePlayerIndex).toBe(game.round?.dealerIndex);

        const spyWin = jest.spyOn(game.round!, 'setWinningBid');
        const spyActive = jest.spyOn(game.round!, 'updateActivePlayer');
        const spyPlay = jest.spyOn(game.round!, 'setPlayableCards');

        game.round?.setPlayerBid('mockUser0', BidAmount.Eight, true);
        expect(spyWin).toBeCalledTimes(1);
        expect(spyActive).toBeCalledTimes(1);
        expect(game.round?.winningBid.bidder.playerIndex !== -1).toBe(true);
        expect(spyPlay).toBeCalledTimes(1);
        expect(game.round?.winningBid).toStrictEqual(mock.MOCK_WINNING_BID);
        expect(game.round?.activePlayerIndex).toBe(0);
      });

      test('setPlayerBid will not record bid if 4 bids have already been made', () => {
        expect(() => game.round?.setPlayerBid('mockUser5', BidAmount.Eight, true)).toThrow();
        expect(() => game.round?.setPlayerBid('mockUser0', BidAmount.Ten, false)).toThrow();

        expect(game.round?.bids.length).toBe(4);
        expect(game.round?.activePlayerIndex).toBe(0);
      });

      test('setTrump can only be called by bid winner', () => {
        game.round?.setTrump('mockUser2', Suit.Spades);
        expect(game.round?.trump).toBeNull();
      });

      test('setTrump asigns passed suit to round trump', () => {
        game.round?.setTrump('mockUser0', Suit.Hearts);
        expect(game.round?.trump).toBe(Suit.Hearts);
      });
    });

    describe('card play', () => {
      test('activePlayer will be bid winner', () => {
        expect(game.round?.activePlayerIndex).toBe(game.round?.winningBid.bidder.playerIndex);
        expect(game.round?.activePlayerIndex).toBe(0);
      });

      test('sortHands will sort hands H,S,D,C', () => {
        expect(game.round?.hands).toStrictEqual(mock.MOCK_HANDS_SORTED);
      });

      test('playable cards are set from active players hand', () => {
        expect(game.round?.playableCards).toStrictEqual(mock.MOCK_HANDS_SORTED[0].hand);
      });

      test('playCard will remove card from activePlayer hand', () => {
        const playedCard = game.round!.hands[0].hand[0];
        expect(playedCard).toStrictEqual({ suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 });

        const spyRemove = jest.spyOn(game.round!, 'removeCardFromHand');
        const spyUpdate = jest.spyOn(game.round!, 'updateCardsPlayed');
        const spyEnd = jest.spyOn(game.round!, 'endPlayerTurn');
        expect(game.round?.activePlayerIndex).toBe(0);
        game.round?.playCard('mockUser0', playedCard);

        expect(spyRemove).toBeCalledTimes(1);
        expect(spyUpdate).toBeCalledTimes(1);
        expect(spyEnd).toBeCalledTimes(1);

        mock.MOCK_HANDS_SORTED[0].hand.splice(0, 1);
        expect(game.round?.hands[0]).toStrictEqual(mock.MOCK_HANDS_SORTED[0]);
      });

      test('played card will be added to trick', () => {
        expect(game.round?.trick).toStrictEqual([mock.MOCK_TRICK_0[0]]);
      });

      test('turn will pass to player in playerIndex 1 (to the "left")', () => {
        expect(game.round?.activePlayerIndex).toBe(1);
      });

      test('players must follow suit if possible or card is not added to trick', () => {
        const invalidCard = game.round!.hands[1].hand[3];
        expect(invalidCard).toStrictEqual({ suit: Suit.Diamonds, name: CardName.Queen, faceValue: 12, playValue: 12 });
        game.round?.playCard('mockUser1', invalidCard);
        expect(game.round?.trick.length).toBe(1); // invalid card is not recorded
      });

      test('after each player plays, trick will be evaluated', () => {
        const spyEndTrick = jest.spyOn(game.round!, 'endTrick');

        expect(game.round?.activePlayerIndex).toBe(1);
        game.round?.playCard('mockUser1', game.round!.hands[1].hand[0]);

        expect(game.round?.activePlayerIndex).toBe(2);
        game.round?.playCard('mockUser2', game.round!.hands[2].hand[0]);

        expect(game.round?.activePlayerIndex).toBe(3);
        game.round?.playCard('mockUser3', game.round!.hands[3].hand[0]);

        expect(spyEndTrick).toBeCalledTimes(1);
      });

      test('after trick, activePlayer is set to trick winner', () => {
        expect(game.round?.teamTotals[0].tricks[0].takenBy).toStrictEqual(mock.MOCK_PLAYERS[0]);
        expect(game.round?.activePlayerIndex).toBe(0);
      });

      test('after 8 tricks, evaluateRound and endRound are called', () => {
        const spyEval = jest.spyOn(game.round!, 'evaluateRound');
        const spyEndRound = jest.spyOn(game.round!, 'endRound');
        const spyCreateRound = jest.spyOn(game, 'createRound');
        const spyEndGame = jest.spyOn(game, 'endGame');

        for (let i = 0; i < HAND_SIZE - 1; i++) {
          expect(game.round?.activePlayerIndex).toBe(0);
          for (let j = 0; j < game.config.numPlayers; j++) {
            expect(game.round?.playableCards).toContain(game.round!.hands[j].hand[0]);
            game.round?.playCard(`mockUser${j}`, game.round!.hands[j].hand[0]);
          }
        }
        expect(spyEval).toBeCalledTimes(1);
        expect(spyEndRound).toBeCalledTimes(1);
        expect(spyEndRound).toBeCalledWith(mock.MOCK_ROUND_SUMMARY);
        expect(spyCreateRound).toBeCalledTimes(1);
        expect(spyEndGame).not.toBeCalled();
      });
    });

    describe('endRound', () => {
      test('endRound adds round totals to roundSummaries', () => {
        expect(game.roundSummaries.length).toBe(1);
        expect(game.roundSummaries[0]).toStrictEqual(mock.MOCK_ROUND_SUMMARY);
      });

      test('endRound updates game score', () => {
        expect(game.teams).toStrictEqual(mock.MOCK_TEAM_SCORES);
      });
    });

    describe('new Round', () => {
      test('a new round is instantiated', () => {
        expect(game.round?.trickIndex).toBe(1);
        expect(game.round?.teamTotals[0].tricks.length).toBe(0);
        expect(game.round?.teamTotals[1].tricks.length).toBe(0);
      });

      test('dealer will be moved left to playerIndex 1', () => {
        expect(game.round?.dealerIndex).toBe(1);
      });

      test('expect no bids', () => {
        expect(game.round?.bids.length).toBe(0);
      });
    });
  });
});

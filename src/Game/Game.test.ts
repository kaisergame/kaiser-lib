import { CardName, Suit } from '../@types';
import { HAND_SIZE } from '../constants/index';
import { Round } from '../Round/Round';
import * as mock from './__mocks__/Game';
import { Game } from './Game';

// GAME START AND ROUND PLAYTHROUGH
describe('4 Player Game playthrough', () => {
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
      game.addPlayer(mock.MOCK_USER_1.id, mock.MOCK_USER_1.name);
      expect(game.players.filter((player) => player.playerId !== null).length).toBe(3);
    });

    test('cannot add more players than game is configured for', () => {
      game.addPlayer(mock.MOCK_USER_3.id, mock.MOCK_USER_3.name);
      game.addPlayer(mock.MOCK_USER_4.id, mock.MOCK_USER_4.name);
      expect(game.players.length).toBe(4);
      expect(game.players.filter((player) => player.playerId !== null).length).toBe(4);
      expect(game.players).toStrictEqual(mock.MOCK_PLAYERS);
    });
  });

  describe('gameStateToJson', () => {
    test.todo('test gameStateToJson()');
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
        expect(game.round?.getValidBidValues()).toStrictEqual(mock.MOCK_VALID_BIDS);
      });

      test('if setPlayerBid is passed an invalid bid it is not recorded', () => {
        const spyUpdateActive = jest.spyOn(game.round!, 'updateActivePlayer');
        game.round?.setPlayerBid('mockUser1', BidValue.Five); // bid too low for config
        expect(spyUpdateActive).not.toBeCalled();
        expect(game.round?.bids.length).toBe(0);
      });

      test('if setPlayerBid is passed a valid bid it is added to end of bids array', () => {
        expect(game.round?.activePlayerIndex).toBe(1);
        game.round?.setPlayerBid('mockUser1', BidValue.Seven);
        expect(game.round?.bids.length).toBe(1);
      });

      test('updateActivePlayer will move turn one position "left" on valid setPlayerBid', () => {
        const spyUpdateActive = jest.spyOn(game.round!, 'updateActivePlayer');
        expect(game.round?.activePlayerIndex).toBe(2);
        game.round?.setPlayerBid('mockUser2', BidValue.SevenNo);
        expect(game.round?.bids.length).toBe(2);
        expect(spyUpdateActive).toBeCalledTimes(1);
        expect(game.round?.activePlayerIndex).toBe(3);
      });

      test('dealer can take bid for current high bid; setWinningBid is called after 4 bids', () => {
        expect(game.round?.activePlayerIndex).toBe(3);

        game.round?.setPlayerBid('mockUser3', BidValue.Eight);

        expect(game.round?.activePlayerIndex).toBe(game.round?.dealerIndex);

        const spyWin = jest.spyOn(game.round!, 'setWinningBid');
        const spyActive = jest.spyOn(game.round!, 'updateActivePlayer');
        const spyPlay = jest.spyOn(game.round!, 'setPlayableCards');

        game.round?.setPlayerBid('mockUser0', BidValue.Eight);
        expect(spyWin).toBeCalledTimes(1);
        expect(spyActive).toBeCalledTimes(1);
        expect(game.round?.winningBid.bidder.playerIndex !== -1).toBe(true);
        expect(spyPlay).toBeCalledTimes(1);
        expect(game.round?.winningBid).toStrictEqual(mock.MOCK_WINNING_BID);
        expect(game.round?.activePlayerIndex).toBe(0);
      });

      test('setPlayerBid will not record bid if 4 bids have already been made', () => {
        game.round?.setPlayerBid('mockUser5', BidValue.Eight);
        game.round?.setPlayerBid('mockUser0', BidValue.TenNo);
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
        expect(game.scores).toStrictEqual(mock.MOCK_GAME_SCORE);
      });
    });

    describe('new Round', () => {
      test('dealer will be moved left to playerIndex 1', () => {
        expect(game.round?.dealerIndex).toBe(1);
      });

      test('expect no bids', () => {
        expect(game.round?.bids.length).toBe(0);
      });
    });
  });
});

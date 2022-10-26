import { BidAmount, BidValue, CardName, Suit } from '../@types';
import { HAND_SIZE } from '../constants/index';
import { Round } from '../Round/Round';
import * as mock from './__mocks__/Game';
import { Game } from './Game';

// describe('Game with 4 players', () => {
//   let game: Game;
//   beforeAll(() => {
//     game = new Game(mock.MOCK_USER_0, 'gameId12345', mock.MOCK_GAME_CONFIG);
//   });
//   beforeEach(() => {
//     jest.unmock('./constants');
//     jest.resetModules();
//   });

//   describe('addPlayer method', () => {
//     test('addPlayer should increase non-null Game players.playerId by 1', () => {
//       const initialPlayerNum = 0;

//       expect(game.players.filter((player) => player.playerId !== null).length).toBe(initialPlayerNum + 1);
//     });

//     test('addPlayer should give expected values for userId, playerIndex, and team', () => {
//       game.addPlayer(mock.MOCK_USER_1.id, mock.MOCK_USER_1.name);
//       game.addPlayer(mock.MOCK_USER_2.id, mock.MOCK_USER_2.name);

//       expect(game.players[1].playerId).toBe(mock.MOCK_USER_1.id);
//       expect(game.players[1].teamId).toBe('team1');
//       expect(game.players[2].playerIndex).toBe(2);
//       expect(game.players[2].teamId).toBe('team0');
//     });
//   });

//   describe('setDealer method', () => {
//     test('dealer starts null; setDealer should iterate through 0,1,2,3', () => {
//       expect(game.dealer).toBeNull();

//       game.setDealer();
//       expect(game.dealer).toBe(0);
//       game.setDealer();
//       expect(game.dealer).toBe(1);

//       for (let i = 0; i < 7; i++) {
//         game.setDealer();
//       }
//       expect(game.dealer).toBe(0);
//     });
//   });

//   describe('switchPlayerPlayerIndex method', () => {
//     beforeEach(() => {
//       game.teams = game.initializeTeams();
//       game.players = game.initializePlayers();

//       game.addPlayer(mock.MOCK_USER_0.id, mock.MOCK_USER_0.name);
//       game.addPlayer(mock.MOCK_USER_1.id, mock.MOCK_USER_1.name);
//       game.addPlayer(mock.MOCK_USER_2.id, mock.MOCK_USER_2.name);
//       game.addPlayer(mock.MOCK_USER_3.id, mock.MOCK_USER_3.name);
//     });
//     test('a player passed to switchPlayerPlayerIndex will be moved 1 playerIndex left', () => {
//       console.log(game.teams);

//       game.switchPlayerPlayerIndex('mockUser0');
//       console.log(game.teams);

//       expect(game.players[0]).toStrictEqual({
//         playerId: 'mockUser0',
//         name: 'Ryan',
//         teamId: 'team1',
//         playerIndex: 1,
//       });
//       expect(game.players[1]).toStrictEqual({
//         playerId: 'mockUser1',
//         name: 'Cody',
//         teamId: 'team0',
//         playerIndex: 0,
//       });

//       expect(game.teams[0].teamMembers).toStrictEqual(['mockUser2', 'mockUser1']);
//       expect(game.teams[1].teamMembers).toStrictEqual(['mockUser3', 'mockUser0']);
//     });

//     test('if called with playerIndex, player switches to that playerIndex, player in that playerIndex goes to player position', () => {
//       game.switchPlayerPlayerIndex('mockUser0', 2);
//       expect(game.players[0]).toStrictEqual({
//         playerId: 'mockUser0',
//         name: 'Ryan',
//         teamId: 'team0',
//         playerIndex: 2,
//       });
//       expect(game.players[2]).toStrictEqual({
//         playerId: 'mockUser2',
//         name: 'Stacey',
//         teamId: 'team0',
//         playerIndex: 0,
//       });

//       game.switchPlayerPlayerIndex('mockUser2', 3);
//       expect(game.players[2]).toStrictEqual({
//         playerId: 'mockUser2',
//         name: 'Stacey',
//         teamId: 'team1',
//         playerIndex: 3,
//       });
//       expect(game.players[3]).toStrictEqual({
//         playerId: 'mockUser3',
//         name: 'Paul',
//         teamId: 'team0',
//         playerIndex: 0,
//       });
//     });
//   });

//   describe('createRound method', () => {
//     beforeAll(() => {
//       game.players = mock.MOCK_PLAYERS;
//       game.createRound();
//     });

//     test('round should be instance of Round', () => {
//       expect(game.round).toBeInstanceOf(Round);
//     });

//     test('4 player round should have 4 players', () => {
//       expect(game.round?.playersRoundData.length).toBe(4);
//     });
//   });

//   describe('updateScore method', () => {
//     beforeEach(() => {
//       game.scores[0] = { teamId: 'team0', teamScore: 23 };
//       game.scores[1] = { teamId: 'team1', teamScore: -10 };
//     });

//     test('score of -9 and 4 should be added to respective teams', () => {
//       game.updateScores(mock.MOCK_ROUND_TOTALS.roundPoints);
//       expect(game.scores).toStrictEqual([
//         { teamId: 'team0', teamScore: 14 },
//         { teamId: 'team1', teamScore: -6 },
//       ]);
//     });
//     test('score of -1 and 22 should be added to respective teams', () => {
//       game.updateScores(mock.MOCK_ROUND_TOTALS_2.roundPoints);
//       expect(game.scores).toStrictEqual([
//         { teamId: 'team0', teamScore: 22 },
//         { teamId: 'team1', teamScore: 12 },
//       ]);
//     });
//   });

//   describe('checkIsWinner method', () => {
//     test('team 1 should be winner', () => {
//       game.scores[0] = { teamId: 'team0', teamScore: 30 };
//       game.scores[1] = { teamId: 'team1', teamScore: 54 };
//       const isWinner = game.checkIsWinner();
//       expect(isWinner).toBe('team1');
//     });
//     test('there should be no winner (return -1)', () => {
//       game.scores[0] = { teamId: 'team0', teamScore: -53 };
//       game.scores[1] = { teamId: 'team1', teamScore: 51 };
//       const isWinner = game.checkIsWinner();
//       expect(isWinner).toBe(null);
//     });
//     test('if both teams are over scoreToWin the higher score should win', () => {
//       game.scores[0] = { teamId: 'team0', teamScore: 58 };
//       game.scores[1] = { teamId: 'team1', teamScore: 53 };
//       const isWinner = game.checkIsWinner();
//       expect(isWinner).toBe('team0');
//     });
//   });

//   describe('endRound method', () => {
//     afterEach(() => {
//       jest.restoreAllMocks();
//     });

//     test('if a team score is over scoreToWin endGame is called', () => {
//       game.scores[0] = { teamId: 'team0', teamScore: 42 };
//       game.scores[1] = { teamId: 'team1', teamScore: 50 };
//       const spy = jest.spyOn(game, 'endGame');
//       game.endRound(mock.MOCK_ROUND_TOTALS);
//       expect(spy).toBeCalledTimes(1);
//     });

//     test('if a team score is not over scoreToWin createRound is called', () => {
//       game.scores[0] = { teamId: 'team0', teamScore: 12 };
//       game.scores[1] = { teamId: 'team1', teamScore: 18 };
//       const spy = jest.spyOn(game, 'createRound');
//       game.endRound(mock.MOCK_ROUND_TOTALS);
//       expect(spy).toBeCalledTimes(1);
//     });
//   });
// });

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
        const spy = jest.spyOn(game.round!, 'updateActivePlayer');
        // expect(spy).toBeCalledTimes(1);
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

      test('updateActivePlayer will move turn one position "left"', () => {
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
        expect(game.round?.winningBid).toStrictEqual({ amount: 8, bidder: 0, isTrump: true });
        expect(game.round?.activePlayerIndex).toBe(0);
      });

      test('setPlayerBid will not record bid if 4 bids have already been made', () => {
        game.round?.setPlayerBid('mockUser0', BidValue.Eight);
        expect(game.round?.bids.length).toBe(0);
      });

      test('setTrump asigns passed suit to round trump', () => {
        game.round?.setTrump('mockUser0', Suit.Hearts);
        expect(game.round?.trump).toBe(Suit.Hearts);
      });
    });

    describe('card play', () => {
      test('sortHands will sort hands H,S,D,C', () => {
        expect(game.round?.hands).toStrictEqual(mock.MOCK_HANDS_SORTED);
      });

      test('activePlayer will be bid winner', () => {
        expect(game.round?.activePlayerIndex).toBe(game.round?.winningBid.bidder);
        expect(game.round?.activePlayerIndex).toBe(0);
      });

      test('playable cards are set from active players hand', () => {
        expect(game.round?.playableCards).toStrictEqual(mock.MOCK_HANDS_SORTED[0]);
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
        expect(game.round?.tricksTeam0[0].trickWonBy).toBe(0);
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
        expect(spyEndRound).toBeCalledWith({
          bid: { amount: 8, bidder: 0, isTrump: true, bidMade: true },
          roundPoints: [
            { teamId: 'team0', points: 9 },
            { teamId: 'team1', points: 1 },
          ],
          playerPoints: [
            { playerPlayerIndex: 0, points: 9 },
            { playerPlayerIndex: 1, points: 1 },
            { playerPlayerIndex: 2, points: 0 },
            { playerPlayerIndex: 3, points: 0 },
          ],
        });
        expect(spyCreateRound).toBeCalledTimes(1);
        expect(spyEndGame).not.toBeCalled();
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

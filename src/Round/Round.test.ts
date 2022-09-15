import { Bid, CardName, RoundData, Suit } from '../@types/index';
import { HAND_SIZE } from '../constants/index';
import * as mock from '../constants/mocks';
import { Game } from '../Game/Game';
import { Round } from './Round';

describe('Round', () => {
  let round: InstanceType<typeof Round>;
  beforeEach(() => {
    const game = new Game(mock.MOCK_USER_1, mock.MOCK_GAME_CONFIG);
    round = new Round(4, 5, mock.MOCK_PLAYERS, 0, mock.MOCK_SHUFFLED_DECK, game.endRound);
  });

  describe('create a new Round', () => {
    test('4 player round should have 4 players', () => {
      expect(round.playerNum).toBe(4);
      expect(round.playerNum).toBe(round.playersRoundData.length);
    });

    test('playersRoundData should be of type RoundData', () => {
      const { score: _, ...mockPlayer0 } = mock.MOCK_PLAYERS[0];
      const { score: __, ...mockPlayer2 } = mock.MOCK_PLAYERS[2];
      expect(round.playersRoundData[0]).toMatchObject<RoundData>({
        ...mockPlayer0,
        bid: null,
        winningBid: null,
        isDealer: true,
        tricksTaken: 0,
      });
      expect(round.playersRoundData[2]).toMatchObject<RoundData>({
        ...mockPlayer2,
        bid: null,
        winningBid: null,
        isDealer: false,
        tricksTaken: 0,
      });
    });
  });

  describe('dealHands method', () => {
    beforeEach(() => {
      round.dealHands();
    });
    test('dealHands should deal cards to each player', () => {
      expect(round.hands.length).toBe(round.playerNum);
    });

    test('each hand should have length === HAND_SIZE', () => {
      expect(round.hands[0].length).toBe(HAND_SIZE);
      expect(round.hands[3].length).toBe(HAND_SIZE);
    });
  });

  describe('sortHands method', () => {
    beforeEach(() => {
      round.dealHands();
    });
    test('sortHands should sort the dealt cards in each hand (C,D,H,S) high to low', () => {
      round.sortHands();
      expect(round.hands[0]).toMatchObject(mock.MOCK_SORTED_HAND);
    });

    test('sortHands should sort low to high when lowToHigh is passed in', () => {
      round.sortHands('lowToHigh');
      expect(round.hands[0]).toMatchObject(mock.MOCK_REVERSE_SORTED_HAND);
    });
  });

  describe('validBids method', () => {
    test('players must bid higher than the minimum bid', () => {
      round.updateActivePlayer(1);
      expect(round.validBids().filter((bid) => bid <= round.minBid && bid !== Bid.Pass).length).toBe(0);
    });

    test('players (other than dealer) must bid higher than the previous bids', () => {
      round.updateActivePlayer(1);
      round.bids = mock.MOCK_BIDS; // high bid is 10
      expect(round.validBids()).toStrictEqual([0, 10.5, 11, 11.5, 12, 12.5, 12.7, 12.9]);
    });

    test('the dealer may take the bid for the current bid amount', () => {
      round.updateActivePlayer(0);
      expect(round.playersRoundData[round.activePlayer].isDealer).toBe(true);
      round.bids = mock.MOCK_BIDS; // high bid is 10
      expect(round.validBids().includes(Bid.Ten)).toBe(true);
    });

    test('if any player before the dealer has bid, the dealer may pass', () => {
      round.updateActivePlayer(0);
      round.bids = mock.MOCK_BIDS;
      expect(round.playersRoundData[round.activePlayer].isDealer).toBe(true);
      expect(round.validBids().includes(Bid.Pass)).toBe(true);
    });

    test('if all players before the dealer have passed, the dealer cannot pass', () => {
      round.updateActivePlayer(0);
      round.bids = mock.MOCK_PASS_BIDS;
      expect(round.playersRoundData[round.activePlayer].isDealer).toBe(true);
      expect(round.validBids().includes(Bid.Pass)).toBe(false);
    });
  });

  describe('setPlayerBid method', () => {
    test('setPlayerBid adds the passed argument (bid) to bids', () => {
      round.updateActivePlayer(1);
      round.setPlayerBid(Bid.Ten);
      expect(round.bids).toStrictEqual([
        {
          amount: 10,
          bidder: 1,
          isTrump: true,
        },
      ]);
    });

    test('for a trump bid isTrump is true; a no trump bid isTrump is false', () => {
      round.updateActivePlayer(1);
      round.setPlayerBid(Bid.Five);
      round.updateActivePlayer(2);
      round.setPlayerBid(Bid.SevenNo);
      expect(round.bids).toStrictEqual([
        {
          amount: 5,
          bidder: 1,
          isTrump: true,
        },
        {
          amount: 7.5,
          bidder: 2,
          isTrump: false,
        },
      ]);
    });

    test('when each player has bid, setWinningBid is called', () => {
      round.bids = mock.MOCK_BIDS;
      const spy = jest.spyOn(round, 'setWinningBid');

      round.updateActivePlayer(0);
      round.setPlayerBid(Bid.Ten);
      expect(round.bids.length === round.playerNum).toBe(true);
      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('setWinningBid method', () => {
    test('setWinningBid should reduce bids to the highest bid amount', () => {
      round.bids = mock.MOCK_BIDS;
      expect(round.setWinningBid()).toStrictEqual({ amount: 10, bidder: 3, isTrump: true });
    });

    test('setWinningBid updates playerRoundData winningBid for bid winner', () => {
      round.bids = mock.MOCK_BIDS;
      round.setWinningBid();
      expect(round.playersRoundData[3].winningBid).toStrictEqual({ amount: 10, bidder: 3, isTrump: true });
    });
  });

  describe('setTrump method', () => {
    test('setTrump will return if bid.isTrump is false', () => {
      round.setTrump(Suit.Hearts);
      expect(round.trump).toBe(null);
    });

    test('setTrump updates round trump property to passed suit', () => {
      expect(round.trump).toBe(null);
      round.bids = mock.MOCK_BIDS;
      round.setWinningBid();
      round.setTrump(Suit.Hearts);
      expect(round.trump).toBe('HEARTS');
    });
  });
});

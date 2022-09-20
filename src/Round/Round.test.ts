import { BidAmount, CardName, CardType, RoundData, Suit } from '../@types/index';
import { HAND_SIZE } from '../constants/index';
import * as mock from '../constants/mocks';
import { Game } from '../Game/Game';
import { Round } from './Round';

describe('Round', () => {
  let game: InstanceType<typeof Game>;
  let round: InstanceType<typeof Round>;
  const dealer = 0;
  const { numPlayers, minBid } = mock.MOCK_GAME_CONFIG;
  beforeEach(() => {
    game = new Game(mock.MOCK_USER_1, mock.MOCK_GAME_CONFIG);
    round = new Round(numPlayers, minBid, mock.MOCK_PLAYERS, dealer, mock.MOCK_SHUFFLED_DECK, game.endRound);
  });

  describe('create a new Round', () => {
    test('4 player round should have 4 players', () => {
      expect(round.numPlayers).toBe(4);
      expect(round.numPlayers).toBe(round.playersRoundData.length);
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
      expect(round.hands.length).toBe(round.numPlayers);
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
      expect(round.validBids().filter((bid) => bid <= round.minBid && bid !== BidAmount.Pass).length).toBe(0);
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
      expect(round.validBids().includes(BidAmount.Ten)).toBe(true);
    });

    test('if any player before the dealer has bid, the dealer may pass', () => {
      round.updateActivePlayer(0);
      round.bids = mock.MOCK_BIDS;
      expect(round.playersRoundData[round.activePlayer].isDealer).toBe(true);
      expect(round.validBids().includes(BidAmount.Pass)).toBe(true);
    });

    test('if all players before the dealer have passed, the dealer cannot pass', () => {
      round.updateActivePlayer(0);
      round.bids = mock.MOCK_PASS_BIDS;
      expect(round.playersRoundData[round.activePlayer].isDealer).toBe(true);
      expect(round.validBids().includes(BidAmount.Pass)).toBe(false);
    });
  });

  describe('setPlayerBid method', () => {
    test('setPlayerBid adds the passed argument (bid) to bids', () => {
      round.updateActivePlayer(1);
      round.setPlayerBid(BidAmount.Ten);
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
      round.setPlayerBid(BidAmount.Five);
      round.updateActivePlayer(2);
      round.setPlayerBid(BidAmount.SevenNo);
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
      round.setPlayerBid(BidAmount.Ten);
      expect(round.bids.length === round.numPlayers).toBe(true);
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

  describe('orderOfPlay method', () => {
    test('if no bids, expect activePlayer to be set to "left" of dealer (seat 1)', () => {
      expect(round.dealer).toBe(0);
      expect(round.bids.length).toBe(0);
      expect(round.orderOfPlay()).toBe(1);
      expect(round.activePlayer).toBe(1);
    });

    test('if no bids and dealer is seat 3, activePlayer set to "left" of dealer (0)', () => {
      round.dealer = 3;
      round.orderOfPlay();
      expect(round.activePlayer).toBe(0);
    });

    test('after bidding, activePlayer is set to highest bidder', () => {
      round.bid = mock.MOCK_BIDS[1];
      round.orderOfPlay();
      expect(round.activePlayer).toBe(2);

      round.bid = mock.MOCK_BIDS[2];
      round.orderOfPlay();
      expect(round.activePlayer).toBe(3);
    });

    test('after a trick is taken, activePlayer is set to player that took trick', () => {
      round.tricksTaken = mock.TAKEN_TRICKS;
      round.orderOfPlay();
      expect(round.activePlayer).toBe(0);
    });
  });

  describe('updateActivePlayer method', () => {
    test('if activePlayer is -1, updateActivePlayer should throw error if no arg is passed', () => {
      expect(() => {
        round.updateActivePlayer();
      }).toThrowError();
    });

    test('updateActivePlayer should throw error if no arg is number > numPlayers - 1', () => {
      expect(() => {
        round.updateActivePlayer(round.numPlayers + 1);
      }).toThrowError();
    });

    test('expect updateActivePlayer to set activePlayer to passed value', () => {
      round.updateActivePlayer(1);
      expect(round.activePlayer).toBe(1);

      round.updateActivePlayer(3);
      expect(round.activePlayer).toBe(3);
    });

    test('updateActivePlayer should increment activePlayer to highest player seat, then back to 0', () => {
      expect(round.activePlayer).toBe(-1);
      round.orderOfPlay();
      expect(round.activePlayer).toBe(1);

      const active = [2, 3, 0, 1];
      for (let i = 0; i < 3; i++) {
        round.updateActivePlayer();
        expect(round.activePlayer).toBe(active[i]);
      }
    });
  });

  describe('setPlayableCards method', () => {
    test('if the trick has no cards played, all cards in hand are playable', () => {
      round.setPlayableCards(mock.MOCK_SORTED_HAND);
      expect(round.playableCards).toStrictEqual(mock.MOCK_SORTED_HAND);
    });

    test('if player has led suit, playable cards are of that suit', () => {
      round.curTrick = [
        { cardPlayed: { suit: Suit.Hearts, name: CardName.Five, faceValue: 5, playValue: 5 }, playedBy: 1 },
      ];
      round.setPlayableCards(mock.MOCK_SORTED_HAND);
      expect(round.playableCards).toStrictEqual(mock.MOCK_SORTED_HAND.filter((card) => card.suit === Suit.Hearts));
    });

    test('if player does not have led suit, all cards in hand are playable', () => {
      round.curTrick = [
        { cardPlayed: { suit: Suit.Hearts, name: CardName.Five, faceValue: 5, playValue: 5 }, playedBy: 1 },
      ];
      const noHeartsHand = mock.MOCK_SORTED_HAND.filter((card) => card.suit === Suit.Hearts);
      round.setPlayableCards(noHeartsHand);
      expect(round.playableCards).toStrictEqual(noHeartsHand);
    });
  });

  describe('playCard method', () => {
    let playedCard: CardType;
    beforeEach(() => {
      round.dealHands();
      round.sortHands();
      round.updateActivePlayer(0);
      playedCard = round.hands[0][6];
    });

    test('if passed card is not in hand, playCard throws error', () => {
      playedCard = { suit: Suit.Hearts, name: CardName.Five, faceValue: 5, playValue: 5 };
      expect(() => round.playCard(playedCard)).toThrowError();
      expect(round.hands[0]).toStrictEqual(mock.MOCK_SORTED_HAND);
    });

    test('if passed card is in hand, that card is removed from activePlayer hand', () => {
      const updatedHand = [...round.hands[0]];
      updatedHand.splice(6, 1);
      round.playCard(playedCard);

      expect(round.hands[0]).toStrictEqual(updatedHand);
    });

    test('valid passed card is added to current Trick', () => {
      round.playCard(playedCard);
      expect(round.curTrick[0].cardPlayed).toStrictEqual(playedCard);
    });

    test('endPlayerTurn turn is called', () => {
      const spy = jest.spyOn(round, 'endPlayerTurn');
      round.playCard(playedCard);

      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('endPlayerTurn method', () => {
    test('if 4 cards have been played endTrick is called', () => {
      round.updateActivePlayer(0);
      round.curTrick = mock.MOCK_TRICK;
      expect(round.curTrick.length).toEqual(round.numPlayers);
      const spy = jest.spyOn(round, 'endTrick');

      round.endPlayerTurn();
      expect(spy).toBeCalledTimes(1);
    });

    test('if less than 4 cards have been played updateActivePlayer is called', () => {
      round.updateActivePlayer(1);
      round.curTrick = [];
      expect(round.curTrick.length).not.toEqual(round.numPlayers);
      const spy = jest.spyOn(round, 'updateActivePlayer');

      round.endPlayerTurn();
      expect(spy).toBeCalledTimes(1);
    });

    test('endPlayerTurn calls resetPlayableCards; playableCards is set to an empty array', () => {
      round.dealHands();
      round.updateActivePlayer(1);
      round.setPlayableCards(round.hands[1]);
      round.endPlayerTurn();
      expect(round.playableCards).toStrictEqual([]);
    });
  });

  describe('endTrick method', () => {
    beforeEach(() => {
      round.updateActivePlayer(0);
      round.curTrick = mock.MOCK_TRICK;
      round.endTrick();
    });
    test('endTrick sends trickPoints, trickWinner, and cardsPlayed data to tricksTaken', () => {
      expect(round.tricksTaken).toStrictEqual([mock.TAKEN_TRICKS[0]]);
    });

    test('endTrick calls updatePlayerRoundData, adds trickPoints to player tricksTaken', () => {
      expect(round.playersRoundData[2].tricksTaken).toBe(1);
      expect(round.playersRoundData[0].tricksTaken).toBe(0);
    });
  });
});

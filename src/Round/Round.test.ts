import { BidAmount, CardName, PlayerRoundData, Suit } from '../@types/index';
import { HAND_SIZE } from '../constants/index';
import * as mock from '../constants/mocks';
import { Game } from '../Game/Game';
import { Round } from './Round';

describe('Round', () => {
  let game: Game;
  let round: Round;
  const dealer = 0;
  beforeEach(() => {
    game = new Game(mock.MOCK_USER_0, 'gameId12345', mock.MOCK_GAME_CONFIG);
    round = new Round(
      mock.MOCK_GAME_CONFIG.numPlayers,
      mock.MOCK_GAME_CONFIG.minBid,
      mock.MOCK_PLAYERS,
      dealer,
      game.endRound
    );
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create a new Round', () => {
    test('4 player round should have 4 players', () => {
      expect(round.numPlayers).toBe(4);
      expect(round.numPlayers).toBe(round.playersRoundData.length);
    });

    test('playersRoundData should be of type RoundData', () => {
      expect(round.playersRoundData[0]).toMatchObject<PlayerRoundData>({
        ...mock.MOCK_PLAYERS[0],
        bid: null,
        isDealer: true,
      });
      expect(round.playersRoundData[2]).toMatchObject<PlayerRoundData>({
        ...mock.MOCK_PLAYERS[2],
        bid: null,
        isDealer: false,
      });
    });
  });

  describe('dealHands method', () => {
    beforeEach(() => {
      round = new Round(
        mock.MOCK_GAME_CONFIG.numPlayers,
        mock.MOCK_GAME_CONFIG.minBid,
        mock.MOCK_PLAYERS,
        dealer,
        game.endRound
      );
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
      round = new Round(
        mock.MOCK_GAME_CONFIG.numPlayers,
        mock.MOCK_GAME_CONFIG.minBid,
        mock.MOCK_PLAYERS,
        dealer,
        game.endRound
      );
    });
    test('sortHands should sort the dealt cards in each hand (H,S,D,C) high to low', () => {
      round.sortHands();
      const sorted = round.hands[0].filter((card, i) => {
        if (i + 1 === round.hands[0].length) return true;
        if (card.suit === round.hands[0][i + 1].suit && card.playValue > round.hands[0][i + 1].playValue) return true;
        if (card.suit !== round.hands[0][i + 1].suit) return true;

        return false;
      });
      expect(sorted.length).toBe(8);
    });

    test('sortHands should sort low to high when lowToHigh is passed in', () => {
      round.sortHands('lowToHigh');
      const sortedLH = round.hands[0].filter((card, i) => {
        if (i + 1 === round.hands[0].length) return true;
        if (card.suit === round.hands[0][i + 1].suit && card.playValue < round.hands[0][i + 1].playValue) return true;
        if (card.suit !== round.hands[0][i + 1].suit) return true;

        return false;
      });
      expect(sortedLH.length).toBe(8);
    });
  });

  describe('validBids method', () => {
    test('players must bid greater or equal to the minimum bid', () => {
      round.updateActivePlayer(1);
      expect(round.validBids().filter((bid) => bid < round.minBid && bid !== BidAmount.Pass).length).toBe(0);
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
      round.setPlayerBid(BidAmount.Seven);
      round.updateActivePlayer(2);
      round.setPlayerBid(BidAmount.SevenNo);
      expect(round.bids).toStrictEqual([
        {
          amount: 7,
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
    test('setWinningBid should reduce bids returning the highest bid', () => {
      round.bids = mock.MOCK_BIDS_2;
      expect(round.setWinningBid()).toStrictEqual({ amount: 10, bidder: 3, isTrump: true });
    });
  });

  describe('setTrump method', () => {
    test('setTrump will throw exception if bid.isTrump is false', () => {
      round.winningBid = mock.MOCK_BIDS[1];
      expect(() => {
        round.setTrump(Suit.Hearts);
      }).toThrowError();
    });

    test('setTrump updates round trump property to passed suit', () => {
      expect(round.trump).toBe(null);
      round.bids = mock.MOCK_BIDS;
      round.setWinningBid();
      round.setTrump(Suit.Hearts);
      expect(round.trump).toBe('HEARTS');
    });
  });

  describe('updateActivePlayer method', () => {
    test('if no bids, expect activePlayer to be set to "left" of dealer (seat 1)', () => {
      expect(round.dealer).toBe(0);
      expect(round.bids.length).toBe(0);
      expect(round.activePlayer).toBe(1);
    });

    test('if no bids and dealer is seat 3, activePlayer set to "left" of dealer (0)', () => {
      round.activePlayer = -1;
      round.dealer = 3;
      round.updateActivePlayer();
      expect(round.activePlayer).toBe(0);
    });

    test('updateActivePlayer should throw error if arg is number > numPlayers - 1', () => {
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
      expect(round.activePlayer).toBe(1);
      // expect(round.activePlayer).toBe(2);

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
      round.trick = [
        { cardPlayed: { suit: Suit.Hearts, name: CardName.Five, faceValue: 5, playValue: 5 }, playedBy: 1 },
      ];
      round.setPlayableCards(mock.MOCK_SORTED_HAND);
      expect(round.playableCards).toStrictEqual(mock.MOCK_SORTED_HAND.filter((card) => card.suit === Suit.Hearts));
    });

    test('if player does not have led suit, all cards in hand are playable', () => {
      round.trick = [
        { cardPlayed: { suit: Suit.Hearts, name: CardName.Five, faceValue: 5, playValue: 5 }, playedBy: 1 },
      ];
      const noHeartsHand = mock.MOCK_SORTED_HAND.filter((card) => card.suit === Suit.Hearts);
      round.setPlayableCards(noHeartsHand);
      expect(round.playableCards).toStrictEqual(noHeartsHand);
    });
  });

  describe('playCard method', () => {
    beforeEach(() => {
      round.hands = mock.MOCK_HANDS_SORTED;
      round.bids = mock.MOCK_BIDS_2;
      round.winningBid = { amount: 7, bidder: 0, isTrump: true };
      round.trump = Suit.Clubs;
      round.updateActivePlayer(0);
    });

    test('if passed card is not in hand, playCard throws error', () => {
      const fakeCard = { suit: Suit.Hearts, name: CardName.Five, faceValue: 100, playValue: 100 };
      expect(() => round.playCard(fakeCard)).toThrowError();
      expect(round.hands[0].length).toBe(8);
    });

    test('if passed card is in hand, that card is removed from activePlayer hand', () => {
      const playedCard = round.hands[0][6];
      const updatedHand = JSON.parse(JSON.stringify(round.hands[0]));
      updatedHand.splice(6, 1);
      round.playCard(playedCard);

      expect(round.hands[0]).toStrictEqual(updatedHand);
    });

    test('valid passed card is added to current Trick', () => {
      const playedCard = round.hands[0][1];
      round.playCard(playedCard);
      expect(round.trick[0].cardPlayed).toStrictEqual(playedCard);
    });

    test('endPlayerTurn turn is called', () => {
      const playedCard = round.hands[0][1];
      const spy = jest.spyOn(round, 'endPlayerTurn');

      round.playCard(playedCard);

      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('endPlayerTurn method', () => {
    test('if 4 cards have been played endTrick is called', () => {
      round.updateActivePlayer(0);
      round.trick = mock.MOCK_TRICK_SPADE_LED;
      expect(round.trick.length).toEqual(round.numPlayers);
      const spy = jest.spyOn(round, 'endTrick');

      round.endPlayerTurn();
      expect(spy).toBeCalledTimes(1);
    });

    test('if less than 4 cards have been played updateActivePlayer is called', () => {
      round.updateActivePlayer(1);
      round.trick = [];
      expect(round.trick.length).not.toEqual(round.numPlayers);
      const spyUpdate = jest.spyOn(round, 'updateActivePlayer');

      round.endPlayerTurn();
      expect(spyUpdate).toBeCalledTimes(1);
    });
  });

  describe('endTrick method', () => {
    beforeEach(() => {
      round.updateActivePlayer(0);
      round.trick = mock.MOCK_TRICK_SPADE_LED;
      round.endTrick();
    });
    test('endTrick sends pointValue, trickWinner, and cardsPlayed data to tricksTaken', () => {
      expect(round.tricksTeam0).toStrictEqual([mock.TAKEN_TRICKS_NO_TRUMP[0]]);
    });
  });
});

import { CardName, PlayerType, Suit, User } from '../@types';
import { Cards } from '../Cards/Cards';
import { Round } from '../Round/Round';
import { Game } from './Game';

const mockUser: User = {
  userId: 'mockUser1234',
  name: 'Ryan',
};

const mockUser2: User = {
  userId: 'mockUser5678',
  name: 'Cody',
};

const mockUser3: User = {
  userId: 'mockUser9999',
  name: 'Stacey',
};

const mockPlayers: PlayerType[] = [
  {
    userId: 'player1',
    userName: 'Ryan',
    seat: 0,
    team: 0,
    score: 24,
  },
  {
    userId: 'player2',
    userName: 'Cody',
    seat: 1,
    team: 1,
    score: -10,
  },
  {
    userId: 'player3',
    userName: 'Stacey',
    seat: 2,
    team: 0,
    score: 24,
  },
  {
    userId: 'player4',
    userName: 'Paul',
    seat: 3,
    team: 1,
    score: -10,
  },
];

const mockShuffledDeck = [
  { suit: Suit.Spades, name: CardName.Nine, faceValue: 9, playValue: 9 },
  { suit: Suit.Spades, name: CardName.Queen, faceValue: 12, playValue: 12 },
  { suit: Suit.Spades, name: CardName.Eight, faceValue: 8, playValue: 8 },
  { suit: Suit.Spades, name: CardName.King, faceValue: 13, playValue: 13 },
  { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 },
  { suit: Suit.Diamonds, name: CardName.Eight, faceValue: 8, playValue: 8 },
  { suit: Suit.Diamonds, name: CardName.Seven, faceValue: 7, playValue: 7 },
  { suit: Suit.Diamonds, name: CardName.Ten, faceValue: 10, playValue: 10 },
  { suit: Suit.Hearts, name: CardName.Eight, faceValue: 8, playValue: 8 },
  { suit: Suit.Clubs, name: CardName.Ten, faceValue: 10, playValue: 10 },
  { suit: Suit.Spades, name: CardName.Jack, faceValue: 11, playValue: 11 },
  { suit: Suit.Spades, name: CardName.Ace, faceValue: 1, playValue: 14 },
  { suit: Suit.Diamonds, name: CardName.King, faceValue: 13, playValue: 13 },
  { suit: Suit.Clubs, name: CardName.Jack, faceValue: 11, playValue: 11 },
  { suit: Suit.Diamonds, name: CardName.Nine, faceValue: 9, playValue: 9 },
  { suit: Suit.Diamonds, name: CardName.Jack, faceValue: 11, playValue: 11 },
  { suit: Suit.Diamonds, name: CardName.Ace, faceValue: 1, playValue: 14 },
  { suit: Suit.Hearts, name: CardName.Queen, faceValue: 12, playValue: 12 },
  { suit: Suit.Hearts, name: CardName.Five, faceValue: 5, playValue: 5 },
  { suit: Suit.Spades, name: CardName.Three, faceValue: 3, playValue: 3 },
  { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 },
  { suit: Suit.Clubs, name: CardName.King, faceValue: 13, playValue: 13 },
  { suit: Suit.Clubs, name: CardName.Ace, faceValue: 1, playValue: 14 },
  { suit: Suit.Clubs, name: CardName.Nine, faceValue: 9, playValue: 9 },
  { suit: Suit.Clubs, name: CardName.Eight, faceValue: 8, playValue: 8 },
  { suit: Suit.Diamonds, name: CardName.Queen, faceValue: 12, playValue: 12 },
  { suit: Suit.Clubs, name: CardName.Seven, faceValue: 7, playValue: 7 },
  { suit: Suit.Hearts, name: CardName.Nine, faceValue: 9, playValue: 9 },
  { suit: Suit.Hearts, name: CardName.Ten, faceValue: 10, playValue: 10 },
  { suit: Suit.Hearts, name: CardName.Jack, faceValue: 11, playValue: 11 },
  { suit: Suit.Clubs, name: CardName.Queen, faceValue: 12, playValue: 12 },
  { suit: Suit.Spades, name: CardName.Ten, faceValue: 10, playValue: 10 },
];

const mockRoundtotals = {
  bidMade: true,
  points: [9, 1],
  playerTricks: [6, 0, 3, 1],
};

const mockGameConfig = {
  numOfPlayers: 4,
  minBid: 7,
  scoreToWin: 52,
};

describe('Game with 4 players', () => {
  let game: InstanceType<typeof Game>;
  beforeAll(() => {
    game = new Game(mockUser, mockGameConfig);
  });

  describe('addPlayer method', () => {
    test('addPlayer should increase Game players by 1', () => {
      const initialPlayerNum = game.players.length;
      game.addPlayer(mockUser2);

      expect(game.players.length).toBe(initialPlayerNum + 1);
    });

    test('addPlayer should give expected values for userId, seat, and team', () => {
      game.addPlayer(mockUser2);
      game.addPlayer(mockUser3);

      expect(game.players[1].userId).toBe('mockUser5678');
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

  describe('createDeck method', () => {
    test('cards should be instance of Cards', () => {
      game.createDeck();

      expect(game.cards).toBeInstanceOf(Cards);
    });

    test('the deck should have 32 cards', () => {
      game.createDeck();

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
      game.players = mockPlayers;
      game.createRound();
    });

    test('curRound should be instance of Round', () => {
      expect(game.curRound).toBeInstanceOf(Round);
    });

    test('4 player round should have 4 players', () => {
      expect(game.curRound?.players.length).toBe(4);
    });
  });

  describe('updateScore method', () => {
    beforeEach(() => {
      game.scores = [23, -10];
    });

    test('score of 8 and 2 should be added to respective teams', () => {
      game.updateScores([8, 2]);
      expect(game.scores).toStrictEqual([31, -8]);
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
      game.endRound(mockRoundtotals);
      expect(spy).toBeCalledTimes(1);
    });

    test('if a team score is not over scoreToWin createRound is called', () => {
      game.scores = [12, 18];
      const spy = jest.spyOn(game, 'createRound');
      game.endRound(mockRoundtotals);
      expect(spy).toBeCalledTimes(1);
    });
  });
});

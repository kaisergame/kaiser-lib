import { CardName, PlayerType, Suit, UserType } from '../@types/index';

export const MOCK_USER_1: UserType = {
  userId: 'mockUser1234',
  userName: 'Ryan',
};

export const MOCK_USER_2: UserType = {
  userId: 'mockUser5678',
  userName: 'Cody',
};

export const MOCK_USER_3: UserType = {
  userId: 'mockUser9999',
  userName: 'Stacey',
};

export const MOCK_PLAYERS: PlayerType[] = [
  {
    userId: 'mockUser1234',
    userName: 'Ryan',
    seat: 0,
    team: 0,
    score: 24,
  },
  {
    userId: 'mockUser5678',
    userName: 'Cody',
    seat: 1,
    team: 1,
    score: -10,
  },
  {
    userId: 'mockUser9999',
    userName: 'Stacey',
    seat: 2,
    team: 0,
    score: 24,
  },
  {
    userId: 'mockUser7777',
    userName: 'Paul',
    seat: 3,
    team: 1,
    score: -10,
  },
];

export const MOCK_SHUFFLED_DECK = [
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

export const MOCK_SORTED_HAND = [
  { suit: Suit.Clubs, name: CardName.Eight, faceValue: 8, playValue: 8 },
  { suit: Suit.Diamonds, name: CardName.Ace, faceValue: 1, playValue: 14 },
  { suit: Suit.Diamonds, name: CardName.King, faceValue: 13, playValue: 13 },
  { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 },
  { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 },
  { suit: Suit.Hearts, name: CardName.Ten, faceValue: 10, playValue: 10 },
  { suit: Suit.Hearts, name: CardName.Eight, faceValue: 8, playValue: 8 },
  { suit: Suit.Spades, name: CardName.Nine, faceValue: 9, playValue: 9 },
];

export const MOCK_REVERSE_SORTED_HAND = [
  { suit: Suit.Clubs, name: CardName.Eight, faceValue: 8, playValue: 8 },
  { suit: Suit.Diamonds, name: CardName.King, faceValue: 13, playValue: 13 },
  { suit: Suit.Diamonds, name: CardName.Ace, faceValue: 1, playValue: 14 },
  { suit: Suit.Hearts, name: CardName.Eight, faceValue: 8, playValue: 8 },
  { suit: Suit.Hearts, name: CardName.Ten, faceValue: 10, playValue: 10 },
  { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 },
  { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 },
  { suit: Suit.Spades, name: CardName.Nine, faceValue: 9, playValue: 9 },
];

export const MOCK_BIDS = [
  { amount: 7, bidder: 1, isTrump: true },
  { amount: 7.5, bidder: 2, isTrump: false },
  { amount: 10, bidder: 3, isTrump: true },
];

export const MOCK_PASS_BIDS = [
  { amount: 0, bidder: 1, isTrump: true },
  { amount: 0, bidder: 2, isTrump: true },
  { amount: 0, bidder: 3, isTrump: true },
];

export const MOCK_ROUND_TOTALS = {
  bidMade: true,
  points: [9, 1],
  playerTricks: [6, 0, 3, 1],
};

export const MOCK_TRICK = [
  { cardPlayed: { suit: Suit.Spades, name: CardName.Eight, faceValue: 8, playValue: 8 }, playedBy: 1 },
  { cardPlayed: { suit: Suit.Spades, name: CardName.King, faceValue: 13, playValue: 13 }, playedBy: 2 },
  { cardPlayed: { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 }, playedBy: 3 },
  { cardPlayed: { suit: Suit.Diamonds, name: CardName.Eight, faceValue: 8, playValue: 8 }, playedBy: 0 },
];

export const TAKEN_TRICKS = [
  {
    trickValue: 1,
    cardsPlayed: [
      { cardPlayed: { suit: Suit.Spades, name: CardName.Eight, faceValue: 8, playValue: 8 }, playedBy: 1 },
      { cardPlayed: { suit: Suit.Spades, name: CardName.King, faceValue: 13, playValue: 13 }, playedBy: 2 },
      { cardPlayed: { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 }, playedBy: 3 },
      { cardPlayed: { suit: Suit.Diamonds, name: CardName.Eight, faceValue: 8, playValue: 8 }, playedBy: 0 },
    ],
    trickWonBy: 2,
  },
  {
    trickValue: 6,
    cardsPlayed: [
      { cardPlayed: { suit: Suit.Hearts, name: CardName.Five, faceValue: 5, playValue: 5 }, playedBy: 2 },
      { cardPlayed: { suit: Suit.Spades, name: CardName.Three, faceValue: 3, playValue: 3 }, playedBy: 3 },
      { cardPlayed: { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 }, playedBy: 0 },
      { cardPlayed: { suit: Suit.Clubs, name: CardName.King, faceValue: 13, playValue: 13 }, playedBy: 1 },
    ],
    trickWonBy: 0,
  },
];

export const MOCK_GAME_CONFIG = {
  numOfPlayers: 4,
  minBid: 7,
  scoreToWin: 52,
};

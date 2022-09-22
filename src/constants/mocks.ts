import {
  BidType,
  CardName,
  Deck,
  EvaluatedTrick,
  GameConfig,
  Hand,
  PlayerType,
  RoundTotals,
  Suit,
  TrickType,
} from '../@types/index';

export const MOCK_USER_1 = {
  id: 'mockUser1234',
  name: 'Ryan',
};

export const MOCK_USER_2 = {
  id: 'mockUser5678',
  name: 'Cody',
};

export const MOCK_USER_3 = {
  id: 'mockUser9999',
  name: 'Stacey',
};

export const MOCK_PLAYERS: PlayerType[] = [
  {
    playerId: 'mockUser1234',
    name: 'Ryan',
    seat: 0,
    teamId: 'team0',
  },
  {
    playerId: 'mockUser5678',
    name: 'Cody',
    seat: 1,
    teamId: 'team1',
  },
  {
    playerId: 'mockUser9999',
    name: 'Stacey',
    seat: 2,
    teamId: 'team0',
  },
  {
    playerId: 'mockUser7777',
    name: 'Paul',
    seat: 3,
    teamId: 'team1',
  },
];

export const MOCK_SHUFFLED_DECK: Deck = [
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

export const MOCK_SORTED_HAND: Hand = [
  { suit: Suit.Clubs, name: CardName.Eight, faceValue: 8, playValue: 8 },
  { suit: Suit.Diamonds, name: CardName.Ace, faceValue: 1, playValue: 14 },
  { suit: Suit.Diamonds, name: CardName.King, faceValue: 13, playValue: 13 },
  { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 },
  { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 },
  { suit: Suit.Hearts, name: CardName.Ten, faceValue: 10, playValue: 10 },
  { suit: Suit.Hearts, name: CardName.Eight, faceValue: 8, playValue: 8 },
  { suit: Suit.Spades, name: CardName.Nine, faceValue: 9, playValue: 9 },
];

export const MOCK_REVERSE_SORTED_HAND: Hand = [
  { suit: Suit.Clubs, name: CardName.Eight, faceValue: 8, playValue: 8 },
  { suit: Suit.Diamonds, name: CardName.King, faceValue: 13, playValue: 13 },
  { suit: Suit.Diamonds, name: CardName.Ace, faceValue: 1, playValue: 14 },
  { suit: Suit.Hearts, name: CardName.Eight, faceValue: 8, playValue: 8 },
  { suit: Suit.Hearts, name: CardName.Ten, faceValue: 10, playValue: 10 },
  { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 },
  { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 },
  { suit: Suit.Spades, name: CardName.Nine, faceValue: 9, playValue: 9 },
];

export const MOCK_BIDS: BidType[] = [
  { amount: 7, bidder: 1, isTrump: true },
  { amount: 7.5, bidder: 2, isTrump: false },
  { amount: 10, bidder: 3, isTrump: true },
];

export const MOCK_PASS_BIDS: BidType[] = [
  { amount: 0, bidder: 1, isTrump: true },
  { amount: 0, bidder: 2, isTrump: true },
  { amount: 0, bidder: 3, isTrump: true },
];

export const MOCK_ROUND_TOTALS: RoundTotals = {
  bid: { amount: 10, bidder: 3, isTrump: true, bidMade: true },
  roundPoints: [
    { teamId: 'team0', points: 9 },
    { teamId: 'team1', points: 1 },
  ],
  playerPoints: [
    { playerSeat: 0, points: 6 },
    { playerSeat: 1, points: 0 },
    { playerSeat: 2, points: 3 },
    { playerSeat: 3, points: 1 },
  ],
};

export const MOCK_TRICK: TrickType = [
  { cardPlayed: { suit: Suit.Spades, name: CardName.Eight, faceValue: 8, playValue: 8 }, playedBy: 1 },
  { cardPlayed: { suit: Suit.Spades, name: CardName.King, faceValue: 13, playValue: 13 }, playedBy: 2 },
  { cardPlayed: { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 }, playedBy: 3 },
  { cardPlayed: { suit: Suit.Diamonds, name: CardName.Eight, faceValue: 8, playValue: 8 }, playedBy: 0 },
];

export const TAKEN_TRICKS: EvaluatedTrick[] = [
  {
    pointValue: 1,
    cardsPlayed: [
      { cardPlayed: { suit: Suit.Spades, name: CardName.Eight, faceValue: 8, playValue: 8 }, playedBy: 1 },
      { cardPlayed: { suit: Suit.Spades, name: CardName.King, faceValue: 13, playValue: 13 }, playedBy: 2 },
      { cardPlayed: { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 }, playedBy: 3 },
      { cardPlayed: { suit: Suit.Diamonds, name: CardName.Eight, faceValue: 8, playValue: 8 }, playedBy: 0 },
    ],
    trickWonBy: 2,
  },
  {
    pointValue: 6,
    cardsPlayed: [
      { cardPlayed: { suit: Suit.Hearts, name: CardName.Five, faceValue: 5, playValue: 5 }, playedBy: 2 },
      { cardPlayed: { suit: Suit.Spades, name: CardName.Three, faceValue: 3, playValue: 3 }, playedBy: 3 },
      { cardPlayed: { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 }, playedBy: 0 },
      { cardPlayed: { suit: Suit.Clubs, name: CardName.King, faceValue: 13, playValue: 13 }, playedBy: 1 },
    ],
    trickWonBy: 0,
  },
];

export const MOCK_GAME_CONFIG: GameConfig = {
  numPlayers: 4,
  minBid: 7,
  scoreToWin: 52,
};

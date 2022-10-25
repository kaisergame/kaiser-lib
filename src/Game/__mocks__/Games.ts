import {
  BidAmount,
  BidType,
  CardName,
  Deck,
  EvaluatedTrick,
  GameConfig,
  Hand,
  NoSuit,
  PlayerType,
  RoundSummary,
  Suit,
  TrickType,
} from 'src/@types/index';

// CONFIG
export const MOCK_GAME_CONFIG: GameConfig = {
  numPlayers: 4,
  minBid: 7,
  scoreToWin: 52,
};

// PLAYERS
export const MOCK_USER_0 = {
  id: 'mockUser0000',
  name: 'Ryan',
};

export const MOCK_USER_1 = {
  id: 'mockUser1111',
  name: 'Cody',
};

export const MOCK_USER_2 = {
  id: 'mockUser2222',
  name: 'Stacey',
};

export const MOCK_USER_3 = {
  id: 'mockUser3333',
  name: 'Paul',
};

export const MOCK_USER_4 = {
  id: 'mockUser4444',
  name: 'Chris',
};

export const MOCK_PLAYERS: PlayerType[] = [
  {
    playerId: 'mockUser0000',
    name: 'Ryan',
    playerIndex: 0,
    teamId: 'team0',
  },
  {
    playerId: 'mockUser1111',
    name: 'Cody',
    playerIndex: 1,
    teamId: 'team1',
  },
  {
    playerId: 'mockUser2222',
    name: 'Stacey',
    playerIndex: 2,
    teamId: 'team0',
  },
  {
    playerId: 'mockUser3333',
    name: 'Paul',
    playerIndex: 3,
    teamId: 'team1',
  },
];

// CARDS
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

export const MOCK_HANDS: Hand[] = [
  [
    { suit: Suit.Spades, name: CardName.Nine, faceValue: 9, playValue: 9 },
    { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 },
    { suit: Suit.Hearts, name: CardName.Eight, faceValue: 8, playValue: 8 },
    { suit: Suit.Diamonds, name: CardName.King, faceValue: 13, playValue: 13 },
    { suit: Suit.Diamonds, name: CardName.Ace, faceValue: 1, playValue: 14 },
    { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 },
    { suit: Suit.Clubs, name: CardName.Eight, faceValue: 8, playValue: 8 },
    { suit: Suit.Hearts, name: CardName.Ten, faceValue: 10, playValue: 10 },
  ],
  [
    { suit: Suit.Spades, name: CardName.Queen, faceValue: 12, playValue: 12 },
    { suit: Suit.Diamonds, name: CardName.Eight, faceValue: 8, playValue: 8 },
    { suit: Suit.Clubs, name: CardName.Ten, faceValue: 10, playValue: 10 },
    { suit: Suit.Clubs, name: CardName.Jack, faceValue: 11, playValue: 11 },
    { suit: Suit.Hearts, name: CardName.Queen, faceValue: 12, playValue: 12 },
    { suit: Suit.Clubs, name: CardName.King, faceValue: 13, playValue: 13 },
    { suit: Suit.Diamonds, name: CardName.Queen, faceValue: 12, playValue: 12 },
    { suit: Suit.Hearts, name: CardName.Jack, faceValue: 11, playValue: 11 },
  ],
  [
    { suit: Suit.Spades, name: CardName.Eight, faceValue: 8, playValue: 8 },
    { suit: Suit.Diamonds, name: CardName.Seven, faceValue: 7, playValue: 7 },
    { suit: Suit.Spades, name: CardName.Jack, faceValue: 11, playValue: 11 },
    { suit: Suit.Diamonds, name: CardName.Nine, faceValue: 9, playValue: 9 },
    { suit: Suit.Hearts, name: CardName.Five, faceValue: 5, playValue: 5 },
    { suit: Suit.Clubs, name: CardName.Ace, faceValue: 1, playValue: 14 },
    { suit: Suit.Clubs, name: CardName.Seven, faceValue: 7, playValue: 7 },
    { suit: Suit.Clubs, name: CardName.Queen, faceValue: 12, playValue: 12 },
  ],
  [
    { suit: Suit.Spades, name: CardName.King, faceValue: 13, playValue: 13 },
    { suit: Suit.Diamonds, name: CardName.Ten, faceValue: 10, playValue: 10 },
    { suit: Suit.Spades, name: CardName.Ace, faceValue: 1, playValue: 14 },
    { suit: Suit.Diamonds, name: CardName.Jack, faceValue: 11, playValue: 11 },
    { suit: Suit.Spades, name: CardName.Three, faceValue: 3, playValue: 3 },
    { suit: Suit.Clubs, name: CardName.Nine, faceValue: 9, playValue: 9 },
    { suit: Suit.Hearts, name: CardName.Nine, faceValue: 9, playValue: 9 },
    { suit: Suit.Spades, name: CardName.Ten, faceValue: 10, playValue: 10 },
  ],
];

export const MOCK_HANDS_SORTED: Hand[] = [
  [
    { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 },
    { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 },
    { suit: Suit.Hearts, name: CardName.Ten, faceValue: 10, playValue: 10 },
    { suit: Suit.Hearts, name: CardName.Eight, faceValue: 8, playValue: 8 },
    { suit: Suit.Spades, name: CardName.Nine, faceValue: 9, playValue: 9 },
    { suit: Suit.Diamonds, name: CardName.Ace, faceValue: 1, playValue: 14 },
    { suit: Suit.Diamonds, name: CardName.King, faceValue: 13, playValue: 13 },
    { suit: Suit.Clubs, name: CardName.Eight, faceValue: 8, playValue: 8 },
  ],
  [
    { suit: Suit.Hearts, name: CardName.Queen, faceValue: 12, playValue: 12 },
    { suit: Suit.Hearts, name: CardName.Jack, faceValue: 11, playValue: 11 },
    { suit: Suit.Spades, name: CardName.Queen, faceValue: 12, playValue: 12 },
    { suit: Suit.Diamonds, name: CardName.Queen, faceValue: 12, playValue: 12 },
    { suit: Suit.Diamonds, name: CardName.Eight, faceValue: 8, playValue: 8 },
    { suit: Suit.Clubs, name: CardName.King, faceValue: 13, playValue: 13 },
    { suit: Suit.Clubs, name: CardName.Jack, faceValue: 11, playValue: 11 },
    { suit: Suit.Clubs, name: CardName.Ten, faceValue: 10, playValue: 10 },
  ],
  [
    { suit: Suit.Hearts, name: CardName.Five, faceValue: 5, playValue: 5 },
    { suit: Suit.Spades, name: CardName.Jack, faceValue: 11, playValue: 11 },
    { suit: Suit.Spades, name: CardName.Eight, faceValue: 8, playValue: 8 },
    { suit: Suit.Diamonds, name: CardName.Nine, faceValue: 9, playValue: 9 },
    { suit: Suit.Diamonds, name: CardName.Seven, faceValue: 7, playValue: 7 },
    { suit: Suit.Clubs, name: CardName.Ace, faceValue: 1, playValue: 14 },
    { suit: Suit.Clubs, name: CardName.Queen, faceValue: 12, playValue: 12 },
    { suit: Suit.Clubs, name: CardName.Seven, faceValue: 7, playValue: 7 },
  ],
  [
    { suit: Suit.Hearts, name: CardName.Nine, faceValue: 9, playValue: 9 },
    { suit: Suit.Spades, name: CardName.Ace, faceValue: 1, playValue: 14 },
    { suit: Suit.Spades, name: CardName.King, faceValue: 13, playValue: 13 },
    { suit: Suit.Spades, name: CardName.Ten, faceValue: 10, playValue: 10 },
    { suit: Suit.Spades, name: CardName.Three, faceValue: 3, playValue: 3 },
    { suit: Suit.Diamonds, name: CardName.Jack, faceValue: 11, playValue: 11 },
    { suit: Suit.Diamonds, name: CardName.Ten, faceValue: 10, playValue: 10 },
    { suit: Suit.Clubs, name: CardName.Nine, faceValue: 9, playValue: 9 },
  ],
];

// BIDS
export const MOCK_VALID_BIDS = [
  BidAmount.Pass,
  BidAmount.Seven,
  BidAmount.Eight,
  BidAmount.Nine,
  BidAmount.Ten,
  BidAmount.Eleven,
  BidAmount.Twelve,
];

export const MOCK_BIDS: BidType[] = [
  { amount: 7, bidder: 'mockUser1111', playerIndex: 1, isTrump: true },
  { amount: 7.5, bidder: 'mockUser2222', playerIndex: 2, isTrump: false },
  { amount: 10, bidder: 'mockUser3333', playerIndex: 3, isTrump: true },
];

export const MOCK_BIDS_2: BidType[] = [
  { amount: 7, bidder: 'mockUser1111', playerIndex: 1, isTrump: true },
  { amount: 7.5, bidder: 'mockUser2222', playerIndex: 2, isTrump: false },
  { amount: 10, bidder: 'mockUser3333', playerIndex: 3, isTrump: true },
  { amount: 0, bidder: 'mockUser0000', playerIndex: 0, isTrump: false },
];

export const MOCK_PASS_BIDS: BidType[] = [
  { amount: 0, bidder: 'mockUser1111', playerIndex: 1, isTrump: true },
  { amount: 0, bidder: 'mockUser2222', playerIndex: 2, isTrump: true },
  { amount: 0, bidder: 'mockUser3333', playerIndex: 3, isTrump: true },
];

// TRICKS
export const MOCK_TRICK_0: TrickType = [
  {
    cardPlayed: { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 },
    playedBy: 'mockUser0000',
    playerIndex: 0,
  },
  {
    cardPlayed: { suit: Suit.Spades, name: CardName.King, faceValue: 13, playValue: 13 },
    playedBy: 'mockUser1111',
    playerIndex: 1,
  },
  {
    cardPlayed: { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 },
    playedBy: 'mockUser2222',
    playerIndex: 2,
  },
  {
    cardPlayed: { suit: Suit.Diamonds, name: CardName.Eight, faceValue: 8, playValue: 8 },
    playedBy: 'mockUser3333',
    playerIndex: 3,
  },
];

export const MOCK_TRICK_SPADE_LED: TrickType = [
  {
    cardPlayed: { suit: Suit.Spades, name: CardName.Eight, faceValue: 8, playValue: 8 },
    playedBy: 'mockUser1111',
    playerIndex: 1,
  },
  {
    cardPlayed: { suit: Suit.Spades, name: CardName.King, faceValue: 13, playValue: 13 },
    playedBy: 'mockUser2222',
    playerIndex: 2,
  },
  {
    cardPlayed: { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 },
    playedBy: 'mockUser3333',
    playerIndex: 3,
  },
  {
    cardPlayed: { suit: Suit.Diamonds, name: CardName.Eight, faceValue: 8, playValue: 8 },
    playedBy: 'mockUser0000',
    playerIndex: 0,
  },
];

export const TAKEN_TRICKS_NO_TRUMP: EvaluatedTrick[] = [
  {
    pointValue: 1,
    cardsPlayed: [
      {
        cardPlayed: { suit: Suit.Spades, name: CardName.Eight, faceValue: 8, playValue: 8 },
        playedBy: 'mockUser1111',
        playerIndex: 1,
      },
      {
        cardPlayed: { suit: Suit.Spades, name: CardName.King, faceValue: 13, playValue: 13 },
        playedBy: 'mockUser2222',
        playerIndex: 2,
      },
      {
        cardPlayed: { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 0 },
        playedBy: 'mockUser3333',
        playerIndex: 3,
      },
      {
        cardPlayed: { suit: Suit.Diamonds, name: CardName.Eight, faceValue: 8, playValue: 0 },
        playedBy: 'mockUser0000',
        playerIndex: 0,
      },
    ],
    trickWonBy: MOCK_PLAYERS[2],
  },
  {
    pointValue: 6,
    cardsPlayed: [
      {
        cardPlayed: { suit: Suit.Hearts, name: CardName.Five, faceValue: 5, playValue: 5 },
        playedBy: 'mockUser2222',
        playerIndex: 2,
      },
      {
        cardPlayed: { suit: Suit.Spades, name: CardName.Three, faceValue: 3, playValue: 0 },
        playedBy: 'mockUser3333',
        playerIndex: 3,
      },
      {
        cardPlayed: { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 },
        playedBy: 'mockUser0000',
        playerIndex: 0,
      },
      {
        cardPlayed: { suit: Suit.Clubs, name: CardName.King, faceValue: 13, playValue: 0 },
        playedBy: 'mockUser1111',
        playerIndex: 1,
      },
    ],
    trickWonBy: MOCK_PLAYERS[0],
  },
];

// ROUND TOTALS
export const MOCK_ROUND_TOTALS: RoundSummary = {
  roundNum: 1,
  winningBid: { amount: 9, bidder: 'mockUser2222', playerIndex: 2, isTrump: true },
  isBidMade: false,
  trump: Suit.Hearts,
  roundPoints: [
    { teamId: 'team0', points: -9 },
    { teamId: 'team1', points: 4 },
  ],
  playerPoints: [
    { playerId: 'mockUser0000', playerIndex: 0, points: 2 },
    { playerId: 'mockUser1111', playerIndex: 1, points: 3 },
    { playerId: 'mockUser2222', playerIndex: 2, points: 4 },
    { playerId: 'mockUser3333', playerIndex: 3, points: 1 },
  ],
};

export const MOCK_ROUND_TOTALS_2: RoundSummary = {
  roundNum: 1,
  winningBid: { amount: 10, bidder: 'mockUser3333', playerIndex: 3, isTrump: false },
  isBidMade: true,
  trump: NoSuit.NoTrump,
  roundPoints: [
    { teamId: 'team0', points: -1 },
    { teamId: 'team1', points: 22 },
  ],
  playerPoints: [
    { playerId: 'mockUser0000', playerIndex: 0, points: -2 },
    { playerId: 'mockUser1111', playerIndex: 1, points: 2 },
    { playerId: 'mockUser2222', playerIndex: 2, points: 1 },
    { playerId: 'mockUser3333', playerIndex: 3, points: 9 },
  ],
};

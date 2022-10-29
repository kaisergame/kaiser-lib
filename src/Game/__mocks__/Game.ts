import {
  BidAmount,
  PlayerBid,
  CardName,
  Deck,
  EvaluatedTrick,
  GameConfig,
  Hand,
  PlayerHand,
  PlayerType,
  RoundSummary,
  Suit,
  TeamType,
  TrickType,
  GameVersion,
} from 'src/@types/index';

// CONFIG
export const MOCK_GAME_CONFIG: GameConfig = {
  numPlayers: 4,
  minBid: 7,
  scoreToWin: 52,
};

// PLAYERS
export const MOCK_USER_0 = {
  id: 'mockUser0',
  name: 'Ryan',
};

export const MOCK_USER_1 = {
  id: 'mockUser1',
  name: 'Cody',
};

export const MOCK_USER_2 = {
  id: 'mockUser2',
  name: 'Stacey',
};

export const MOCK_USER_3 = {
  id: 'mockUser3',
  name: 'Paul',
};

export const MOCK_USER_4 = {
  id: 'mockUser4',
  name: 'Chris',
};

export const MOCK_PLAYERS: PlayerType[] = [
  {
    playerId: 'mockUser0',
    name: 'Ryan',
    playerIndex: 0,
    teamId: 'team0',
  },
  {
    playerId: 'mockUser1',
    name: 'Cody',
    playerIndex: 1,
    teamId: 'team1',
  },
  {
    playerId: 'mockUser2',
    name: 'Stacey',
    playerIndex: 2,
    teamId: 'team0',
  },
  {
    playerId: 'mockUser3',
    name: 'Paul',
    playerIndex: 3,
    teamId: 'team1',
  },
];

export const MOCK_SWITCH_PLAYERS: PlayerType[] = [
  {
    playerId: 'mockUser3',
    name: 'Paul',
    playerIndex: 0,
    teamId: 'team0',
  },
  {
    playerId: 'mockUser1',
    name: 'Cody',
    playerIndex: 1,
    teamId: 'team1',
  },
  {
    playerId: 'mockUser2',
    name: 'Stacey',
    playerIndex: 2,
    teamId: 'team0',
  },
  {
    playerId: 'mockUser0',
    name: 'Ryan',
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

export const MOCK_HANDS: PlayerHand[] = [
  {
    playerId: 'mockUser0',
    hand: [
      { suit: Suit.Spades, name: CardName.Nine, faceValue: 9, playValue: 9 },
      { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 },
      { suit: Suit.Hearts, name: CardName.Eight, faceValue: 8, playValue: 8 },
      { suit: Suit.Diamonds, name: CardName.King, faceValue: 13, playValue: 13 },
      { suit: Suit.Diamonds, name: CardName.Ace, faceValue: 1, playValue: 14 },
      { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 },
      { suit: Suit.Clubs, name: CardName.Eight, faceValue: 8, playValue: 8 },
      { suit: Suit.Hearts, name: CardName.Ten, faceValue: 10, playValue: 10 },
    ],
  },
  {
    playerId: 'mockUser1',
    hand: [
      { suit: Suit.Spades, name: CardName.Queen, faceValue: 12, playValue: 12 },
      { suit: Suit.Diamonds, name: CardName.Eight, faceValue: 8, playValue: 8 },
      { suit: Suit.Clubs, name: CardName.Ten, faceValue: 10, playValue: 10 },
      { suit: Suit.Clubs, name: CardName.Jack, faceValue: 11, playValue: 11 },
      { suit: Suit.Hearts, name: CardName.Queen, faceValue: 12, playValue: 12 },
      { suit: Suit.Clubs, name: CardName.King, faceValue: 13, playValue: 13 },
      { suit: Suit.Diamonds, name: CardName.Queen, faceValue: 12, playValue: 12 },
      { suit: Suit.Hearts, name: CardName.Jack, faceValue: 11, playValue: 11 },
    ],
  },
  {
    playerId: 'mockUser2',
    hand: [
      { suit: Suit.Spades, name: CardName.Eight, faceValue: 8, playValue: 8 },
      { suit: Suit.Diamonds, name: CardName.Seven, faceValue: 7, playValue: 7 },
      { suit: Suit.Spades, name: CardName.Jack, faceValue: 11, playValue: 11 },
      { suit: Suit.Diamonds, name: CardName.Nine, faceValue: 9, playValue: 9 },
      { suit: Suit.Hearts, name: CardName.Five, faceValue: 5, playValue: 5 },
      { suit: Suit.Clubs, name: CardName.Ace, faceValue: 1, playValue: 14 },
      { suit: Suit.Clubs, name: CardName.Seven, faceValue: 7, playValue: 7 },
      { suit: Suit.Clubs, name: CardName.Queen, faceValue: 12, playValue: 12 },
    ],
  },
  {
    playerId: 'mockUser3',
    hand: [
      { suit: Suit.Spades, name: CardName.King, faceValue: 13, playValue: 13 },
      { suit: Suit.Diamonds, name: CardName.Ten, faceValue: 10, playValue: 10 },
      { suit: Suit.Spades, name: CardName.Ace, faceValue: 1, playValue: 14 },
      { suit: Suit.Diamonds, name: CardName.Jack, faceValue: 11, playValue: 11 },
      { suit: Suit.Spades, name: CardName.Three, faceValue: 3, playValue: 3 },
      { suit: Suit.Clubs, name: CardName.Nine, faceValue: 9, playValue: 9 },
      { suit: Suit.Hearts, name: CardName.Nine, faceValue: 9, playValue: 9 },
      { suit: Suit.Spades, name: CardName.Ten, faceValue: 10, playValue: 10 },
    ],
  },
];

export const MOCK_HANDS_SORTED: PlayerHand[] = [
  {
    playerId: 'mockUser0',
    hand: [
      { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 },
      { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 },
      { suit: Suit.Hearts, name: CardName.Ten, faceValue: 10, playValue: 10 },
      { suit: Suit.Hearts, name: CardName.Eight, faceValue: 8, playValue: 8 },
      { suit: Suit.Spades, name: CardName.Nine, faceValue: 9, playValue: 9 },
      { suit: Suit.Diamonds, name: CardName.Ace, faceValue: 1, playValue: 14 },
      { suit: Suit.Diamonds, name: CardName.King, faceValue: 13, playValue: 13 },
      { suit: Suit.Clubs, name: CardName.Eight, faceValue: 8, playValue: 8 },
    ],
  },
  {
    playerId: 'mockUser1',
    hand: [
      { suit: Suit.Hearts, name: CardName.Queen, faceValue: 12, playValue: 12 },
      { suit: Suit.Hearts, name: CardName.Jack, faceValue: 11, playValue: 11 },
      { suit: Suit.Spades, name: CardName.Queen, faceValue: 12, playValue: 12 },
      { suit: Suit.Diamonds, name: CardName.Queen, faceValue: 12, playValue: 12 },
      { suit: Suit.Diamonds, name: CardName.Eight, faceValue: 8, playValue: 8 },
      { suit: Suit.Clubs, name: CardName.King, faceValue: 13, playValue: 13 },
      { suit: Suit.Clubs, name: CardName.Jack, faceValue: 11, playValue: 11 },
      { suit: Suit.Clubs, name: CardName.Ten, faceValue: 10, playValue: 10 },
    ],
  },
  {
    playerId: 'mockUser2',
    hand: [
      { suit: Suit.Hearts, name: CardName.Five, faceValue: 5, playValue: 5 },
      { suit: Suit.Spades, name: CardName.Jack, faceValue: 11, playValue: 11 },
      { suit: Suit.Spades, name: CardName.Eight, faceValue: 8, playValue: 8 },
      { suit: Suit.Diamonds, name: CardName.Nine, faceValue: 9, playValue: 9 },
      { suit: Suit.Diamonds, name: CardName.Seven, faceValue: 7, playValue: 7 },
      { suit: Suit.Clubs, name: CardName.Ace, faceValue: 1, playValue: 14 },
      { suit: Suit.Clubs, name: CardName.Queen, faceValue: 12, playValue: 12 },
      { suit: Suit.Clubs, name: CardName.Seven, faceValue: 7, playValue: 7 },
    ],
  },
  {
    playerId: 'mockUser3',
    hand: [
      { suit: Suit.Hearts, name: CardName.Nine, faceValue: 9, playValue: 9 },
      { suit: Suit.Spades, name: CardName.Ace, faceValue: 1, playValue: 14 },
      { suit: Suit.Spades, name: CardName.King, faceValue: 13, playValue: 13 },
      { suit: Suit.Spades, name: CardName.Ten, faceValue: 10, playValue: 10 },
      { suit: Suit.Spades, name: CardName.Three, faceValue: 3, playValue: 3 },
      { suit: Suit.Diamonds, name: CardName.Jack, faceValue: 11, playValue: 11 },
      { suit: Suit.Diamonds, name: CardName.Ten, faceValue: 10, playValue: 10 },
      { suit: Suit.Clubs, name: CardName.Nine, faceValue: 9, playValue: 9 },
    ],
  },
];

// BIDS
export const MOCK_VALID_BIDS = [
  { bidAmount: BidAmount.Pass, isTrump: null },
  { bidAmount: BidAmount.Seven, isTrump: true },
  { bidAmount: BidAmount.Seven, isTrump: false },
  { bidAmount: BidAmount.Eight, isTrump: true },
  { bidAmount: BidAmount.Eight, isTrump: false },
  { bidAmount: BidAmount.Nine, isTrump: true },
  { bidAmount: BidAmount.Nine, isTrump: false },
  { bidAmount: BidAmount.Ten, isTrump: true },
  { bidAmount: BidAmount.Ten, isTrump: false },
  { bidAmount: BidAmount.Eleven, isTrump: true },
  { bidAmount: BidAmount.Eleven, isTrump: false },
  { bidAmount: BidAmount.Twelve, isTrump: true },
  { bidAmount: BidAmount.Twelve, isTrump: false },
  { bidAmount: BidAmount.Troika, isTrump: false },
  { bidAmount: BidAmount.Kaiser, isTrump: false },
];

export const MOCK_PLAYER_BIDS: PlayerBid[] = [
  {
    bidAmount: 7,
    bidder: {
      playerId: 'mockUser1',
      playerIndex: 1,
    },
    isTrump: true,
  },
  {
    bidAmount: 7,
    bidder: {
      playerId: 'mockUser2',
      playerIndex: 2,
    },
    isTrump: false,
  },
  {
    bidAmount: 8,
    bidder: {
      playerId: 'mockUser3',
      playerIndex: 3,
    },
    isTrump: true,
  },
  {
    bidAmount: 8,
    bidder: {
      playerId: 'mockUser0',
      playerIndex: 0,
    },
    isTrump: true,
  },
];

export const MOCK_WINNING_BID: PlayerBid = {
  bidAmount: 8,
  bidder: {
    playerId: 'mockUser0',
    playerIndex: 0,
  },
  isTrump: true,
};

// TRICKS
export const MOCK_TRICK_0: TrickType = [
  {
    cardPlayed: { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 },
    playedBy: 'mockUser0',
    playerIndex: 0,
  },
  {
    cardPlayed: { suit: Suit.Spades, name: CardName.King, faceValue: 13, playValue: 13 },
    playedBy: 'mockUser1',
    playerIndex: 1,
  },
  {
    cardPlayed: { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 },
    playedBy: 'mockUser2',
    playerIndex: 2,
  },
  {
    cardPlayed: { suit: Suit.Diamonds, name: CardName.Eight, faceValue: 8, playValue: 8 },
    playedBy: 'mockUser3',
    playerIndex: 3,
  },
];

// ROUND SUMMARIES

export const MOCK_ROUND_SUMMARY: RoundSummary = {
  roundIndex: 1,
  winningBid: { bidAmount: 8, bidder: { playerId: 'mockUser0', playerIndex: 0 }, isTrump: true },
  isBidMade: true,
  trump: Suit.Hearts,
  teamPoints: [
    { teamId: 'team0', points: 9 },
    { teamId: 'team1', points: 1 },
  ],
  playerStats: [
    {
      playerId: 'mockUser0',
      bidStats: {
        bidAmount: BidAmount.Eight,
        isTrump: true,
        winningBidder: true,
        biddingTeam: true,
        wonRound: true,
      },
      trickStats: {
        points: 9,
        tricksTaken: 0,
        fiveTaken: false,
        threeTaken: false,
      },
    },
    {
      playerId: 'mockUser1',
      bidStats: {
        bidAmount: BidAmount.Seven,
        isTrump: true,
        winningBidder: false,
        biddingTeam: false,
        wonRound: false,
      },
      trickStats: {
        points: 1,
        tricksTaken: 0,
        fiveTaken: false,
        threeTaken: false,
      },
    },
    {
      playerId: 'mockUser2',
      bidStats: {
        bidAmount: BidAmount.Seven,
        isTrump: false,
        winningBidder: false,
        biddingTeam: true,
        wonRound: true,
      },
      trickStats: {
        points: 0,
        tricksTaken: 0,
        fiveTaken: false,
        threeTaken: false,
      },
    },
    {
      playerId: 'mockUser3',
      bidStats: {
        bidAmount: BidAmount.Eight,
        isTrump: true,
        winningBidder: false,
        biddingTeam: false,
        wonRound: false,
      },
      trickStats: {
        points: 0,
        tricksTaken: 0,
        fiveTaken: false,
        threeTaken: false,
      },
    },
  ],
};

export const MOCK_TEAM_SCORES: TeamType[] = [
  { teamId: 'team0', teamMembers: ['mockUser0', 'mockUser2'], teamScore: 9 },
  { teamId: 'team1', teamMembers: ['mockUser1', 'mockUser3'], teamScore: 1 },
];

// JSON

export const MOCK_INIT_GAME_JSON = {
  gameId: 'gameId12345',
  config: { numPlayers: 4, minBid: 7, scoreToWin: 52 },
  owner: { id: 'mockUser0', name: 'Ryan' },
  players: [
    {
      playerId: 'mockUser0',
      name: 'Ryan',
      teamId: 'team0',
      playerIndex: 0,
    },
    { playerId: null, name: null, teamId: 'team1', playerIndex: 1 },
    { playerId: null, name: null, teamId: 'team0', playerIndex: 2 },
    { playerId: null, name: null, teamId: 'team1', playerIndex: 3 },
  ],
  teams: [
    { teamId: 'team0', teamMembers: ['mockUser0'], teamScore: 0 },
    { teamId: 'team1', teamMembers: [], teamScore: 0 },
  ],
  dealerIndex: null,
  round: null,
  roundSummaries: [],
  version: '1.0.0' as GameVersion,
};

export const MOCK_TRICK_1_JSON = {
  gameId: 'gameId12345',
  config: { numPlayers: 4, minBid: 7, scoreToWin: 52 },
  owner: { id: 'mockUser0', name: 'Ryan' },
  players: [
    {
      playerId: 'mockUser0',
      name: 'Ryan',
      teamId: 'team0',
      playerIndex: 0,
    },
    {
      playerId: 'mockUser1',
      name: 'Cody',
      teamId: 'team1',
      playerIndex: 1,
    },
    {
      playerId: 'mockUser2',
      name: 'Stacey',
      teamId: 'team0',
      playerIndex: 2,
    },
    {
      playerId: 'mockUser3',
      name: 'Paul',
      teamId: 'team1',
      playerIndex: 3,
    },
  ],
  teams: [
    { teamId: 'team0', teamMembers: ['mockUser0', 'mockUser2'], teamScore: 0 },
    { teamId: 'team1', teamMembers: ['mockUser1', 'mockUser3'], teamScore: 0 },
  ],
  dealerIndex: 0,
  round: {
    roundIndex: 1,
    players: [
      {
        playerId: 'mockUser0',
        name: 'Ryan',
        teamId: 'team0',
        playerIndex: 0,
      },
      {
        playerId: 'mockUser1',
        name: 'Cody',
        teamId: 'team1',
        playerIndex: 1,
      },
      {
        playerId: 'mockUser2',
        name: 'Stacey',
        teamId: 'team0',
        playerIndex: 2,
      },
      {
        playerId: 'mockUser3',
        name: 'Paul',
        teamId: 'team1',
        playerIndex: 3,
      },
    ],
    numPlayers: 4,
    dealerIndex: 0,
    hands: [
      {
        playerId: 'mockUser0',
        hand: [
          { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 },
          { suit: Suit.Hearts, name: CardName.Ten, faceValue: 10, playValue: 10 },
          { suit: Suit.Hearts, name: CardName.Eight, faceValue: 8, playValue: 8 },
          { suit: Suit.Spades, name: CardName.Nine, faceValue: 9, playValue: 9 },
          { suit: Suit.Diamonds, name: CardName.Ace, faceValue: 1, playValue: 14 },
          { suit: Suit.Diamonds, name: CardName.King, faceValue: 13, playValue: 13 },
          { suit: Suit.Clubs, name: CardName.Eight, faceValue: 8, playValue: 8 },
        ],
      },
      {
        playerId: 'mockUser1',
        hand: [
          { suit: Suit.Hearts, name: CardName.Jack, faceValue: 11, playValue: 11 },
          { suit: Suit.Spades, name: CardName.Queen, faceValue: 12, playValue: 12 },
          { suit: Suit.Diamonds, name: CardName.Queen, faceValue: 12, playValue: 12 },
          { suit: Suit.Diamonds, name: CardName.Eight, faceValue: 8, playValue: 8 },
          { suit: Suit.Clubs, name: CardName.King, faceValue: 13, playValue: 13 },
          { suit: Suit.Clubs, name: CardName.Jack, faceValue: 11, playValue: 11 },
          { suit: Suit.Clubs, name: CardName.Ten, faceValue: 10, playValue: 10 },
        ],
      },
      {
        playerId: 'mockUser2',
        hand: [
          { suit: Suit.Spades, name: CardName.Jack, faceValue: 11, playValue: 11 },
          { suit: Suit.Spades, name: CardName.Eight, faceValue: 8, playValue: 8 },
          { suit: Suit.Diamonds, name: CardName.Nine, faceValue: 9, playValue: 9 },
          { suit: Suit.Diamonds, name: CardName.Seven, faceValue: 7, playValue: 7 },
          { suit: Suit.Clubs, name: CardName.Ace, faceValue: 1, playValue: 14 },
          { suit: Suit.Clubs, name: CardName.Queen, faceValue: 12, playValue: 12 },
          { suit: Suit.Clubs, name: CardName.Seven, faceValue: 7, playValue: 7 },
        ],
      },
      {
        playerId: 'mockUser3',
        hand: [
          { suit: Suit.Spades, name: CardName.Ace, faceValue: 1, playValue: 14 },
          { suit: Suit.Spades, name: CardName.King, faceValue: 13, playValue: 13 },
          { suit: Suit.Spades, name: CardName.Ten, faceValue: 10, playValue: 10 },
          { suit: Suit.Spades, name: CardName.Three, faceValue: 3, playValue: 3 },
          { suit: Suit.Diamonds, name: CardName.Jack, faceValue: 11, playValue: 11 },
          { suit: Suit.Diamonds, name: CardName.Ten, faceValue: 10, playValue: 10 },
          { suit: Suit.Clubs, name: CardName.Nine, faceValue: 9, playValue: 9 },
        ],
      },
    ],
    minBid: 7,
    bids: [
      {
        bidAmount: 7,
        bidder: {
          playerId: 'mockUser1',
          playerIndex: 1,
        },
        isTrump: true,
      },
      {
        bidAmount: 7,
        bidder: {
          playerId: 'mockUser2',
          playerIndex: 2,
        },
        isTrump: false,
      },
      {
        bidAmount: 8,
        bidder: {
          playerId: 'mockUser3',
          playerIndex: 3,
        },
        isTrump: true,
      },
      {
        bidAmount: 8,
        bidder: {
          playerId: 'mockUser0',
          playerIndex: 0,
        },
        isTrump: true,
      },
    ],
    winningBid: {
      bidAmount: 8,
      bidder: {
        playerId: 'mockUser0',
        playerIndex: 0,
      },
      isTrump: true,
    },
    trump: 'HEARTS' as Suit,
    activePlayerIndex: 0,
    playableCards: [
      { suit: Suit.Hearts, name: CardName.King, faceValue: 13, playValue: 13 },
      { suit: Suit.Hearts, name: CardName.Ten, faceValue: 10, playValue: 10 },
      { suit: Suit.Hearts, name: CardName.Eight, faceValue: 8, playValue: 8 },
      { suit: Suit.Spades, name: CardName.Nine, faceValue: 9, playValue: 9 },
      { suit: Suit.Diamonds, name: CardName.Ace, faceValue: 1, playValue: 14 },
      { suit: Suit.Diamonds, name: CardName.King, faceValue: 13, playValue: 13 },
      { suit: Suit.Clubs, name: CardName.Eight, faceValue: 8, playValue: 8 },
    ],
    trickIndex: 2,
    trick: [],
    teamTotals: [
      {
        teamId: 'team0',
        points: 6,
        tricks: [
          {
            trickIndex: 1,
            trick: [
              {
                cardPlayed: { suit: Suit.Hearts, name: CardName.Ace, faceValue: 1, playValue: 14 },
                playedBy: 'mockUser0',
                playerIndex: 0,
              },
              {
                cardPlayed: { suit: Suit.Hearts, name: CardName.Queen, faceValue: 12, playValue: 12 },
                playedBy: 'mockUser1',
                playerIndex: 1,
              },
              {
                cardPlayed: { suit: Suit.Hearts, name: CardName.Five, faceValue: 5, playValue: 5 },
                playedBy: 'mockUser2',
                playerIndex: 2,
              },
              {
                cardPlayed: { suit: Suit.Hearts, name: CardName.Nine, faceValue: 9, playValue: 9 },
                playedBy: 'mockUser3',
                playerIndex: 3,
              },
            ],
            pointValue: 6,
            takenBy: {
              playerId: 'mockUser0',
              name: 'Ryan',
              teamId: 'team0',
              playerIndex: 0,
            },
          },
        ],
      },
      { teamId: 'team1', points: 0, tricks: [] },
    ],
  },
  roundSummaries: [],
  version: '1.0.0' as GameVersion,
};

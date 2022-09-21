import type { Cards } from '../Cards/Cards';
import { Deck, Suit } from './Cards';
import { BidAmount, RoundPointTotals, RoundType } from './Round';

export interface GameType {
  gameId: GameId;
  owner: { id: string; name: string };
  config: GameConfig;
  players: PlayerType[];
  teams: TeamType[];
  scores: ScoreType[];
  dealer: Seat;
  cards: Cards;
  deck: Deck;
  curRound: RoundType | null;
  RoundSummaries: RoundSummary[];
}

export type GameId = string;

export type RoundSummary = {
  roundNum: number;
  winningBid: number;
  bidMade: boolean;
  trump: Suit | null;
  roundPoints: RoundPointTotals;
  roundTeams?: TeamType[];
};

// export interface RoundType {
//   playersRoundData: PlayerRoundData[];
//   numPlayers: number;
//   dealer: Seat;
//   deck: CardType[];
//   hands: Hand[];
//   minBid: BidAmount;
//   bids: BidType[];
//   winningBid: BidType;
//   trump: Suit | null;
//   activePlayer: Seat;
//   playableCards: CardType[];
//   curTrick: TrickType;
//   roundPoints: RoundPointTotals;
//   tricksTaken: EvaluatedTrick[];
// }

export type GameConfig = {
  numPlayers: number;
  minBid: BidAmount;
  scoreToWin: number;
  //bidOut: boolean;
  //kitty: boolean;
  //passCards: PassCards;
  //lowNo: boolean;
  //noBid62: boolean;
  //noAceFace53: boolean;
  //inviteOnly: boolean;
};

export type TeamType = {
  teamId: string;
  teamSeats: Seat[];
  teamMembers: PlayerId[];
  // teamScore: number;
};

export type Seat = number;

export type PlayerType = {
  playerId: PlayerId | null;
  name: string | null;
  teamId: string;
  seat: Seat;
};

export type PlayerId = string;

export type ScoreType = {
  teamId: string;
  teamScore: number;
};

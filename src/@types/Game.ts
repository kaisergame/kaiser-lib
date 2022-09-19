import type { Cards } from '../Cards/Cards';
import { Deck, Suit } from './Cards';
import { BidAmount, RoundPointTotals, RoundType } from './Round';

export interface GameType {
  gameId: GameId;
  owner: UserType;
  config: GameConfig;
  players: PlayerId[];
  teams: TeamType[];
  dealer: Seat;
  cards: Cards;
  deck: Deck;
  curRound: RoundType | null;
  prevRounds: PrevRoundData[];
}

export type GameId = string;

export type PrevRoundData = {
  roundNum: number;
  winningBid: number;
  trump: Suit | null;
  roundPoints: RoundPointTotals;
  roundTeams: TeamType[];
};

// export interface RoundType {
//   playersRoundData: PlayerRoundData[];
//   playerNum: number;
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
  numOfPlayers: PlayerNum;
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

export type PlayerNum = number;

export type TeamType = { teamId: number; teamMembers: PlayerType[]; score: number };

export type PlayerType = {
  playerId: PlayerId;
  userName: string;
  seat: Seat;
};

export type PlayerId = string;

export type UserType = {
  userId: string;
  userName: string;
};

export type Seat = number;

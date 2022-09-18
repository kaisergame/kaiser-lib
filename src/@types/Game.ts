import { Suit } from './Cards';
import { BidAmount, RoundPointTotals, RoundType } from './Round';

export interface GameType {
  gameId: GameId;
  owner: UserType;
  config: GameConfig;
  players: PlayerType[];
  teams: TeamData[];
  curRound: RoundType | null;
  prevRounds: PrevRoundData[];
}

export type GameId = string;

export type PrevRoundData = {
  roundNum: number;
  winningBid: number;
  trump: Suit | null;
  roundPoints: RoundPointTotals;
  roundTeams: TeamData[];
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

export type TeamData = { team: number; teamMembers: Seat[]; score: number };

export type PlayerType = {
  playerId: PlayerId;
  userName: UserName;
  seat: Seat;
  team: number;
};

export type PlayerId = UserId;

export type UserType = {
  userId: UserId;
  userName: UserName;
};

export type UserId = string;

export type UserName = string;

export type Seat = number;

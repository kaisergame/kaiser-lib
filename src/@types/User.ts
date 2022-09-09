export interface User {
  readonly userId: UserId;
  name: string;
  stats: UserStats;
  // inGame: string;
}

export type UserId = string;

export type UserStats = {
  gamesWon: number;
  gamesLost: number;
  bidsWon: number;
  ownBidsWon: number;
  bidsLost: number;
  ownBidsLost: number;
  getBidRatio: number;
  avgBid: number;
};

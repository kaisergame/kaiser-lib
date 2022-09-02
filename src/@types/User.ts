export interface User {
  readonly userId: UserId;
  name: string;
  email: string;
  password: string;
  stats: UserStats;
  gameID: string | null;
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

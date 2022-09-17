export interface UserType {
  readonly userId: UserId;
  userName: string;
  // stats: UserStats;
  // inGame: string;
}

export type UserId = string;

export type UserStatsType = {
  gamesWon: number;
  gamesLost: number;
  bidsWon: number;
  ownBidsWon: number;
  bidsLost: number;
  ownBidsLost: number;
  getBidRatio: number;
  avgBid: number;
};

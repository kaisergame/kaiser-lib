import { CardType, Suit } from './Cards';
import { PlayerType, Seat } from './Game';

export interface RoundType {
  playersRoundData: PlayerRoundData[];
  numPlayers: number;
  dealer: Seat;
  hands: Hand[];
  minBid: BidAmount;
  bids: BidType[];
  winningBid: BidType;
  trump: Suit | null;
  activePlayer: Seat;
  playableCards: CardType[];
  trick: TrickType;
  tricksTeam0: EvaluatedTrick[];
  tricksTeam1: EvaluatedTrick[];
  roundPoints: RoundPointTotals;
  dealHands(): Hand[];
  sortHands(lowToHigh?: 'lowToHigh'): void;
  validBids(): BidAmount[];
  setPlayerBid(bid: BidAmount): void;
  setWinningBid(): BidType;
  setTrump(trump: Suit): void;
  orderOfPlay(nextToPlay?: Seat): Seat;
  updateActivePlayer(makeActivePlayer?: number): Seat;
  setPlayableCards(hand: Hand): CardType[];
  playCard(cardPlayed: CardType): void;
  removeCardFromHand(cardPlayed: CardType): Hand;
  updateCardsPlayed(cardPlayed: CardType): TrickType;
  endPlayerTurn(): void;
  resetPlayableCards(): void;
  endTrick(): EvaluatedTrick;
  getTrickValue(): number;
  getTrickWinner(): Seat;
  updateRoundPoints(takenTrick: EvaluatedTrick, takenBy: PlayerType): void;
  evaluateRound(): RoundTotals;
  isBidMade(): EvaluatedBid;
  playerTrickTotals(): PlayerPointTotals;
}

export type Hand = CardType[];

export type PlayerRoundData = PlayerType & {
  // roundTeam?: number; // needed for 5 player?
  bid: BidAmount | null;
  // wonBid: boolean;
  // madeBid: boolean;
  isDealer: boolean;
};

export type BidType = {
  amount: BidAmount;
  bidder: Seat;
  isTrump: boolean;
};

export type EvaluatedBid = BidType & {
  bidMade: boolean;
};

export enum BidAmount {
  Pass = 0,
  Five = 5,
  FiveNo = 5.5,
  Six = 6,
  SixNo = 6.5,
  Seven = 7,
  SevenNo = 7.5,
  Eight = 8,
  EightNo = 8.5,
  Nine = 9,
  NineNo = 9.5,
  Ten = 10,
  TenNo = 10.5,
  Eleven = 11,
  ElevenNo = 11.5,
  Twelve = 12,
  TwelveNo = 12.5,
  Troika = 12.7,
  Kaiser = 12.9,
}

export type EvaluatedTrick = {
  cardsPlayed: TrickType;
  pointValue: number;
  trickWonBy: Seat;
};

export type TrickType = { cardPlayed: CardType; playedBy: Seat }[];

export type RoundTotals = {
  bid: EvaluatedBid;
  roundPoints: RoundPointTotals;
  playerPoints: PlayerPointTotals;
};

export type RoundPointTotals = { teamId: string; points: number }[];

export type PlayerPointTotals = { playerSeat: Seat; points: number }[];

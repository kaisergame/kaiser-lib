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
  roundStateToJson(): string;
  roundStateFromJson(jsonRoundState: string): void;
  // dealHands(): Hand[]; // private
  sortHands(lowToHigh?: 'lowToHigh'): void;
  validBids(): BidAmount[];
  setPlayerBid(bid: BidAmount): void;
  setWinningBid(): BidType; // private
  setTrump(trump: Suit): void; // private
  updateActivePlayer(makeActivePlayer?: number): Seat; // private
  setPlayableCards(hand: Hand): CardType[]; // private
  playCard(cardPlayed: CardType): void;
  removeCardFromHand(cardPlayed: CardType): Hand; // private
  updateCardsPlayed(cardPlayed: CardType): TrickType; // private
  endPlayerTurn(): void; // private
  // resetPlayableCards(): void; // private
  endTrick(): EvaluatedTrick; // private
  // getTrickValue(): number; // private
  // getTrickWinner(): Seat; // private
  // updateRoundPoints(takenTrick: EvaluatedTrick, takenBy: PlayerType): void; // private
  // resetTrick(): void; // private
  evaluateRound(): RoundTotals; // private
  // isBidMade(): EvaluatedBid; // private
  // playerTrickTotals(): PlayerPointTotals; // private
  endRound: (roundTotals: RoundTotals) => void;
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

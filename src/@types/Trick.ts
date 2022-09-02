import { CardType } from './Card';
import { PlayerType, Seat } from './Game';
import { Hand } from './Round';

export type TrickType = {
  players: PlayerType[];
  turnOrder: Seat[];
  hands: Hand[];
  activePlayer: PlayerType;
  playerTurn: PlayerTurn;
  cardsPlayed: CardType[];
  trickWinner: PlayerType | null;
  validateCardPlayed(card: CardType): boolean;
};

export type PlayerTurn = {
  turnNum: number;
  playableCards: CardType[];
  cardPlayed?: CardType;
};

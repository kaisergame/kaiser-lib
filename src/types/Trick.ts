import { Card } from './Card';
import { Player, Seat } from './Game';
import { Hand } from './Round';

export type Trick = {
  players: Player[];
  turnOrder: Seat[];
  hands: Hand[];
  activePlayer: Player;
  playerTurn: PlayerTurn;
  cardsPlayed: Card[];
  trickWinner: Player | null;
  validateCardPlayed(card: Card): boolean;
};

export type PlayerTurn = {
  turnNum: number;
  playableCards: Card[];
  cardPlayed?: Card;
};

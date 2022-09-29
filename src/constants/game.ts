import { Suit } from '../@types/index';

export const HAND_SIZE = 8;

export const SUITS_NUM = Object.keys(Suit).length;

export const CARDS_IN_DECK = 52;

export const CARDS_PER_SUIT = 13;

export const TRUMP_VALUE = 14;

export const TOTAL_TRICK_POINTS = HAND_SIZE + 5 - 3;

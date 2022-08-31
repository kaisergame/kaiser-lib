export enum Suit {
  Spades = "SPADES",
  Hearts = "HEARTS",
  Clubs = "CLUBS",
  Diamonds = "DIAMONDS"
}

export enum CardName {
  Ace = "ACE",
  One = "ONE",
  Two = "TWO",
  Three = "THREE",
  Four = "FOUR",
  Five = "FIVE",
  Six = "SIX",
  Seven = "SEVEN",
  Eight = "EIGHT",
  Nine = "NINE",
  Ten = "TEN",
  Jack = "JACK",
  Queen = "QUEEN",
  King = "KING",
}

export type Card = {
  suit: Suit;
  name: CardName;
  value: number;
}

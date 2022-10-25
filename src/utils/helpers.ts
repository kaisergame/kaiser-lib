import { PlayerType, PlayerId, Seat } from 'src/@types';

export const checkPlayerOrder = (players: PlayerType[]): boolean => {
  let inOrder = true;
  for (let i = 0; i < players.length; i++) {
    if (players[i].seat !== i) {
      inOrder = false;
      console.error(`Players are out of order. Player seat ${players[i].seat} is a position ${i}`);
    }
  }
  return inOrder;
};

export const findPlayerBySeat = (players: PlayerType[], seat: Seat): PlayerType => {
  const player = players.find((player) => player.seat === seat);
  if (!player || player.playerId === null) throw new Error('No player found');

  return player;
};

export const findPlayerById = (players: PlayerType[], id: PlayerId): PlayerType => {
  const player = players.find((player) => player.playerId === id);
  if (!player || player.playerId === null) throw new Error('No player found');

  return player;
};

export const validateSeat = (numSeat: Seat | undefined, numPlayers: number = 4): boolean => {
  return typeof numSeat === 'number' && numSeat < numPlayers && numSeat >= 0;
};

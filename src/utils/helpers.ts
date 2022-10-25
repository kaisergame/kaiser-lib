import { PlayerType, PlayerId, PlayerIndex } from 'src/@types';

export const checkPlayerOrder = (players: PlayerType[]): boolean => {
  let inOrder = true;
  for (let i = 0; i < players.length; i++) {
    if (players[i].playerIndex !== i) {
      inOrder = false;
      console.error(`Players are out of order. Player playerIndex ${players[i].playerIndex} is a position ${i}`);
    }
  }
  return inOrder;
};

export const findPlayerByPlayerIndex = (players: PlayerType[], playerIndex: PlayerIndex): PlayerType => {
  const player = players.find((player) => player.playerIndex === playerIndex);
  if (!player || player.playerId === null) throw new Error('No player found');

  return player;
};

export const findPlayerById = (players: PlayerType[], id: PlayerId): PlayerType => {
  const player = players.find((player) => player.playerId === id);
  if (!player || player.playerId === null) throw new Error('No player found');

  return player;
};

export const validatePlayerIndex = (playerIndex: PlayerIndex | undefined, numPlayers: number = 4): boolean => {
  return typeof playerIndex === 'number' && playerIndex < numPlayers && playerIndex >= 0;
};

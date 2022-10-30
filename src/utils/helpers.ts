import { PlayerId, PlayerIndex, PlayerType, TeamId, TeamType } from 'src/@types';

export const isPlayersSorted = (players: PlayerType[]): boolean => {
  let inOrder = true;
  for (let i = 0; i < players.length; i++) {
    if (players[i].playerIndex !== i) {
      inOrder = false;
      console.error(`Players are out of order. Player playerIndex ${players[i].playerIndex} is a position ${i}`);
    }
  }
  return inOrder;
};

export const validatePlayerIndex = (playerIndex: PlayerIndex | undefined, numPlayers: number = 4): boolean => {
  return typeof playerIndex === 'number' && playerIndex < numPlayers && playerIndex >= 0;
};

export const findPlayerByIndex = (players: PlayerType[], playerIndex: PlayerIndex): PlayerType => {
  if (!validatePlayerIndex(playerIndex)) throw new Error('Invalid index');
  const player = players.find((player) => player.playerIndex === playerIndex);
  if (!player) throw new Error('No player found');

  return player;
};

export const findPlayerById = (players: PlayerType[], id: PlayerId | null): PlayerType => {
  const player = players.find((player) => player.playerId === id);
  if (!player) throw new Error('No player found');

  return player;
};

export const findTeamById = (teams: TeamType[], id: TeamId): TeamType => {
  const team = teams.find((team) => team.teamId === id);
  if (!team) throw new Error('No team found');

  return team;
};

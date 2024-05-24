import Player from '../models/player_model';

export async function createPlayer(playerInfo) {
  const newPlayer = new Player();
  newPlayer.name = playerInfo.name;
  newPlayer.host = playerInfo.host;
  if (playerInfo.host) {
    newPlayer.active = true;
  } else {
    newPlayer.active = false;
  }
  newPlayer.points = 0;

  return newPlayer.save();
}

export async function getPlayerState(playerName) {
  const player = await Player.findOne({ name: playerName });

  if (!player) {
    throw new Error(`Player with name ${playerName} does not exist`);
  }

  const state =  {
    name: player.name,
    host: player.host,
    points: player.points,
    active: player.active,
  };

  return state;
}

 
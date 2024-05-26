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

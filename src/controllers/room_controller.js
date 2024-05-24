import Room, { RoomStates } from '../models/room_model';
import { createPlayer, getPlayerState } from './player_controller';

export async function createRoom(roomInitInfo) {
  const newRoom = new Room();
  newRoom.creator = await createPlayer(name: roomInitInfo.creator, host: true);
  newRoom.players = [roomInitInfo.creator];
  newRoom.ranking = [];
  newRoom.numQuestions = roomInitInfo.numQuestions
  newRoom.status = RoomStates.CLOSED;
  newRoom.roomKey = roomInitInfo.roomKey;

  return newRoom.save();
}

export async function joinRoom(roomId, playerInfo) {
  // playerInfo = host, name
  const room = await Room.findById(roomId);

  // make sure player's intended name does not already exist
  const newPlayerName = playerInfo.name;
  const existingPlayerNames = room.players.map(player => player.name);

  if (existingPlayerNames.includes(newPlayerName)) {
    throw new Error(`Player with your intended name (${newPlayerName}) already exists`);
  }

	if (room.status !== RoomStates.OPEN) {
    throw new Error(`This room is not open for joining in state ${room.status}`);
  }

  // username is free; add player to room
  newPlayer = await createPlayer(playerInfo); 
  room.players.push(newPlayer);
  return room.save();
}

export async function changeStatus(roomId, roomKey, status) {
  const room = await Room.findById(roomId);
  if (room.roomKey !== roomKey) {
    throw new Error('Room key is incorrect');
  }

  if (status in RoomStates) {
    room.status = status;
  } else {
    throw new Error(`Invalid status. Must be ${RoomStates.CLOSED}, ${RoomStates.OPEN}, ${RoomStates.IN_PROGRESS} or ${RoomStates.GAME_OVER}`);
  }

  return room.save();
}

// returns the main game state with each player's points, room status, and room id
export async function getState(roomId) {
  const room = await Room.findById(roomId);

  const state = {
    roomId,
    status: room.status,
    players: room.players.map(player => {await getPlayerState(player)}),
  };

  return state;
}

// Increment a player's points
export async function addPoints(roomId, player) {
  const room = await Room.findById(roomId);
  const playerNames = room.players.map(player => player.name);

  if (room.status !== 'IN_PROGRESS') {
    throw new Error('This game is not in progress. Can\'t submit now.');
  }

  if (!playerNames.includes(player)) {
    throw new Error(`Player (${player}) not in room`);
  }

  const updatedPlayer = await Player.findOneAndUpdate(
    { name: playerName },
    { $inc: { points: 1 } },
    { new: true } // To return the updated document
  );

  const numQuestions = room.numQuestions;
  if (updatedPlayer.points === numQuestions) {
    room.ranking.push(player);
  }

  // close room if all players have reached end
  if (room.ranking.length === room.players.length) {
    room.status = RoomStates.GAME_OVER;
  }

  await room.save();
  return newPoints;
}


import Room, { RoomStates } from '../models/room_model';
import { submit, getScores, countSubmissions } from './submission_controller';

export async function createRoom(roomInitInfo) {
  const newRoom = new Room();
  newRoom.creator = roomInitInfo.creator;
  newRoom.players = [roomInitInfo.creator];
  newRoom.ranking = [];
  newRoom.numQuestions = roomInitInfo.numQuestions
  newRoom.status = RoomStates.CLOSED;
  newRoom.player1Points = 0;
  newRoom.player2Points = 0;
  newRoom.player3Points = 0;
  newRoom.player4Points  = 0;
  newRoom.roomKey = roomInitInfo.roomKey;

  return newRoom.save();
}

export async function joinRoom(roomId, playerInfo) {
  const room = await Room.findById(roomId);

  // make sure player's intended name does not already exist
  const newPlayerName = playerInfo.name;
  const existingPlayers = room.players;

  if (existingPlayers.includes(newPlayerName)) {
    throw new Error(`Player with your intended name (${newPlayerName}) already exists`);
  }

	if (room.status !== RoomStates.OPEN) {
    throw new Error(`This room is not open for joining in state ${room.status}`);
  }

  // username is free; add player to room
  room.players.push(newPlayerName);
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
    players: room.players,
    player1Points: room.player1Points,
    player2Points: room.player2Points,
    player3Points: room.player3Points,
    player4Points: room.player4Points,
  };

  return state;
}

// Increment a player's points
export async function addPoints(roomId, player) {
  const room = await Room.findById(roomId);

  if (room.status !== 'IN_PROGRESS') {
    throw new Error('This game is not in progress. Can\'t submit now.');
  }

  if (!room.players.includes(player)) {
    throw new Error(`Player (${player}) not in room`);
  }

  // SO DUMB FIX THIS MAYBE???
  if player === room.players[0] {
    room.player1Points += 1;
    if room.player1Points === numQuestions {
      room.ranking.push(player);
    }
  }
  else if player === room.players[1] {
    room.player2Points += 1;
    if room.player1Points === numQuestions {
      room.ranking.push(player);
    }
  }
  else if player === room.players[2] {
    room.player3Points += 1;
    if room.player1Points === numQuestions {
      room.ranking.push(player);
    }
  }
  else {
    room.player4Points += 1;
    if room.player1Points === numQuestions {
      room.ranking.push(player);
    }
  }

  // close room if all players have reached end
  if (room.player1Points === numQuestions && room.player2Points === numQuestions 
    && room.player3Points === numQuestions && room.player4Points === numQuestions) {
    room.status = RoomStates.GAME_OVER;
  }

  await room.save();

  return newPoints;
}


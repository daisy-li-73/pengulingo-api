import Room, { RoomStates } from '../models/room_model';
import { createPlayer } from './player_controller';

const numRooms = 0;

export const roomCodes = {
  // Code and associated room ID
  '5L4Y': '',
  W1LD: '',
  W1NN: '',
  G0LD: '',
  S1LV: '',
  BR0N: '',
  PL4T: '',
  D14M: '',
  EM3R: '',
  RUBY: '',
};

function getRoomCode(codes, id) {
  // eslint-disable-next-line no-restricted-syntax
  for (const code in codes) {
    if (codes[code] === '') {
      codes[code] = id;
      return code;
    }
  }
  return null;
}

export async function createRoom(roomInitInfo) {
  // console.log('roomInitInfo: ', roomInitInfo.creator, roomInitInfo.numQuestions);
  if (numRooms >= 10) {
    throw new Error('Maximum number of rooms reached. Please try again later.');
  }

  try {
    // Create the creator player and get its ObjectId
    const creator = await createPlayer({ name: roomInitInfo.creator, host: true });

    // Create a new Room document with the creator and players fields as ObjectId references
    const newRoom = new Room({
      creator: creator._id,
      players: [creator._id],
      ranking: [],
      numQuestions: roomInitInfo.numQuestions,
      status: RoomStates.OPEN,
      roomKey: '',
    });
    await newRoom.save();

    // Generate a room code
    const roomCode = getRoomCode(roomCodes, newRoom._id);
    newRoom.roomKey = roomCode;
    return await newRoom.save();
  } catch (error) {
    // console.error('Error creating room:', error);
    throw new Error('Could not create room');
  }
}

export async function joinRoom(roomKey, playerInfo) {
  try {
    const roomId = roomCodes[roomKey];
    if (!roomId) {
      throw new Error('Invalid room code');
    }

    const room = await Room.findById(roomId).populate('players');

    if (!room) {
      throw new Error('Room not found');
    }

    if (room.status !== RoomStates.OPEN) {
      throw new Error(`This room is not open for joining in state ${room.status}`);
    }

    if (room.players.length < 4) {
      // Make sure player's intended name does not already exist
      const existingPlayerNames = room.players.map((player) => { console.log('existing name = ', player.name); return player.name; });

      if (existingPlayerNames.includes(playerInfo.name)) {
        throw new Error(`Player with your intended name (${playerInfo.name}) already exists`);
      }

      // Username is free; add player to room
      const newPlayer = await createPlayer({ name: playerInfo.name, host: false });
      room.players.push(newPlayer._id); // Push the ObjectId of the new player

      await room.save();
    } else {
      throw new Error('Room is full');
    }

    const updatedRoom = await Room.findById(roomId).populate('players');
    return updatedRoom;
  } catch (error) {
    console.error('Error joining room:', error);
    throw new Error('Could not join room');
  }
}

export async function changeStatus(roomId, status) {
  const room = await Room.findById(roomId).populate('players');
  console.log('received status ', status);

  if (!room) {
    throw new Error('Room not found');
  }

  if (status in RoomStates) {
    room.status = status;
  } else {
    throw new Error(`Invalid status. Must be ${RoomStates.CLOSED}, ${RoomStates.OPEN}, ${RoomStates.IN_PROGRESS}, ${RoomStates.GAME_OVER}, or ${RoomStates.QUIT}`);
  }

  if (status === RoomStates.OPEN || status === RoomStates.CLOSED) { // Reset a game
    room.players.forEach(async (player) => {
      player.points = 0;
      await player.save();
    });
    room.ranking = [];
  }

  // if (status === RoomStates.IN_PROGRESS) { // Start a game
  //   room.players.forEach((player) => {
  //     if (player.active === false) {
  //       throw new Error('Cannot start game with inactive players');
  //     }
  //   });
  // }

  if (status === RoomStates.OPEN && room.ranking.length === room.numQuestions) { // Finished a game, back to choosing a game
    // Cleanup
    room.players.forEach(async (player) => {
      player.active = false;
      await player.save();
    });
    room.ranking = [];
  }

  if (status === RoomStates.QUIT) { // Finished a game, room can be deleted, roomCode can be reused
    await room.deleteOne();
    roomCodes[room.roomKey] = '';
    return;
  }

  await room.save();
  // eslint-disable-next-line consistent-return
  return room;
}

// returns the main game state with each player's points, room status, and room id
export async function getState(roomId) {
  const room = await Room.findById(roomId).populate('players');
  if (!room) {
    throw new Error('Room not found');
  }

  const state = {
    roomId: room._id,
    status: room.status,
    players: room.players,
    roomKey: room.roomKey,
    numQuestions: room.numQuestions,
    ranking: room.ranking,
  };

  return state;
}

// Increment a player's points
export async function addPoints(roomId, playerName) {
  console.log('add points: ', roomId, playerName);
  const room = await Room.findById(roomId).populate('players');
  if (!room) {
    throw new Error('Room not found');
  }

  // if (room.status !== 'IN_PROGRESS') {
  //   throw new Error('This game is not in progress. Can\'t submit now.');
  // }

  const player = room.players.find((pl) => { return pl.name === playerName; });
  if (!player) {
    throw new Error(`Player (${playerName}) not in room`);
  }

  // Update the points of the found player
  if (player.points === room.numQuestions) {
    throw new Error(`Player (${playerName}) has already reached the end`);
  }

  player.points += 1;
  await player.save();

  const { numQuestions } = room;
  if (player.points === numQuestions) {
    room.ranking.push(playerName);
  }

  // Close room if all players have reached end
  if (room.ranking.length === room.players.length) {
    room.status = RoomStates.GAME_OVER;
  }

  await room.save();
  return player;
}

// Reset a player's points (if they get a question wrong)
export async function resetPoints(roomId, playerName) {
  const room = await Room.findById(roomId).populate('players');
  if (!room) {
    throw new Error('Room not found');
  }

  // if (room.status !== 'IN_PROGRESS') {
  //   throw new Error('This game is not in progress. Can\'t submit now.');
  // }

  const player = room.players.find((pl) => { return pl.name === playerName; });
  if (!player) {
    throw new Error(`Player (${playerName}) not in room`);
  }

  player.points = 0;
  await player.save();
  return player;
}

export async function updatePlayerStatus(roomId, playerName, active) {
  const room = await Room.findById(roomId).populate('players');

  if (!room) {
    throw new Error('Room not found');
  }

  const player = room.players.find((pl) => { return pl.name === playerName; });
  if (!player) {
    throw new Error(`Player (${playerName}) not in room`);
  }

  // Update the active status of the found player
  player.active = active;
  await player.save();

  return player;
}

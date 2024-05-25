import Room, { RoomStates } from '../models/room_model';
import { createPlayer, getPlayerState } from './player_controller';

export async function createRoom(roomInitInfo) {
  try {
    // Create the creator player and get its ObjectId
    const creator = await createPlayer({ name: roomInitInfo.creator, host: true });

    // Create a new Room document with the creator and players fields as ObjectId references
    const newRoom = new Room({
      creator: creator._id,
      players: [creator._id],
      ranking: [],
      numQuestions: roomInitInfo.numQuestions,
      status: RoomStates.CLOSED,
      roomKey: roomInitInfo.roomKey,
    });

    return await newRoom.save();
  } catch (error) {
    console.error('Error creating room:', error);
    throw new Error('Could not create room');
  }
}

export async function joinRoom(roomId, playerInfo) {
  try {
    const room = await Room.findById(roomId).populate('players');

    if (!room) {
      throw new Error('Room not found');
    }

    // Make sure player's intended name does not already exist
    const newPlayerName = playerInfo.name;
    const existingPlayerNames = room.players.map(player => player.name);

    if (existingPlayerNames.includes(newPlayerName)) {
      throw new Error(`Player with your intended name (${newPlayerName}) already exists`);
    }

    if (room.status !== RoomStates.OPEN) {
      throw new Error(`This room is not open for joining in state ${room.status}`);
    }

    // Username is free; add player to room
    const newPlayer = await createPlayer(playerInfo);
    room.players.push(newPlayer._id); // Push the ObjectId of the new player

    await room.save();

    const updatedRoom = await Room.findById(roomId).populate('players');
    return updatedRoom;
  } catch (error) {
    console.error('Error joining room:', error);
    throw new Error('Could not join room');
  }
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
  try {
    const room = await Room.findById(roomId).populate('players');
    if (!room) {
      throw new Error('Room not found');
    }

    const state = {
      roomId: room._id,
      status: room.status,
      players: room.players,
    };

    return state;
  } catch (error) {
    console.error('Error getting state:', error);
    throw new Error('Could not get room state');
  }
}

// Increment a player's points
export async function addPoints(roomId, playerName) {
  try {
    const room = await Room.findById(roomId).populate('players');
    if (!room) {
      throw new Error('Room not found');
    }
    const playerNames = room.players.map(player => player.name);

    if (room.status !== 'IN_PROGRESS') {
      throw new Error('This game is not in progress. Can\'t submit now.');
    }

    if (!playerNames.includes(playerName)) {
      throw new Error(`Player (${playerName}) not in room`);
    }

    const updatedPlayer = await Player.findOneAndUpdate(
      { name: playerName },
      { $inc: { points: 1 } },
      { new: true } // To return the updated document
    );

    const numQuestions = room.numQuestions;
    if (updatedPlayer.points === numQuestions) {
      room.ranking.push(playerName);
    }

    // Close room if all players have reached end
    if (room.ranking.length === room.players.length) {
      room.status = RoomStates.GAME_OVER;
    }

    await room.save();
    return updatedPlayer;
  } catch (error) {
    console.error('Error adding points:', error);
    throw new Error('Could not add points');
  }
}

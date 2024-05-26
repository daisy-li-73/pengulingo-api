import mongoose, { Schema } from 'mongoose';
import Player from './player_model';

export const RoomStates = {
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED',
  GAME_OVER: 'GAME_OVER',
  OPEN: 'OPEN',
  QUIT: 'QUIT',
};

const RoomSchema = new Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }], 
  numQuestions: Number,
  roomKey: String,
  status: { type: String, enum: RoomStates, default: RoomStates.CLOSED },
  ranking: [String],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

const RoomModel = mongoose.model('Room', RoomSchema);

export default RoomModel;
import mongoose, { Schema } from 'mongoose';

export const RoomStates = {
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED',
  GAME_OVER: 'GAME_OVER',
  OPEN: 'OPEN',
};

const RoomSchema = new Schema({
  creator: String,
  numQuestions: Number,
  players: [String],
  roomKey: String,
  status: { type: String, enum: RoomStates, default: RoomStates.CLOSED },
  player1Points: Number,
  player2Points: Number,
  player3Points: Number,
  player4Points: Number,
  ranking: [String],
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

const RoomModel = mongoose.model('Room', RoomSchema);

export default RoomModel;
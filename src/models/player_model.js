import mongoose, { Schema } from 'mongoose';

const PlayerSchema = new Schema({
  name: String,
  active: Boolean,
  host: Boolean,
  points: Number,
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

const PlayerModel = mongoose.model('Player', PlayerSchema);

export default PlayerModel;

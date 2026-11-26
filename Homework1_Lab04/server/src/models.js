import mongoose from 'mongoose';

const { Schema, Types } = mongoose;

/** left = Bỏ qua, right = Thích, up = Siêu thích. Xem shared/swipe-api-contract.md. */
export const DIRECTIONS = Object.freeze(['left', 'right', 'up']);

const profileSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 40 },
  age: { type: Number, required: true, min: 18, max: 99 },
  gender: { type: String, required: true, enum: ['male', 'female'] },
  bio: { type: String, default: '', trim: true, maxlength: 140 },
});

// Ván dở = Game có createdAt mới nhất.
const gameSchema = new Schema({}, { timestamps: true });

const swipeSchema = new Schema(
  {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    profileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: true },
    direction: { type: String, required: true, enum: DIRECTIONS },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
// Một hồ sơ chỉ quẹt một lần trong một ván; trùng thì MongoDB báo lỗi 11000 (→ 409).
swipeSchema.index({ gameId: 1, profileId: 1 }, { unique: true });

export const Profile = mongoose.model('Profile', profileSchema);
export const Game = mongoose.model('Game', gameSchema);
export const Swipe = mongoose.model('Swipe', swipeSchema);

/**
 * Document `.lean()` sang JSON của contract: _id → id, ObjectId → chuỗi, Date → ISO; bỏ __v, updatedAt.
 * @param {Record<string, unknown>} doc
 */
export function toDto(doc) {
  const { _id, __v, updatedAt, ...rest } = doc; // eslint-disable-line no-unused-vars
  const dto = { id: String(_id) };
  for (const [key, value] of Object.entries(rest)) {
    if (value instanceof Types.ObjectId) dto[key] = String(value);
    else if (value instanceof Date) dto[key] = value.toISOString();
    else dto[key] = value;
  }
  return dto;
}

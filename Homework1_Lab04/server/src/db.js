import mongoose from 'mongoose';

/**
 * Nối MongoDB. Mongoose 8: không truyền useNewUrlParser/useUnifiedTopology (đã bỏ).
 * @param {string | undefined} uri lấy từ process.env, không bao giờ viết cứng trong mã
 */
export async function connectDb(uri) {
  if (!uri) throw new Error('MONGODB_URI missing');
  await mongoose.connect(uri);
}

export async function disconnectDb() {
  await mongoose.disconnect();
}

import { afterAll, beforeAll, beforeEach } from 'vitest';
import { connectDb, disconnectDb } from '../db.js';
import { Game, Profile, Swipe } from '../models.js';

const MODELS = [Profile, Game, Swipe];

/** Nối DB test (MONGODB_URI_TEST), dựng index, dọn dữ liệu trước mỗi test. Gọi ở đầu file test. */
export function useTestDb() {
  beforeAll(async () => {
    await connectDb(process.env.MONGODB_URI_TEST);
    await Promise.all(MODELS.map((model) => model.syncIndexes()));
  });
  beforeEach(async () => {
    await Promise.all(MODELS.map((model) => model.deleteMany({})));
  });
  afterAll(async () => {
    await disconnectDb();
  });
}

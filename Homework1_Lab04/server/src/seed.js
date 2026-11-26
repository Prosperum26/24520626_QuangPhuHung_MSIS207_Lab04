import { pathToFileURL } from 'node:url';
import { connectDb, disconnectDb } from './db.js';
import { Profile } from './models.js';

/** 12 hồ sơ hư cấu (6 nam, 6 nữ). Thứ tự ở đây = thứ tự thẻ trong deck. */
export const SEED_PROFILES = Object.freeze([
  { name: 'Linh', age: 21, gender: 'female', bio: 'Thích cà phê muối, ghét nhắn tin trước.' },
  { name: 'Minh', age: 23, gender: 'male', bio: 'Đi làm 9 tiếng, rep tin nhắn sau 3 ngày.' },
  { name: 'Trang', age: 22, gender: 'female', bio: 'Seen là đã đọc, rep là chuyện khác.' },
  { name: 'Khoa', age: 24, gender: 'male', bio: 'Rủ đi chơi lúc 11 giờ đêm, hủy lúc 10 giờ 59.' },
  { name: 'Ngọc', age: 20, gender: 'female', bio: 'Story đăng mỗi ngày, tin nhắn thì không.' },
  { name: 'Huy', age: 25, gender: 'male', bio: 'Gửi meme thay cho lời nói thật lòng.' },
  { name: 'Thảo', age: 23, gender: 'female', bio: 'Bận lắm, nhưng vẫn thả tim story của người cũ.' },
  { name: 'Long', age: 22, gender: 'male', bio: 'Chơi game tới sáng, hỏi gì cũng bảo "để xem".' },
  { name: 'Mai', age: 24, gender: 'female', bio: 'Mình không thích danh xưng, cứ vui là được.' },
  { name: 'Phát', age: 26, gender: 'male', bio: 'Đã đọc 14:02. Đang soạn tin... từ hôm qua.' },
  { name: 'Vy', age: 21, gender: 'female', bio: 'Nói chuyện hợp, nhưng chỉ hợp lúc buồn.' },
  { name: 'Tùng', age: 23, gender: 'male', bio: 'Hẹn cà phê cuối tuần, cuối tuần nào thì chưa biết.' },
]);

/**
 * Xoá rồi nạp lại bảng profiles. Không đụng tới games và swipes.
 * @returns {Promise<number>} số hồ sơ đã nạp
 */
export async function seedProfiles() {
  await Profile.deleteMany({});
  const docs = await Profile.insertMany(SEED_PROFILES);
  return docs.length;
}

// Chạy trực tiếp: npm run seed (đọc MONGODB_URI từ Homework1_Lab04/.env).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await connectDb(process.env.MONGODB_URI);
    const count = await seedProfiles();
    console.log(`Seeded ${count} profiles`);
  } finally {
    await disconnectDb();
  }
}

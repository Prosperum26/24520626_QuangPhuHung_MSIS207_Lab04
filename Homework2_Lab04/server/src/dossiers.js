/**
 * Dữ kiện hồ sơ, chỉ lấy từ báo chí (xem sources). Không có lời phát biểu nào được dựng thêm.
 * appealDeadline và appeal do store gắn vào.
 */

const SOURCES = Object.freeze([
  {
    title: 'Tuổi Trẻ News: Himass, TanVuu handed lifetime bans as ruling sparks backlash',
    url: 'https://news.tuoitre.vn/vietnamese-pubg-stars-himass-tanvuu-handed-lifetime-bans-as-ruling-sparks-backlash-103260924100621514.htm',
  },
  {
    title: 'Thể Thao Văn Hóa: Toàn cảnh vụ Himass và TanVuu bị cấm thi đấu PUBG vĩnh viễn',
    url: 'https://thethaovanhoa.vn/toan-canh-vu-himass-va-tanvuu-bi-cam-thi-dau-pubg-vinh-vien-tranh-cai-tu-giai-giao-huu-toi-lan-song-xoa-game-20260923205622061.htm',
  },
  {
    title: 'VnExpress: Himass và TanVuu bị ban khỏi toàn bộ giải đấu PUBG toàn cầu',
    url: 'https://vnexpress.net/chinh-thuc-himass-va-tanvuu-bi-ban-khoi-toan-bo-giai-dau-pubg-toan-cau-cong-dong-viet-nam-dong-loat-xoa-pubg-5123928.html',
  },
  {
    title: 'Sforum: Himass và TanVuu là ai?',
    url: 'https://cellphones.com.vn/sforum/himass-va-tanvuu-la-ai',
  },
]);

const SANCTION = Object.freeze({
  issuer: 'KRAFTON',
  issuedAt: '2026-09-23',
  kind: 'permanent',
  scope: 'PUBG: Battlegrounds và mọi giải đấu do KRAFTON cấp phép',
});

const ACCUSATION = 'Bị cáo buộc dùng thông tin ngoài trận (đá stream) tại giải giao hữu PUBG Asia Stars 2026';

const FACTORS = Object.freeze({ eventTier: 'exhibition', ruleExplicit: false, notified: false, priorOffenses: 0 });

export const SEED_DOSSIERS = Object.freeze([
  {
    id: 'himass',
    name: 'Himass',
    realName: 'Lã Phương Tiến Đạt',
    summary: 'Tuyển thủ PUBG Việt Nam, thành viên đội tuyển Việt Nam vô địch PUBG Nations Cup 2025.',
    accusation: ACCUSATION,
    sanction: SANCTION,
    factors: FACTORS,
    sources: SOURCES,
  },
  {
    id: 'tanvuu',
    name: 'TanVuu',
    realName: 'Trần Tấn Vũ',
    summary: 'Tuyển thủ PUBG Việt Nam, thành viên đội tuyển Việt Nam vô địch PUBG Nations Cup 2025.',
    accusation: ACCUSATION,
    sanction: SANCTION,
    factors: FACTORS,
    sources: SOURCES,
  },
]);

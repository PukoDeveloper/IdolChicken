/**
 * Chicken character repository.
 * Add a new entry here to register a new idol or NPC character.
 * All color values are 0xRRGGBB hex numbers used by PIXI.Graphics.
 */
export const CHICKENS = {
  director: {
    id: 'director',
    name: '雞翅事務所・所長',
    nickname: '雞長',
    bodyColor:  0xFFDD44,
    wingColor:  0xEECC33,
    combColor:  0xEE2222,
    beakColor:  0xFF8833,
    bowColor:   0xFF66AA,
    description: '雞翅事務所的所長，負責管理旗下所有偶像雞。',
  },
  xiaohuang: {
    id: 'xiaohuang',
    name: '小黃',
    nickname: '小黃',
    bodyColor:  0xFFEE55,
    wingColor:  0xFFDD22,
    combColor:  0xEE2222,
    beakColor:  0xFF8833,
    bowColor:   0xFF66AA,
    description: '陽光活潑的偶像雞，擅長高音。',
  },
  xiaohong: {
    id: 'xiaohong',
    name: '小紅',
    nickname: '小紅',
    bodyColor:  0xFF8888,
    wingColor:  0xFF6666,
    combColor:  0xCC1111,
    beakColor:  0xFF8833,
    bowColor:   0xCC3333,
    description: '熱情奔放的偶像雞，舞蹈擔當。',
  },
  xiaolan: {
    id: 'xiaolan',
    name: '小藍',
    nickname: '小藍',
    bodyColor:  0x88AAFF,
    wingColor:  0x6688EE,
    combColor:  0x4455CC,
    beakColor:  0xFF9944,
    bowColor:   0x4477FF,
    description: '冷靜知性的偶像雞，主唱擔當。',
  },
  xiaolv: {
    id: 'xiaolv',
    name: '小綠',
    nickname: '小綠',
    bodyColor:  0x88DD88,
    wingColor:  0x66CC66,
    combColor:  0x228822,
    beakColor:  0xFF8833,
    bowColor:   0x44AA44,
    description: '溫柔親切的偶像雞，吉祥物擔當。',
  },
  xiaocheng: {
    id: 'xiaocheng',
    name: '小橙',
    nickname: '小橙',
    bodyColor:  0xFFAA55,
    wingColor:  0xFF8833,
    combColor:  0xCC3300,
    beakColor:  0xFF6622,
    bowColor:   0xFF7722,
    description: '元氣滿滿的偶像雞，MC 擔當。',
  },
  xiaozi: {
    id: 'xiaozi',
    name: '小紫',
    nickname: '小紫',
    bodyColor:  0xCC88FF,
    wingColor:  0xAA66EE,
    combColor:  0x7733AA,
    beakColor:  0xFF8833,
    bowColor:   0x9933CC,
    description: '神秘優雅的偶像雞，表演擔當。',
  },
};

/**
 * Complete idol catalogue – all potential members the player can unlock.
 * This roster is the source of truth for `IdolManager.addIdol()` and for any
 * future "scouting" or "recruitment" features. Reorder or extend here to
 * change which idols are available in the game.
 */
export const IDOL_ROSTER = [
  CHICKENS.xiaohuang,
  CHICKENS.xiaohong,
  CHICKENS.xiaolan,
  CHICKENS.xiaolv,
  CHICKENS.xiaocheng,
  CHICKENS.xiaozi,
];

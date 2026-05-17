export const CARD_VALUES = [
  "A", "2", "3", "4", "5", "6", "7",
  "8", "9", "10", "J", "Q", "K",
];

export type CardValue = (typeof CARD_VALUES)[number];

export const CARD_DESCRIPTIONS: Record<string, string> = {
  A:   "คุณดื่มคนเดียว 1 อึก!",
  "2": "เลือกเพื่อนดื่มด้วย 1 คน!",
  "3": "เลือกเพื่อนดื่มด้วย 2 คน!",
  "4": "เพื่อนฝั่งซ้ายของคุณต้องดื่ม!",
  "5": "ชนแก้ว! ดื่มพร้อมกันทั้งวง!",
  "6": "เพื่อนฝั่งขวาของคุณต้องดื่ม!",
  "7": "เกมนับเลข! (คุณกำหนดเลข ห้ามพูดเลขนั้น/หารลงตัว/ลงท้าย)",
  "8": "บัตรผ่านเข้าห้องน้ำ 1 ครั้ง! (ต้องจำเอาเองว่าใครได้)",
  "9": "เกมหมวดหมู่! (คุณเริ่มตั้งหมวด ห้ามตอบซ้ำ)",
  "10":"โดนทาแป้งที่หน้า!",
  J:   "เกมทำท่าทาง! (คุณทำท่าแรก ใครทำตามช้าสุด ดื่ม!)",
  Q:   "ไพ่ใบ้กิน! (ห้ามใครพูดด้วย ใครเผลอพูดด้วยคนนั้นดื่ม)",
  K:   "พระราชา! (ตั้งกฎกติกาใหม่ 1 ข้อให้คนได้ K ใบต่อไปทำตาม)",
};

/** Card colour group for visual styling */
export function cardGroup(value: string): "drink" | "game" | "special" {
  if (["A", "2", "3", "4", "5", "6", "10"].includes(value)) return "drink";
  if (["7", "9", "J"].includes(value)) return "game";
  return "special"; // 8, Q, K
}

/** Fisher-Yates shuffle of a full 52-card deck */
export function createShuffledDeck(): string[] {
  const deck: string[] = [];
  for (let i = 0; i < 4; i++) {
    deck.push(...CARD_VALUES);
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

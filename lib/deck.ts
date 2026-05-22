export const CARD_VALUES = [
  "A", "2", "3", "4", "5", "6", "7",
  "8", "9", "10", "J", "Q", "K",
];

const SUITS = ["\u2660", "\u2665", "\u2666", "\u2663"] as const;

export type CardValue = (typeof CARD_VALUES)[number];

/** Extract the value part from a card string like "5\u2666" or "K\u2660" */
export function cardValue(card: string): string {
  return card.slice(0, -1);
}

/** Extract the suit character from a card string */
export function cardSuit(card: string): string {
  return card.slice(-1);
}

export const CARD_DESCRIPTIONS: Record<string, string> = {
  A:   "คุณดื่มคนเดียว 1 อึก!",
  "2": "เลือกเพื่อนดื่มด้วย 1 คน!",
  "3": "เลือกเพื่อนดื่มด้วย 2 คน!",
  "4": "เพื่อนฝั่งซ้ายของคุณต้องดื่ม!",
  "5": "ชนแก้ว! ดื่มพร้อมกันทั้งวง!",
  "6": "เพื่อนฝั่งขวาของคุณต้องดื่ม!",
  "7": "เกมนับเลข! (คุณกำหนดเลข ห้ามพูดเลขนั้น/หารลงตัว/ลงท้าย)",
  "8": "บัตรผ่านเข้าห้องน้ำ 1 ครั้ง!",
  "9": "เกมหมวดหมู่! (คุณเริ่มตั้งหมวด ห้ามตอบซ้ำ)",
  "10":"ทาแป้ง!",
  J:   "เกมทำท่าทาง! (คุณทำท่าแรก ใครทำตามช้าสุด ดื่ม!)",
  Q:   "เพื่อนไม่คบ! (ห้ามใครพูดด้วย ใครเผลอพูดด้วยคนนั้นดื่ม)",
  K:   "พระราชา! (ตั้งกฎกติกาใหม่ 1 ข้อให้คนได้ K ใบต่อไปทำตาม)",
};

/** Card colour group for visual styling */
export function cardGroup(card: string): "drink" | "game" | "special" {
  const v = cardValue(card);
  if (["A", "2", "3", "4", "5", "6", "10"].includes(v)) return "drink";
  if (["7", "9", "J"].includes(v)) return "game";
  return "special"; // 8, Q, K
}

/** Fisher-Yates shuffle of a full 52-card deck (value + suit) */
export function createShuffledDeck(): string[] {
  const deck: string[] = [];
  for (const suit of SUITS) {
    for (const value of CARD_VALUES) {
      deck.push(`${value}${suit}`);
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

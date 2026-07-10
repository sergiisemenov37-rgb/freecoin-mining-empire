/**
 * Cosmetic Store Types
 * Defines cosmetic items and store structure
 */

export enum CosmeticCategory {
  AVATAR = 'avatar',
  BACKGROUND = 'background',
  THEME = 'theme',
  EFFECT = 'effect',
  BADGE = 'badge',
}

export enum CosmeticRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum CosmeticCurrency {
  FREECOIN = 'freecoin',
  PREMIUM = 'premium',
  STARS = 'stars',
}

export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  category: CosmeticCategory;
  rarity: CosmeticRarity;
  price: number;
  currency: CosmeticCurrency;
  imageUrl: string;
  isLimited: boolean;
  limitedUntil?: string;
  isExclusive: boolean;
  requirements?: {
    level?: number;
    achievements?: string[];
  };
  stats?: {
    purchased: number;
    owned: number;
  };
}

export interface PlayerCosmetic {
  id: string;
  playerId: string;
  cosmeticId: string;
  equipped: boolean;
  purchasedAt: string;
}

export interface CosmeticStoreState {
  items: CosmeticItem[];
  playerInventory: PlayerCosmetic[];
  currency: Record<CosmeticCurrency, number>;
}

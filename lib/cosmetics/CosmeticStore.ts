/**
 * Cosmetic Store Service
 * Manages cosmetic items and purchases
 */

import { CosmeticItem, CosmeticCategory, CosmeticRarity, CosmeticCurrency, PlayerCosmetic } from './CosmeticTypes';

export class CosmeticStore {
  private static instance: CosmeticStore;
  private items: Map<string, CosmeticItem> = new Map();

  private constructor() {
    this.initializeDefaultItems();
  }

  static getInstance(): CosmeticStore {
    if (!CosmeticStore.instance) {
      CosmeticStore.instance = new CosmeticStore();
    }
    return CosmeticStore.instance;
  }

  private initializeDefaultItems(): void {
    // Default cosmetic items
    const defaultItems: CosmeticItem[] = [
      // Avatars
      {
        id: 'avatar_miner_basic',
        name: 'Basic Miner',
        description: 'A simple miner avatar',
        category: CosmeticCategory.AVATAR,
        rarity: CosmeticRarity.COMMON,
        price: 100,
        currency: CosmeticCurrency.FREECOIN,
        imageUrl: '/assets/cosmetics/avatars/miner_basic.png',
        isLimited: false,
        isExclusive: false,
        stats: { purchased: 0, owned: 0 },
      },
      {
        id: 'avatar_miner_gold',
        name: 'Gold Miner',
        description: 'A golden miner avatar',
        category: CosmeticCategory.AVATAR,
        rarity: CosmeticRarity.RARE,
        price: 500,
        currency: CosmeticCurrency.FREECOIN,
        imageUrl: '/assets/cosmetics/avatars/miner_gold.png',
        isLimited: false,
        isExclusive: false,
        stats: { purchased: 0, owned: 0 },
      },
      {
        id: 'avatar_miner_diamond',
        name: 'Diamond Miner',
        description: 'A diamond-encrusted miner avatar',
        category: CosmeticCategory.AVATAR,
        rarity: CosmeticRarity.LEGENDARY,
        price: 2000,
        currency: CosmeticCurrency.PREMIUM,
        imageUrl: '/assets/cosmetics/avatars/miner_diamond.png',
        isLimited: false,
        isExclusive: false,
        stats: { purchased: 0, owned: 0 },
      },
      // Backgrounds
      {
        id: 'bg_cave',
        name: 'Cave Background',
        description: 'A dark cave background',
        category: CosmeticCategory.BACKGROUND,
        rarity: CosmeticRarity.COMMON,
        price: 150,
        currency: CosmeticCurrency.FREECOIN,
        imageUrl: '/assets/cosmetics/backgrounds/cave.png',
        isLimited: false,
        isExclusive: false,
        stats: { purchased: 0, owned: 0 },
      },
      {
        id: 'bg_space',
        name: 'Space Background',
        description: 'A cosmic space background',
        category: CosmeticCategory.BACKGROUND,
        rarity: CosmeticRarity.EPIC,
        price: 1000,
        currency: CosmeticCurrency.FREECOIN,
        imageUrl: '/assets/cosmetics/backgrounds/space.png',
        isLimited: false,
        isExclusive: false,
        stats: { purchased: 0, owned: 0 },
      },
      // Themes
      {
        id: 'theme_neon',
        name: 'Neon Theme',
        description: 'A vibrant neon color theme',
        category: CosmeticCategory.THEME,
        rarity: CosmeticRarity.UNCOMMON,
        price: 300,
        currency: CosmeticCurrency.FREECOIN,
        imageUrl: '/assets/cosmetics/themes/neon.png',
        isLimited: false,
        isExclusive: false,
        stats: { purchased: 0, owned: 0 },
      },
      {
        id: 'theme_cyber',
        name: 'Cyber Theme',
        description: 'A futuristic cyberpunk theme',
        category: CosmeticCategory.THEME,
        rarity: CosmeticRarity.RARE,
        price: 800,
        currency: CosmeticCurrency.FREECOIN,
        imageUrl: '/assets/cosmetics/themes/cyber.png',
        isLimited: false,
        isExclusive: false,
        stats: { purchased: 0, owned: 0 },
      },
      // Badges
      {
        id: 'badge_early_adopter',
        name: 'Early Adopter',
        description: 'For players who joined early',
        category: CosmeticCategory.BADGE,
        rarity: CosmeticRarity.RARE,
        price: 0,
        currency: CosmeticCurrency.FREECOIN,
        imageUrl: '/assets/cosmetics/badges/early_adopter.png',
        isLimited: true,
        limitedUntil: '2025-12-31',
        isExclusive: true,
        requirements: { level: 1 },
        stats: { purchased: 0, owned: 0 },
      },
      {
        id: 'badge_whale',
        name: 'Whale',
        description: 'For big spenders',
        category: CosmeticCategory.BADGE,
        rarity: CosmeticRarity.LEGENDARY,
        price: 10000,
        currency: CosmeticCurrency.PREMIUM,
        imageUrl: '/assets/cosmetics/badges/whale.png',
        isLimited: false,
        isExclusive: false,
        stats: { purchased: 0, owned: 0 },
      },
    ];

    defaultItems.forEach(item => {
      this.items.set(item.id, item);
    });
  }

  getAllItems(): CosmeticItem[] {
    return Array.from(this.items.values());
  }

  getItemsByCategory(category: CosmeticCategory): CosmeticItem[] {
    return this.getAllItems().filter(item => item.category === category);
  }

  getItemsByRarity(rarity: CosmeticRarity): CosmeticItem[] {
    return this.getAllItems().filter(item => item.rarity === rarity);
  }

  getItemById(id: string): CosmeticItem | undefined {
    return this.items.get(id);
  }

  getLimitedItems(): CosmeticItem[] {
    return this.getAllItems().filter(item => item.isLimited);
  }

  getExclusiveItems(): CosmeticItem[] {
    return this.getAllItems().filter(item => item.isExclusive);
  }

  canAfford(item: CosmeticItem, playerCurrency: Record<CosmeticCurrency, number>): boolean {
    const balance = playerCurrency[item.currency] || 0;
    return balance >= item.price;
  }

  purchaseItem(itemId: string, playerCurrency: Record<CosmeticCurrency, number>): {
    success: boolean;
    item?: CosmeticItem;
    remainingCurrency?: Record<CosmeticCurrency, number>;
    error?: string;
  } {
    const item = this.getItemById(itemId);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    if (!this.canAfford(item, playerCurrency)) {
      return { success: false, error: 'Insufficient currency' };
    }

    const remainingCurrency = { ...playerCurrency };
    remainingCurrency[item.currency] -= item.price;

    return {
      success: true,
      item,
      remainingCurrency,
    };
  }
}

export const cosmeticStore = CosmeticStore.getInstance();

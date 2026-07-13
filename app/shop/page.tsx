'use client';

import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { cosmeticStore } from '@/lib/cosmetics/CosmeticStore';
import { CosmeticCategory, CosmeticRarity } from '@/lib/cosmetics/CosmeticTypes';
import { useState } from 'react';
import { AssetManager } from '@/lib/assets/AssetManager';

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<CosmeticCategory>(CosmeticCategory.AVATAR);
  const items = cosmeticStore.getItemsByCategory(selectedCategory);

  const categories = [
    { key: CosmeticCategory.AVATAR, label: 'Avatars' },
    { key: CosmeticCategory.BACKGROUND, label: 'Backgrounds' },
    { key: CosmeticCategory.THEME, label: 'Themes' },
    { key: CosmeticCategory.BADGE, label: 'Badges' },
  ];

  const getRarityColor = (rarity: CosmeticRarity) => {
    switch (rarity) {
      case CosmeticRarity.COMMON:
        return 'text-gray-400';
      case CosmeticRarity.UNCOMMON:
        return 'text-green-400';
      case CosmeticRarity.RARE:
        return 'text-blue-400';
      case CosmeticRarity.EPIC:
        return 'text-purple-400';
      case CosmeticRarity.LEGENDARY:
        return 'text-yellow-400';
    }
  };

  const getRarityBorder = (rarity: CosmeticRarity) => {
    switch (rarity) {
      case CosmeticRarity.COMMON:
        return 'border-gray-600';
      case CosmeticRarity.UNCOMMON:
        return 'border-green-600';
      case CosmeticRarity.RARE:
        return 'border-blue-600';
      case CosmeticRarity.EPIC:
        return 'border-purple-600';
      case CosmeticRarity.LEGENDARY:
        return 'border-yellow-600';
    }
  };

  return (
    <>
      <PageLayout title="Cosmetic Shop">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  variant={selectedCategory === cat.key ? 'primary' : 'secondary'}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <Card
              key={item.id}
              className={`border-2 ${getRarityBorder(item.rarity)} hover:scale-105 transition-transform flex flex-col`}
            >
              <CardContent className="p-3 flex-1 flex flex-col">
                <div className="aspect-square bg-gray-800 rounded-lg mb-2 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img src={AssetManager.buildings.FACTORY} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">{item.name}</h3>
                <p className={`text-xs ${getRarityColor(item.rarity)} capitalize mb-2`}>
                  {item.rarity}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-white text-sm font-bold">
                    {item.price} {item.currency}
                  </span>
                  <Button size="sm" variant="primary" className="text-xs">
                    Buy
                  </Button>
                </div>
                {item.isLimited && (
                  <p className="text-yellow-400 text-xs mt-2">Limited</p>
                )}
                {item.isExclusive && (
                  <p className="text-purple-400 text-xs mt-2">Exclusive</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {items.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">No items in this category yet.</p>
            </CardContent>
          </Card>
        )}
      </PageLayout>
      <BottomNavigation />
    </>
  );
}

'use client';

import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { cosmeticStore } from '@/lib/cosmetics/CosmeticStore';
import { CosmeticCategory, CosmeticRarity } from '@/lib/cosmetics/CosmeticTypes';
import { useState } from 'react';
import { AssetManager } from '@/lib/assets/AssetManager';
import { motion } from 'framer-motion';
import RarityBadge from '@/components/ui/RarityBadge';

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState<CosmeticCategory>(CosmeticCategory.AVATAR);
  const items = cosmeticStore.getItemsByCategory(selectedCategory);

  const categories = [
    { key: CosmeticCategory.AVATAR, label: 'Avatars' },
    { key: CosmeticCategory.BACKGROUND, label: 'Backgrounds' },
    { key: CosmeticCategory.THEME, label: 'Themes' },
    { key: CosmeticCategory.BADGE, label: 'Badges' },
  ];

  const getRarityGlow = (rarity: CosmeticRarity) => {
    switch (rarity) {
      case CosmeticRarity.COMMON:
        return 'shadow-gray-500/30';
      case CosmeticRarity.UNCOMMON:
        return 'shadow-green-500/50';
      case CosmeticRarity.RARE:
        return 'shadow-blue-500/50';
      case CosmeticRarity.EPIC:
        return 'shadow-purple-500/50';
      case CosmeticRarity.LEGENDARY:
        return 'shadow-yellow-500/50';
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
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                glow={false}
                className={`border-2 border-white/10 hover:border-cyan-500/50 transition-all flex flex-col ${getRarityGlow(item.rarity)}`}
              >
                <CardContent className="p-3 flex-1 flex flex-col">
                  <motion.div 
                    className="aspect-square bg-white/5 backdrop-blur rounded-lg mb-2 flex items-center justify-center flex-shrink-0 overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring' }}
                  >
                    <img src={AssetManager.buildings.FACTORY} alt={item.name} className="w-full h-full object-cover" />
                  </motion.div>
                  <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">{item.name}</h3>
                  <div className="mb-2">
                    <RarityBadge rarity={item.rarity as any}>{item.rarity}</RarityBadge>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-white text-sm font-bold">
                      {item.price} {item.currency}
                    </span>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="sm" variant="primary" className="text-xs">
                        Buy
                      </Button>
                    </motion.div>
                  </div>
                  {item.isLimited && (
                    <motion.p 
                      className="text-yellow-400 text-xs mt-2"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Limited
                    </motion.p>
                  )}
                  {item.isExclusive && (
                    <motion.p 
                      className="text-purple-400 text-xs mt-2"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Exclusive
                    </motion.p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
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

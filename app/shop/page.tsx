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
        {/* Category Tabs */}
        <motion.div 
          className="flex gap-2 mb-4 overflow-x-auto pb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {categories.map((cat, index) => (
            <motion.div
              key={cat.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                onClick={() => setSelectedCategory(cat.key)}
                variant={selectedCategory === cat.key ? 'primary' : 'secondary'}
                size="sm"
                className="whitespace-nowrap"
              >
                {cat.label}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className={`cyber-card flex flex-col ${getRarityGlow(item.rarity)}`}>
                <div className="p-3 flex-1 flex flex-col">
                  <motion.div 
                    className="aspect-square bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl mb-3 flex items-center justify-center flex-shrink-0 overflow-hidden border border-cyan-500/20"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: 'spring' }}
                  >
                    <motion.img
                      src={AssetManager.buildings.FACTORY}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </motion.div>
                  <motion.h3 
                    className="text-white font-bold text-sm mb-2 line-clamp-2"
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring' }}
                  >
                    {item.name}
                  </motion.h3>
                  <div className="mb-2">
                    <RarityBadge rarity={item.rarity as any}>{item.rarity}</RarityBadge>
                  </div>
                  <div className="flex items-center justify-between mt-auto gap-2">
                    <div className="flex items-center gap-1">
                      <motion.img
                        src={item.currency === 'freecoin' ? AssetManager.resources.FREECOIN : AssetManager.resources.PREMIUM_TOKEN}
                        alt=""
                        className="w-4 h-4"
                        animate={{ rotate: item.currency === 'freecoin' ? [0, 360] : [0, -360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      />
                      <motion.span 
                        className="text-white text-sm font-bold neon-text"
                        animate={{ 
                          textShadow: ['0 0 10px #00d4ff', '0 0 20px #00d4ff', '0 0 10px #00d4ff']
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {item.price}
                      </motion.span>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="sm" variant="primary" className="text-xs">
                        <img src={AssetManager.actions.buy} alt="" className="w-3 h-3 mr-1" />
                        Buy
                      </Button>
                    </motion.div>
                  </div>
                  {item.isLimited && (
                    <motion.div 
                      className="mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.p 
                        className="text-yellow-400 text-xs text-center"
                        animate={{ 
                          opacity: [0.5, 1, 0.5],
                          textShadow: ['0 0 5px #facc15', '0 0 15px #facc15', '0 0 5px #facc15']
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Limited
                      </motion.p>
                    </motion.div>
                  )}
                  {item.isExclusive && (
                    <motion.div 
                      className="mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.p 
                        className="text-purple-400 text-xs text-center"
                        animate={{ 
                          opacity: [0.5, 1, 0.5],
                          textShadow: ['0 0 5px #9d4edd', '0 0 15px #9d4edd', '0 0 5px #9d4edd']
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Exclusive
                      </motion.p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {items.length === 0 && (
          <motion.div 
            className="cyber-card p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.img
              src={AssetManager.status.loading}
              alt="No items"
              className="w-16 h-16 mx-auto mb-4"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <p className="text-gray-400">No items in this category yet.</p>
          </motion.div>
        )}
      </PageLayout>
      <BottomNavigation />
    </>
  );
}

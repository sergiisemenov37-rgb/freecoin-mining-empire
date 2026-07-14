'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AssetManager } from '@/lib/assets/AssetManager';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: <Image src={AssetManager.navigation.HOME} alt="Home" width={24} height={24} /> },
  { id: 'mining', label: 'Mining', path: '/mining', icon: <Image src={AssetManager.navigation.MINING} alt="Mining" width={24} height={24} /> },
  { id: 'tasks', label: 'Tasks', path: '/tasks', icon: <Image src={AssetManager.navigation.TASKS} alt="Tasks" width={24} height={24} /> },
  { id: 'friends', label: 'Friends', path: '/friends', icon: <Image src={AssetManager.navigation.FRIENDS} alt="Friends" width={24} height={24} /> },
  { id: 'shop', label: 'Shop', path: '/shop', icon: <Image src={AssetManager.navigation.SHOP} alt="Shop" width={24} height={24} /> },
  { id: 'profile', label: 'Profile', path: '/profile', icon: <Image src={AssetManager.navigation.PROFILE} alt="Profile" width={24} height={24} /> },
];

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-50"
    >
      <motion.div
        className="glass-panel px-2 py-3 rounded-2xl shadow-2xl shadow-cyan-500/20"
        animate={{
          boxShadow: ['0 0 20px rgba(0, 212, 255, 0.1)', '0 0 40px rgba(0, 212, 255, 0.2)', '0 0 20px rgba(0, 212, 255, 0.1)']
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.id} href={item.path}>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all relative ${
                    isActive
                      ? 'text-cyan-400'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-cyan-500/10 rounded-xl"
                      layoutId="activeTab"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      animate={{
                        boxShadow: ['0 0 10px rgba(0, 212, 255, 0.3)', '0 0 20px rgba(0, 212, 255, 0.5)', '0 0 10px rgba(0, 212, 255, 0.3)']
                      }}
                    />
                  )}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    {item.icon}
                  </motion.div>
                  <motion.span 
                    className="text-xs font-medium relative z-10"
                    animate={isActive ? {
                      textShadow: ['0 0 10px #00d4ff', '0 0 20px #00d4ff', '0 0 10px #00d4ff']
                    } : {}}
                  >
                    {item.label}
                  </motion.span>
                </motion.button>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </motion.nav>
  );
};

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Assets } from '@/lib/assets';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', path: '/', icon: <Image src={Assets.navigation.home} alt="Home" width={24} height={24} /> },
  { id: 'mining', label: 'Mining', path: '/mining', icon: <Image src={Assets.navigation.mining} alt="Mining" width={24} height={24} /> },
  { id: 'tasks', label: 'Tasks', path: '/tasks', icon: <Image src={Assets.navigation.tasks} alt="Tasks" width={24} height={24} /> },
  { id: 'friends', label: 'Friends', path: '/friends', icon: <Image src={Assets.navigation.friends} alt="Friends" width={24} height={24} /> },
  { id: 'profile', label: 'Profile', path: '/profile', icon: <Image src={Assets.navigation.profile} alt="Profile" width={24} height={24} /> },
];

export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 z-40 pb-safe"
    >
      <div className="flex items-center justify-around py-3 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.id} href={item.path}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {item.icon}
                </motion.div>
                <span className="text-xs font-medium">{item.label}</span>
              </motion.button>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

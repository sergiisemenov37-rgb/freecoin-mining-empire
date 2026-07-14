'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/hooks/useSession';
import { EmpireService } from '@/lib/supabase/services/empireService';
import { AssetManager } from '@/lib/assets/AssetManager';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

export default function Home() {
  const router = useRouter();
  const { session } = useSession();
  const [empire, setEmpire] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.player_id) return;

    const loadEmpire = async () => {
      try {
        setLoading(true);
        const empireData = await EmpireService.getEmpireByPlayerId(session.player_id);
        setEmpire(empireData);
      } catch (error) {
        console.error('Failed to load empire:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmpire();
  }, [session?.player_id]);

  const handleStartMining = () => {
    router.push('/mining');
  };

  return (
    <>
      <PageLayout>
        {/* Hero Banner */}
        <motion.div 
          className="glass-panel p-6 mb-6 relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10" />
          <div className="relative z-10 flex items-center gap-4">
            <motion.div
              className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring' }}
            >
              <img src={AssetManager.navigation.HOME} alt="Avatar" className="w-full h-full object-cover" />
            </motion.div>
            <div className="flex-1">
              <motion.h1 
                className="text-2xl font-bold text-white neon-text mb-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {session?.username || 'Miner'}
              </motion.h1>
              <motion.p 
                className="text-cyan-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Level <AnimatedCounter value={empire?.level || 1} />
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Resources */}
        <motion.div 
          className="grid grid-cols-3 gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="cyber-card p-3 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.img
              src={AssetManager.resources.FREECOIN}
              alt="Coins"
              className="w-10 h-10 mx-auto mb-2"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <motion.p 
              className="text-white font-bold text-lg neon-text"
              animate={{ 
                textShadow: ['0 0 10px #00d4ff', '0 0 20px #00d4ff', '0 0 10px #00d4ff']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AnimatedCounter value={0} />
            </motion.p>
            <p className="text-gray-400 text-xs">Coins</p>
          </motion.div>
          <motion.div 
            className="cyber-card p-3 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.img
              src={AssetManager.resources.PREMIUM_TOKEN}
              alt="Gems"
              className="w-10 h-10 mx-auto mb-2"
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            />
            <motion.p 
              className="text-white font-bold text-lg"
              animate={{ 
                textShadow: ['0 0 10px #9d4edd', '0 0 20px #9d4edd', '0 0 10px #9d4edd']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AnimatedCounter value={0} />
            </motion.p>
            <p className="text-gray-400 text-xs">Premium</p>
          </motion.div>
          <motion.div 
            className="cyber-card p-3 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.img
              src={AssetManager.resources.BATTERY}
              alt="Energy"
              className="w-10 h-10 mx-auto mb-2"
              animate={{ 
                scale: [1, 1.1, 1],
                filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.p 
              className="text-white font-bold text-lg"
              animate={{ 
                textShadow: ['0 0 10px #00ff88', '0 0 20px #00ff88', '0 0 10px #00ff88']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AnimatedCounter value={100} />
            </motion.p>
            <p className="text-gray-400 text-xs">Energy</p>
          </motion.div>
        </motion.div>

        {/* Production Rate */}
        <motion.div 
          className="cyber-card p-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Production Rate</p>
              <motion.p 
                className="text-green-400 font-bold text-2xl neon-text"
                animate={{ 
                  textShadow: ['0 0 10px #00ff88', '0 0 30px #00ff88', '0 0 10px #00ff88']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                +<AnimatedCounter value={0} />/sec
              </motion.p>
            </div>
            <motion.img
              src={AssetManager.resources.POWER}
              alt="Power"
              className="w-12 h-12"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Empire Panel */}
        <motion.div 
          className="glass-panel p-5 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.h2 
            className="text-xl font-bold text-white neon-text mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            My Empire
          </motion.h2>
          <div className="grid grid-cols-2 gap-3">
            <motion.div 
              className="cyber-card p-3"
              whileHover={{ scale: 1.05, borderColor: 'rgba(0, 212, 255, 0.5)' }}
              transition={{ type: 'spring' }}
            >
              <p className="text-gray-400 text-xs mb-1">Buildings</p>
              <motion.p 
                className="text-cyan-400 font-bold text-xl"
                animate={{ 
                  textShadow: ['0 0 10px #00d4ff', '0 0 20px #00d4ff', '0 0 10px #00d4ff']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AnimatedCounter value={0} />
              </motion.p>
            </motion.div>
            <motion.div 
              className="cyber-card p-3"
              whileHover={{ scale: 1.05, borderColor: 'rgba(0, 255, 136, 0.5)' }}
              transition={{ type: 'spring' }}
            >
              <p className="text-gray-400 text-xs mb-1">Mining Rate</p>
              <motion.p 
                className="text-green-400 font-bold text-xl"
                animate={{ 
                  textShadow: ['0 0 10px #00ff88', '0 0 20px #00ff88', '0 0 10px #00ff88']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AnimatedCounter value={0} />
              </motion.p>
            </motion.div>
            <motion.div 
              className="cyber-card p-3"
              whileHover={{ scale: 1.05, borderColor: 'rgba(157, 78, 221, 0.5)' }}
              transition={{ type: 'spring' }}
            >
              <p className="text-gray-400 text-xs mb-1">Empire Level</p>
              <motion.p 
                className="text-purple-400 font-bold text-xl"
                animate={{ 
                  textShadow: ['0 0 10px #9d4edd', '0 0 20px #9d4edd', '0 0 10px #9d4edd']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AnimatedCounter value={empire?.level || 1} />
              </motion.p>
            </motion.div>
            <motion.div 
              className="cyber-card p-3"
              whileHover={{ scale: 1.05, borderColor: 'rgba(0, 102, 255, 0.5)' }}
              transition={{ type: 'spring' }}
            >
              <p className="text-gray-400 text-xs mb-1">Experience</p>
              <motion.p 
                className="text-blue-400 font-bold text-xl"
                animate={{ 
                  textShadow: ['0 0 10px #0066ff', '0 0 20px #0066ff', '0 0 10px #0066ff']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AnimatedCounter value={empire?.experience || 0} />
              </motion.p>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleStartMining} className="w-full" size="lg">
              <img src={AssetManager.actions.build} alt="" className="w-5 h-5 mr-2" />
              Build Empire
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={() => router.push('/shop')} variant="secondary" className="w-full" size="lg">
              <img src={AssetManager.actions.buy} alt="" className="w-5 h-5 mr-2" />
              Visit Shop
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={() => router.push('/tasks')} variant="secondary" className="w-full" size="lg">
              <img src={AssetManager.actions.claim} alt="" className="w-5 h-5 mr-2" />
              Complete Tasks
            </Button>
          </motion.div>
        </motion.div>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}

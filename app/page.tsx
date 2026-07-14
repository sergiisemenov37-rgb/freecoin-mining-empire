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
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <img src={AssetManager.navigation.HOME} alt="FreeCoin" className="w-24 h-24 mx-auto mb-4" />
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2"
            animate={{ 
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ backgroundSize: '200% 100%' }}
          >
            FreeCoin
          </motion.h1>
          <motion.p 
            className="text-gray-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Mining Empire
          </motion.p>
        </motion.div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome, {session?.username || 'Miner'}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Your mining empire awaits. Build your base, mine resources, and become the ultimate cryptocurrency miner.
            </p>
            <Button onClick={handleStartMining} className="w-full">
              Start Mining
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Empire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="text-center p-3 bg-white/5 backdrop-blur border border-white/10 rounded-xl"
                whileHover={{ scale: 1.05, borderColor: 'rgba(34, 211, 238, 0.5)' }}
                transition={{ type: 'spring' }}
              >
                <motion.p 
                  className="text-2xl font-bold text-cyan-400"
                  animate={{ 
                    textShadow: ['0 0 10px rgba(34, 211, 238, 0.5)', '0 0 20px rgba(34, 211, 238, 0.8)', '0 0 10px rgba(34, 211, 238, 0.5)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AnimatedCounter value={empire?.level || 1} />
                </motion.p>
                <p className="text-xs text-gray-400">Level</p>
              </motion.div>
              <motion.div 
                className="text-center p-3 bg-white/5 backdrop-blur border border-white/10 rounded-xl"
                whileHover={{ scale: 1.05, borderColor: 'rgba(74, 222, 128, 0.5)' }}
                transition={{ type: 'spring' }}
              >
                <motion.p 
                  className="text-2xl font-bold text-green-400"
                  animate={{ 
                    textShadow: ['0 0 10px rgba(74, 222, 128, 0.5)', '0 0 20px rgba(74, 222, 128, 0.8)', '0 0 10px rgba(74, 222, 128, 0.5)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AnimatedCounter value={empire?.experience || 0} />
                </motion.p>
                <p className="text-xs text-gray-400">Experience</p>
              </motion.div>
              <motion.div 
                className="text-center p-3 bg-white/5 backdrop-blur border border-white/10 rounded-xl"
                whileHover={{ scale: 1.05, borderColor: 'rgba(250, 204, 21, 0.5)' }}
                transition={{ type: 'spring' }}
              >
                <motion.p 
                  className="text-2xl font-bold text-yellow-400"
                  animate={{ 
                    textShadow: ['0 0 10px rgba(250, 204, 21, 0.5)', '0 0 20px rgba(250, 204, 21, 0.8)', '0 0 10px rgba(250, 204, 21, 0.5)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {empire?.grid_size || 6}x{empire?.grid_size || 6}
                </motion.p>
                <p className="text-xs text-gray-400">Grid Size</p>
              </motion.div>
              <motion.div 
                className="text-center p-3 bg-white/5 backdrop-blur border border-white/10 rounded-xl"
                whileHover={{ scale: 1.05, borderColor: 'rgba(168, 85, 247, 0.5)' }}
                transition={{ type: 'spring' }}
              >
                <motion.p 
                  className="text-2xl font-bold text-purple-400"
                  animate={{ 
                    textShadow: ['0 0 10px rgba(168, 85, 247, 0.5)', '0 0 20px rgba(168, 85, 247, 0.8)', '0 0 10px rgba(168, 85, 247, 0.5)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AnimatedCounter value={0} />
                </motion.p>
                <p className="text-xs text-gray-400">Buildings</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button onClick={handleStartMining} variant="secondary" className="w-full">
                Go to Mining Base
              </Button>
              <Button onClick={() => router.push('/shop')} variant="secondary" className="w-full">
                Visit Shop
              </Button>
              <Button onClick={() => router.push('/tasks')} variant="secondary" className="w-full">
                Check Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}

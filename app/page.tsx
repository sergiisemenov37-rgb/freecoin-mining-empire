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
        <div className="text-center mb-8">
          <img src={AssetManager.navigation.HOME} alt="FreeCoin" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            FreeCoin
          </h1>
          <p className="text-gray-400">Mining Empire</p>
        </div>

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
              <div className="text-center p-3 bg-gray-800/50 rounded-xl">
                <p className="text-2xl font-bold text-cyan-400">{empire?.level || 1}</p>
                <p className="text-xs text-gray-400">Level</p>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-xl">
                <p className="text-2xl font-bold text-green-400">{empire?.experience || 0}</p>
                <p className="text-xs text-gray-400">Experience</p>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-xl">
                <p className="text-2xl font-bold text-yellow-400">{empire?.grid_size || 6}x{empire?.grid_size || 6}</p>
                <p className="text-xs text-gray-400">Grid Size</p>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-xl">
                <p className="text-2xl font-bold text-purple-400">0</p>
                <p className="text-xs text-gray-400">Buildings</p>
              </div>
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

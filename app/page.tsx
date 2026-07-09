'use client';

import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <>
      <PageLayout>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            FreeCoin
          </h1>
          <p className="text-gray-400">Mining Empire</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              Your mining empire awaits. Start your journey to become the ultimate cryptocurrency miner.
            </p>
            <Button className="w-full">Start Mining</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-800/50 rounded-xl">
                <p className="text-2xl font-bold text-cyan-400">0</p>
                <p className="text-xs text-gray-400">Coins</p>
              </div>
              <div className="text-center p-3 bg-gray-800/50 rounded-xl">
                <p className="text-2xl font-bold text-green-400">0</p>
                <p className="text-xs text-gray-400">Per Second</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}

'use client';

import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function Leaderboard() {
  return (
    <PageLayout title="Leaderboard">
      <Card>
        <CardHeader>
          <CardTitle>Top Miners</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">See the best miners in the empire.</p>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

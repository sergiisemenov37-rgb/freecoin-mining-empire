'use client';

import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BottomNavigation } from '@/components/ui/BottomNavigation';

export default function Upgrades() {
  return (
    <>
      <PageLayout title="Upgrades">
        <Card>
          <CardHeader>
            <CardTitle>Upgrades Shop</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Upgrade your mining equipment here.</p>
          </CardContent>
        </Card>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}

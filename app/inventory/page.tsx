'use client';

import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BottomNavigation } from '@/components/ui/BottomNavigation';

export default function Inventory() {
  return (
    <>
      <PageLayout title="Inventory">
        <Card>
          <CardHeader>
            <CardTitle>Your Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">View your items and equipment.</p>
          </CardContent>
        </Card>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}

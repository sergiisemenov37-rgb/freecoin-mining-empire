'use client';

import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BottomNavigation } from '@/components/ui/BottomNavigation';

export default function Mining() {
  return (
    <>
      <PageLayout title="Mining">
        <Card>
          <CardHeader>
            <CardTitle>Mining Center</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Mining operations will be implemented here.</p>
          </CardContent>
        </Card>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}

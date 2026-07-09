'use client';

import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BottomNavigation } from '@/components/ui/BottomNavigation';

export default function Settings() {
  return (
    <>
      <PageLayout title="Settings">
        <Card>
          <CardHeader>
            <CardTitle>App Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Configure your preferences.</p>
          </CardContent>
        </Card>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}

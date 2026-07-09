'use client';

import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function Friends() {
  return (
    <PageLayout title="Friends">
      <Card>
        <CardHeader>
          <CardTitle>Friends List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">Invite friends and earn bonuses.</p>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

'use client';

import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function Tasks() {
  return (
    <PageLayout title="Tasks">
      <Card>
        <CardHeader>
          <CardTitle>Available Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">Complete tasks to earn rewards.</p>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

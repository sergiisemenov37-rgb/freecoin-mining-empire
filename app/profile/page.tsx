'use client';

import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function Profile() {
  return (
    <PageLayout title="Profile">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">Manage your account settings.</p>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

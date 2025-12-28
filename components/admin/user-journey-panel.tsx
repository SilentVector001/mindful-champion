'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserJourneyPanelProps {
  userId: string;
  userName?: string;
  onClose?: () => void;
}

export default function UserJourneyPanel({ userId }: UserJourneyPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Journey tracking for user {userId}</p>
      </CardContent>
    </Card>
  );
}

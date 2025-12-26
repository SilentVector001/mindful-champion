'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface HeyGenCoachKaiProps {
  userContext?: any;
}

export default function HeyGenCoachKai({ userContext }: HeyGenCoachKaiProps) {
  const [loading, setLoading] = useState(false);
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Coach Kai</h2>
          <p className="text-gray-600 mb-4">Your AI Pickleball Coach</p>
          {loading && <Loader2 className="w-8 h-8 animate-spin mx-auto" />}
          <Button onClick={() => setLoading(!loading)}>
            Start Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

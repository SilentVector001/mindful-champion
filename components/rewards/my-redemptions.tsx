
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle2, Clock } from 'lucide-react';

interface Redemption {
  id: string;
  status: string;
  pointsSpent: number;
  createdAt: string;
  product: {
    name: string;
    imageUrl: string | null;
  };
}

export default function MyRedemptions() {
  const { data: session } = useSession() || {};
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchRedemptions();
    }
  }, [session]);

  const fetchRedemptions = async () => {
    try {
      const response = await fetch('/api/rewards/my-redemptions');
      const data = await response.json();
      setRedemptions(data.redemptions || []);
    } catch (error) {
      console.error('Failed to fetch redemptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'PROCESSING':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'SHIPPED':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'DELIVERED':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Redemptions</h1>

        {redemptions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No redemptions yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {redemptions.map((redemption) => (
              <Card key={redemption.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{redemption.product.name}</CardTitle>
                    <Badge>
                      {getStatusIcon(redemption.status)}
                      <span className="ml-2">{redemption.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Points Spent: {redemption.pointsSpent}</span>
                    <span className="text-gray-600">
                      {new Date(redemption.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


import { Suspense } from 'react';
import MyRedemptions from '@/components/rewards/my-redemptions';

export const metadata = {
  title: 'My Redemptions | Mindful Champion',
  description: 'Track your reward redemptions',
};

export default function MyRedemptionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyRedemptions />
    </Suspense>
  );
}

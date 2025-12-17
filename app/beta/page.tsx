
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { BetaTestingDashboard } from '@/components/beta/beta-testing-dashboard';

export default async function BetaPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/beta');
  }

  return <BetaTestingDashboard />;
}

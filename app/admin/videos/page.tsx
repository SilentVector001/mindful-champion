
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminVideoManagementPage } from '@/components/admin/video/admin-video-management-page';

export const dynamic = 'force-dynamic';

export default async function AdminVideosPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/auth/signin?callbackUrl=/admin/videos');
  }

  return <AdminVideoManagementPage />;
}

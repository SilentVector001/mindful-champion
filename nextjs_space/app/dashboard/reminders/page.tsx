import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { RemindersDashboard } from '@/components/notifications/reminders-dashboard';

export const metadata = {
  title: 'Reminders & Notifications | Mindful Champion',
  description: 'Manage your reminders and notification settings',
};

export default async function RemindersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/dashboard/reminders');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
      <RemindersDashboard userId={session.user.id} />
    </div>
  );
}

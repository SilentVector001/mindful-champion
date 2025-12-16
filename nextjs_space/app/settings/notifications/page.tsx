import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NotificationPreferences from '@/components/notifications/notification-preferences';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Notification Preferences | Settings',
  description: 'Manage your notification preferences and settings'
};

export default async function NotificationPreferencesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/settings/notifications');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          href="/settings" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Settings
        </Link>
      </div>

      {/* Main Content */}
      <NotificationPreferences />

      {/* Info Card */}
      <Card className="mt-8 p-6 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
        <h3 className="font-semibold text-gray-900 mb-2">About Notifications</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Notifications help you stay updated on important events and activities</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>You can customize when and how you receive notifications for each category</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Email notifications are sent to: <strong>{session.user.email}</strong></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">•</span>
            <span>Push notifications require browser permission (we'll ask when you enable them)</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}

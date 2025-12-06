
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import DeviceConnection from '@/components/wearables/device-connection';
import WearableAnalytics from '@/components/wearables/wearable-analytics';

export default async function DevicesSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Connect Your Devices</h1>
          <p className="text-muted-foreground mt-2">
            Connect your wearable devices to get personalized coaching insights from Coach Kai
          </p>
        </div>

        {/* Device Connection Section */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Available Devices</h2>
          <DeviceConnection />
        </div>

        {/* Analytics Section */}
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Your Health Data</h2>
          <WearableAnalytics />
        </div>

        {/* Privacy Notice */}
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="font-semibold mb-2">Privacy & Data Security</h3>
          <p className="text-sm text-muted-foreground">
            Your health data is encrypted and stored securely. We only access the data you explicitly allow. 
            Coach Kai uses this information to provide personalized training recommendations and health insights. 
            You can disconnect your devices at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

import { LiveStreamService } from '../lib/media-center/live-stream-service';

async function syncLiveStreams() {
  console.log('Starting live stream sync...');
  try {
    await LiveStreamService.syncLiveStreams();
    console.log('✅ Live stream sync completed successfully!');
  } catch (error) {
    console.error('❌ Error syncing live streams:', error);
    process.exit(1);
  }
}

syncLiveStreams();

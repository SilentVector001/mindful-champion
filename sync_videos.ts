import { LiveStreamService } from './lib/media-center/live-stream-service';

async function syncVideos() {
  console.log('Syncing tournament videos...');
  try {
    await LiveStreamService.syncLiveStreams();
    console.log('✅ Videos synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing videos:', error);
    process.exit(1);
  }
}

syncVideos();

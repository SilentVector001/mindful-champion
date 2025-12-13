import { PodcastPlayer } from '@/components/media/podcast-player';

export const metadata = {
  title: 'Podcasts | Mindful Champion Media Center',
  description: 'Listen to the best pickleball podcasts - The Dink, Pickleball Fire, and more',
};

export default function PodcastsPage() {
  return <PodcastPlayer />;
}

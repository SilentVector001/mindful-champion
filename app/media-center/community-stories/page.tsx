import { CommunityStoriesFeed } from '@/components/media/community-stories-feed';

export const metadata = {
  title: 'Community Stories | Mindful Champion',
  description: 'Read inspiring pickleball success stories, tournament experiences, and journeys from our community',
};

export default function CommunityStoriesPage() {
  return <CommunityStoriesFeed />;
}

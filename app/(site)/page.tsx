import HomePageSections from "@/components/site/HomePageSections";
import type { FeedItem } from "@/lib/homeFeed";

export default async function Page() {
  // Fixed demo feed that perfectly matches the FeedItem type
  const demoFeed: FeedItem[] = [
    {
      kind: "news",
      id: 1,
      title: "Welcome to DeMolay",
      slug: "welcome-to-demolay",
      summary: "Welcome to the official digital home of T. De Leon Chapter No. 47.",
      published_at: new Date().toISOString(),
      image_urls: [],
      sortAt: Date.now(),
    },
  ];

  return (
    <HomePageSections feedItems={demoFeed} />
  );
}

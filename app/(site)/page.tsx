import HomePageSections from "@/components/site/HomePageSections";

export default async function Page() {
  // Fixed demo feed that perfectly matches the FeedItem type
  const demoFeed = [
    {
      kind: "news",
      id: 1,
      title: "Welcome to DeMolay",
      slug: "welcome-to-demolay",
      summary: "Welcome to the official digital home of T. De Leon Chapter No. 47.",
      category: "announcement",
      published_at: new Date().toISOString(),
      image_urls: [],
      sortAt: Date.now(),
    },
  ];

  return (
    <HomePageSections feedItems={demoFeed} />
  );
}

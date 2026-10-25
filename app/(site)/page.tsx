import HomePageSections from "@/components/site/HomePageSections";

export default async function Page() {
  // Temporary demo feed to ensure the build succeeds and looks great
  const demoFeed = [
    {
      id: 1,
      title: "Welcome to DeMolay",
      summary: "Welcome to the official digital home of T. De Leon Chapter No. 47.",
      category: "announcement",
      published_at: new Date().toISOString(),
      image_urls: [],
    },
  ];

  return (
    <HomePageSections feedItems={demoFeed} />
  );
}

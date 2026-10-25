import Image from "next/image";
import Link from "next/link";
import { OfficersSection } from "@/components/OfficersSection";
import { NewsSection } from "@/components/NewsSection";
import { EventsSection } from "@/components/EventsSection";
import { LandingContent } from "@/components/LandingContent";
import { NewsletterSection } from "@/components/NewsletterSection";
import { CampaignSection } from "@/components/CampaignSection";
import { FundSection } from "@/components/FundSection";
import { PetitionerSection } from "@/components/PetitionerSection";

export default async function Page() {
  return (
    <main className="flex flex-col gap-20 pb-20">
      <LandingContent />
      <OfficersSection />
      <EventsSection />
      <NewsSection />
      <FundSection />
      <CampaignSection />
      <PetitionerSection />
      <NewsletterSection />
    </main>
  );
}

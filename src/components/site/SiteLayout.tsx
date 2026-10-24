'use client';

import Chatbot from '@/components/Chatbot';
import FireCursorBackground from '@/components/FireCursorBackground';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import PageIntroLoader from '@/components/PageIntroLoader';
import RevealOnScroll from '@/components/RevealOnScroll';
import ScrollProgress from '@/components/ScrollProgress';
import JoinUsModal from './JoinUsModal';
import { JoinUsModalProvider } from './JoinUsModalContext';
import SiteToast from './SiteToast';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-screen bg-[var(--background)] text-foreground">
      <FireCursorBackground />
      <JoinUsModalProvider>
        <div className="relative z-10">
          <PageIntroLoader />
          <RevealOnScroll />
          <ScrollProgress />
          <Navbar />
          {children}
          <Footer />
          <Chatbot />
          <JoinUsModal />
          <SiteToast />
        </div>
      </JoinUsModalProvider>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import NewsImageGallery from '@/components/site/NewsImageGallery';
import { formatNewsDateLabel } from '@/lib/formatNewsDate';
import { htmlToPlainText } from '@/lib/plainText';

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  image_urls?: string[];
  /** ISO string from server; mysql2 Date is normalized before pass */
  published_at?: string;
}

export default function PublicNewsSection({
  items,
  hideHeading = false,
}: {
  items: NewsItem[];
  hideHeading?: boolean;
}) {
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const summaryText = (value?: string, fallback = 'No summary provided.') => htmlToPlainText(value, fallback);

  return (
    <>
      <section id="news" className="px-6 py-20 md:px-10">
        <div className="mx-auto max-w-6xl">
          {!hideHeading ? (
            <h2 className="font-serif mb-8 text-3xl font-bold text-gold md:text-4xl">News & Announcements</h2>
          ) : null}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="glass overflow-hidden rounded-2xl border border-gold/25 hover:-translate-y-1">
                {item.image_urls?.[0] ? (
                  <div
                    className="h-48 border-b border-gold/15 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image_urls[0]})` }}
                    aria-label={item.title}
                  />
                ) : null}
                <div className="p-6">
                  <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">
                    {formatNewsDateLabel(item.published_at)}
                  </p>
                  <h3 className="font-serif text-2xl">{item.title}</h3>
                  <p className="mt-3 text-foreground/80">
                    {summaryText(item.summary, 'Read the latest chapter update from T. De Leon Chapter No. 47.')}
                  </p>
                  {item.image_urls?.length ? (
                    <p className="text-gold/75 mt-3 text-xs uppercase tracking-[0.2em]">
                      {item.image_urls.length} photo{item.image_urls.length === 1 ? '' : 's'}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="mt-5 inline-flex text-sm font-semibold text-gold hover:text-foreground"
                  >
                    Read more
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.article
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="glass w-full max-w-2xl rounded-2xl border border-gold/35 p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">
                {formatNewsDateLabel(selectedItem.published_at)}
              </p>
              <h3 className="font-serif text-3xl">{selectedItem.title}</h3>
              {selectedItem.image_urls?.length ? (
                <NewsImageGallery
                  key={`${selectedItem.id}-${selectedItem.image_urls.join('|')}`}
                  images={selectedItem.image_urls}
                  title={selectedItem.title}
                  className="mt-5"
                  frameClassName="h-56 sm:h-72"
                />
              ) : null}
              <p className="mt-4 whitespace-pre-wrap leading-relaxed text-foreground/85">
                {summaryText(selectedItem.content || selectedItem.summary)}
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="cta-primary btn-shine !px-4 !py-2 text-sm"
                >
                  Close
                </button>
              </div>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

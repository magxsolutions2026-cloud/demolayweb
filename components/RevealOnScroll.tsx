'use client';

import { useEffect } from 'react';

/**
 * Fades in `.reveal` elements as they scroll into view. Also watches the DOM, so elements from pages
 * reached by client-side navigation (or rendered later) are picked up, not only those present on first load.
 */
export default function RevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
    );

    const observeWithin = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)').forEach((el) => observer.observe(el));
    };
    observeWithin(document);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches('.reveal:not(.is-visible)')) observer.observe(node);
          observeWithin(node);
        });
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
    };
  }, []);

  return null;
}

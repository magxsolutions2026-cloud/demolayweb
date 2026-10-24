'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id?: number;
  title: string;
  event_date?: string;
  event_time?: string;
  date?: string;
  time?: string;
  location: string;
  description: string;
  type?: 'upcoming' | 'past';
}

const EventCard: React.FC<{ event: Event; isActive: boolean }> = ({ event, isActive }) => {
  const displayDate = event.event_date || event.date || '';
  const displayTime = event.event_time || event.time || '';

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={event.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div className="glass animated p-8 lg:p-12 rounded-2xl border border-[var(--secondary-color)]/20 h-full flex flex-col justify-between">
            {/* Header */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex items-start justify-between mb-6"
              >
                <div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-[var(--secondary-color)] mb-2">
                    {event.title}
                  </h3>
                  <p className="text-lg text-foreground/70">{displayDate}</p>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="px-4 py-2 bg-[var(--secondary-color)]/20 text-[var(--secondary-color)] rounded-full text-sm font-bold"
                >
                  Featured
                </motion.div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-lg text-foreground/80 mb-8 leading-relaxed"
              >
                {event.description}
              </motion.p>
            </div>

            {/* Details grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="grid grid-cols-2 gap-6 pt-8 border-t border-[var(--secondary-color)]/20"
            >
              <div>
                <p className="text-[var(--secondary-color)] text-sm font-bold uppercase tracking-wider mb-2">
                  Time
                </p>
                <p className="text-foreground text-lg">{displayTime}</p>
              </div>
              <div>
                <p className="text-[var(--secondary-color)] text-sm font-bold uppercase tracking-wider mb-2">
                  Location
                </p>
                <p className="text-foreground text-lg">{event.location}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface EventsProps {
  events?: Event[];
}

const Events: React.FC<EventsProps> = ({ events: initialEvents }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const events = useMemo<Event[]>(() => {
    if (initialEvents && initialEvents.length > 0) return initialEvents;
    return [
      {
        title: 'Monthly Chapter Meeting',
        date: 'March 15, 2026',
        time: '7:00 PM',
        location: 'Isabela Lodge No. 60, Ilagan City',
        description: 'Regular chapter meeting with ritual work and business discussions. All members are encouraged to attend.',
        type: 'upcoming',
      },
      {
        title: 'Leadership Workshop',
        date: 'March 22, 2026',
        time: '6:00 PM',
        location: 'Community Center',
        description: 'Interactive workshop on developing leadership skills and personal development in a supportive environment.',
        type: 'upcoming',
      },
      {
        title: 'Charity Fundraiser',
        date: 'April 5, 2026',
        time: '5:00 PM',
        location: 'Local Park',
        description: 'Annual charity event to support local community organizations. BBQ, games, and fun for the whole family!',
        type: 'upcoming',
      },
    ];
  }, [initialEvents]);

  const displayEvents = events.slice(0, 6); // Show only 6 most recent
  const currentEvent = displayEvents[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayEvents.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === displayEvents.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="events" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-maroon/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-gold uppercase font-bold tracking-widest text-sm"
          >
            What&apos;s Happening
          </motion.span>
          <h2 className="text-5xl sm:text-6xl font-black text-foreground mt-4 mb-6">
            Our Events
          </h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"
          />
        </motion.div>

        {/* Main carousel container */}
        {displayEvents.length > 0 && currentEvent && (
          <>
            {/* Featured event carousel */}
            <div className="relative h-96 lg:h-80 mb-12">
              <EventCard event={currentEvent} isActive={true} />
            </div>

            {/* Navigation and controls */}
            <div className="flex items-center justify-between">
              {/* Previous button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToPrevious}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-yellow-500 text-black font-bold text-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
              >
                ←
              </motion.button>

              {/* Dots indicator */}
              <div className="flex gap-2">
                {displayEvents.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-3 rounded-full transition-all ${
                      i === currentIndex
                        ? 'w-8 bg-gold'
                        : 'w-3 bg-gold/30 hover:bg-gold/50'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>

              {/* Next button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={goToNext}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-yellow-500 text-black font-bold text-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
              >
                →
              </motion.button>
            </div>

            {/* Event counter */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mt-8 text-foreground/70 font-medium"
            >
              Event {currentIndex + 1} of {displayEvents.length}
            </motion.div>
          </>
        )}

        {/* No events state */}
        {displayEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center glass p-12 rounded-2xl border border-gold/20"
          >
            <p className="text-xl text-foreground/70">Check back soon for upcoming events!</p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Events;

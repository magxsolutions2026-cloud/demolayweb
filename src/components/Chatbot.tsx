'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Compass, RefreshCw, SendHorizontal, Sparkles, X } from 'lucide-react';
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { useJoinUsModal } from '@/components/site/JoinUsModalContext';
import {
  SITE_ASSISTANT_STARTERS,
  createWelcomeReply,
  resolveSiteAssistantReply,
  type SiteAssistantAction,
  type SiteAssistantReply,
} from '@/lib/siteAssistant';

type ChatMessage =
  | { id: string; role: 'assistant'; reply: SiteAssistantReply }
  | { id: string; role: 'user'; text: string };

const THINKING_DELAY_MS = 280;

function createWelcomeMessage(id = 'assistant-welcome'): ChatMessage {
  return { id, role: 'assistant', reply: createWelcomeReply() };
}

export default function Chatbot() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const router = useRouter();
  const { open: openJoin } = useJoinUsModal();
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [isLauncherCompact, setIsLauncherCompact] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([createWelcomeMessage()]);
  const nextIdRef = useRef(0);
  const thinkingTimerRef = useRef<number | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const lastAssistantReply = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.role === 'assistant') return message.reply;
    }
    return createWelcomeReply();
  }, [messages]);

  const suggestedPrompts = useMemo(
    () => (lastAssistantReply.suggestedPrompts?.length ? lastAssistantReply.suggestedPrompts : [...SITE_ASSISTANT_STARTERS]),
    [lastAssistantReply],
  );

  useEffect(() => {
    return () => {
      if (thinkingTimerRef.current) {
        clearTimeout(thinkingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const focusInput = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusInput);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const syncScroll = window.requestAnimationFrame(() => {
      scrollAnchorRef.current?.scrollIntoView({ behavior: messages.length > 1 ? 'smooth' : 'auto', block: 'end' });
    });
    return () => window.cancelAnimationFrame(syncScroll);
  }, [isOpen, messages, isThinking]);

  useEffect(() => {
    let frame = 0;

    const updateCompactState = () => {
      frame = 0;
      if (!isHomePage) {
        setIsLauncherCompact(false);
        return;
      }

      const homeSection = document.getElementById('home');
      if (!homeSection) {
        setIsLauncherCompact(false);
        return;
      }

      const nextCompact = homeSection.getBoundingClientRect().bottom <= 120;
      setIsLauncherCompact((current) => (current === nextCompact ? current : nextCompact));
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateCompactState);
    };

    requestUpdate();

    if (!isHomePage) {
      return () => {
        if (frame) {
          window.cancelAnimationFrame(frame);
        }
      };
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [isHomePage]);

  const shouldCompactLauncher = !isHomePage || isLauncherCompact;
  const launcherTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 340, damping: 30, mass: 0.82 };

  const nextMessageId = (prefix: string) => {
    const id = `${prefix}-${nextIdRef.current}`;
    nextIdRef.current += 1;
    return id;
  };

  const resetConversation = () => {
    if (thinkingTimerRef.current) {
      clearTimeout(thinkingTimerRef.current);
      thinkingTimerRef.current = null;
    }
    setIsThinking(false);
    setInput('');
    setMessages([createWelcomeMessage(nextMessageId('assistant'))]);
  };

  const handleAction = (action: SiteAssistantAction) => {
    if (action.kind === 'join') {
      setIsOpen(false);
      openJoin();
      return;
    }

    if (action.kind === 'navigate') {
      setIsOpen(false);
      router.push(action.href);
      return;
    }

    window.open(action.href, '_blank', 'noopener,noreferrer');
  };

  const submitPrompt = (prompt: string) => {
    const question = prompt.trim();
    if (!question || isThinking) return;

    if (thinkingTimerRef.current) {
      clearTimeout(thinkingTimerRef.current);
    }

    setInput('');
    startTransition(() => {
      setMessages((current) => [...current, { id: nextMessageId('user'), role: 'user', text: question }]);
    });
    setIsThinking(true);

    thinkingTimerRef.current = window.setTimeout(() => {
      const reply = resolveSiteAssistantReply(question);
      startTransition(() => {
        setMessages((current) => [...current, { id: nextMessageId('assistant'), role: 'assistant', reply }]);
      });
      setIsThinking(false);
      thinkingTimerRef.current = null;
    }, THINKING_DELAY_MS);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-4 right-4 z-[70] sm:bottom-6 sm:right-6"
      >
        <motion.button
          layout
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close chapter guide' : 'Open chapter guide'}
          transition={launcherTransition}
          className="group flex items-center rounded-full border border-gold/25 bg-[linear-gradient(145deg,rgba(18,14,24,0.96),rgba(10,8,14,0.98))] px-3 py-3 pr-3 shadow-[0_24px_60px_rgba(0,0,0,0.38)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-gold/45"
        >
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-[linear-gradient(135deg,rgba(212,175,55,0.18),rgba(115,14,27,0.32))] shadow-[0_0_22px_rgba(212,175,55,0.16)]">
            <span className="absolute inset-1 rounded-full border border-white/10" aria-hidden />
            <Logo className="h-6 w-6" />
          </span>
          <AnimatePresence initial={false} mode="popLayout">
            {shouldCompactLauncher ? null : (
              <motion.span
                layout
                initial={prefersReducedMotion ? false : { opacity: 0, width: 0, x: -12, filter: 'blur(8px)', marginLeft: 0 }}
                animate={{ opacity: 1, width: 'auto', x: 0, filter: 'blur(0px)', marginLeft: 12 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, width: 0, x: -12, filter: 'blur(8px)', marginLeft: 0 }}
                transition={launcherTransition}
                className="hidden min-w-0 overflow-hidden text-left sm:block"
              >
                <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-gold/75">Chapter guide</span>
                <span className="block text-sm font-semibold text-foreground">Ask the chapter</span>
              </motion.span>
            )}
          </AnimatePresence>
          <AnimatePresence initial={false} mode="popLayout">
            {shouldCompactLauncher ? null : (
              <motion.span
                layout
                initial={prefersReducedMotion ? false : { opacity: 0, width: 0, scale: 0.84, x: -10, filter: 'blur(6px)', marginLeft: 0 }}
                animate={{ opacity: 1, width: 32, scale: 1, x: 0, filter: 'blur(0px)', marginLeft: 12 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, width: 0, scale: 0.84, x: -10, filter: 'blur(6px)', marginLeft: 0 }}
                transition={launcherTransition}
                className="overflow-hidden"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gold transition group-hover:border-gold/35 group-hover:bg-gold/10">
                  <Sparkles className="h-4 w-4" />
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen ? (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 bottom-3 top-[5.35rem] z-[80] flex flex-col overflow-hidden rounded-[1.75rem] border border-gold/25 bg-[linear-gradient(165deg,rgba(20,15,28,0.98),rgba(10,8,14,0.98))] shadow-[0_40px_120px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[min(78dvh,46rem)] sm:w-[min(27rem,calc(100vw-3rem))]"
            aria-label="Chapter guide"
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_70%)]" />
              <div className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
              <div className="absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-maroon/25 blur-3xl" />
            </div>

            <div className="relative flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-black/20 shadow-[0_12px_24px_rgba(0,0,0,0.22)]">
                  <span className="absolute inset-1 rounded-[0.9rem] border border-white/10" aria-hidden />
                  <Logo className="h-7 w-7" />
                </div>
                <div className="flex min-w-0 items-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/80 sm:text-[13px]">Sir Knight assistant</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={resetConversation}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-foreground/65 transition hover:border-gold/30 hover:text-gold"
                  aria-label="Reset conversation"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-foreground/65 transition hover:border-gold/30 hover:text-gold"
                  aria-label="Close chapter guide"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              <div className="space-y-3.5">
                {messages.map((message) =>
                  message.role === 'assistant' ? (
                    <AssistantBubble key={message.id} reply={message.reply} onAction={handleAction} />
                  ) : (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[85%] rounded-[1.25rem] border border-gold/25 bg-[linear-gradient(135deg,rgba(212,175,55,0.22),rgba(115,14,27,0.32))] px-4 py-3 text-sm leading-relaxed text-foreground shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
                        {message.text}
                      </div>
                    </div>
                  ),
                )}

                {isThinking ? (
                  <div className="flex justify-start">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3 shadow-[0_14px_30px_rgba(0,0,0,0.16)]">
                      <div className="flex items-center gap-2 text-foreground/65">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-gold [animation-delay:120ms]" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-gold [animation-delay:240ms]" />
                      </div>
                    </div>
                  </div>
                ) : null}
                <div ref={scrollAnchorRef} />
              </div>
            </div>

            <div className="relative border-t border-white/10 px-4 py-4 sm:px-5">
              <div className="desktop-thin-scrollbar mb-3 flex gap-2 overflow-x-auto pb-1 pr-1">
                {suggestedPrompts.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => submitPrompt(prompt)}
                    disabled={isThinking}
                    className="shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-left text-xs font-semibold tracking-[0.14em] text-foreground/80 transition hover:border-gold/30 hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submitPrompt(input);
                }}
                className="flex items-end gap-2"
              >
                <label htmlFor="chapter-guide-input" className="sr-only">
                  Ask the chapter guide
                </label>
                <div className="flex-1 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <input
                    id="chapter-guide-input"
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask about DeMolay, joining, events, or the lodge..."
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/38"
                  />
                  <p className="mt-2 text-[11px] text-foreground/45">Grounded in public site content only.</p>
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isThinking}
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-[linear-gradient(135deg,#d4af37_0%,#a8742a_42%,#730e1b_100%)] text-[#0b090d] shadow-[0_16px_34px_rgba(115,14,27,0.34)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function AssistantBubble({
  reply,
  onAction,
}: {
  reply: SiteAssistantReply;
  onAction: (action: SiteAssistantAction) => void;
}) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] rounded-[1.35rem] border border-white/10 bg-white/[0.035] px-4 py-4 shadow-[0_14px_34px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gold/25 bg-gold/10 text-gold">
            <Compass className="h-4 w-4" />
          </span>
          <p className="text-sm font-semibold tracking-tight text-gold">{reply.title}</p>
        </div>

        <div className="space-y-3 text-sm leading-relaxed text-foreground/82">
          {reply.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          {reply.bullets?.length ? (
            <ul className="space-y-2 text-foreground/78">
              {reply.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {reply.actions?.length ? (
          <div className="mt-4 flex flex-wrap gap-2.5">
            {reply.actions.map((action, index) => (
              <button
                key={`${action.label}-${'href' in action ? action.href : action.kind}`}
                type="button"
                onClick={() => onAction(action)}
                className={
                  index === 0
                    ? 'inline-flex items-center gap-2 rounded-full border border-gold/35 bg-[linear-gradient(135deg,#d4af37_0%,#a8742a_42%,#730e1b_100%)] px-3.5 py-2 text-sm font-semibold text-[#0b090d] transition hover:scale-[1.02]'
                    : 'inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3.5 py-2 text-sm font-semibold text-gold transition hover:border-gold/35 hover:bg-gold/10'
                }
              >
                {action.label}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

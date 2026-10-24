'use client';

import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const FORWARD_VIDEO_SRC = '/hero-background.mp4';
const REVERSE_VIDEO_SRC = '/hero-background-reverse.mp4';
const IDLE_VIDEO_SRC = '/hero-idle.mp4';
const EDGE_EPSILON = 0.04;
const CROSSFADE_MS = 260;
const HERO_ORBIT_EXTRA_VIEWPORTS = 0.35;
const HERO_VIDEO_FRAME_CLASS_NAME =
  'absolute inset-0 scale-[0.92] translate-y-3 drop-shadow-[0_32px_70px_rgba(0,0,0,0.88)] md:scale-[0.86] md:translate-y-5 md:drop-shadow-[0_42px_96px_rgba(0,0,0,0.9)]';
const HERO_VIDEO_CLASS_NAME =
  `${HERO_VIDEO_FRAME_CLASS_NAME} h-full w-full object-contain object-center transition-opacity duration-300`;

type ScrollDirection = 'down' | 'up';
type VideoLayer = 'forward' | 'reverse';
type PlaybackPhase = 'idle-start' | 'playing-forward' | 'idle-end' | 'playing-reverse';

const SCROLL_TRIGGER_KEYS = new Map<string, ScrollDirection>([
  [' ', 'down'],
  ['ArrowDown', 'down'],
  ['PageDown', 'down'],
  ['End', 'down'],
  ['Spacebar', 'down'],
  ['ArrowUp', 'up'],
  ['PageUp', 'up'],
  ['Home', 'up'],
]);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function seekVideo(video: HTMLVideoElement, time: number) {
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  const maxTime = duration > EDGE_EPSILON ? Math.max(0, duration - EDGE_EPSILON) : 0;
  const nextTime = clamp(time, 0, maxTime);

  if (Math.abs(video.currentTime - nextTime) < 0.01) return;

  const seekableVideo = video as HTMLVideoElement & { fastSeek?: (time: number) => void };
  if (typeof seekableVideo.fastSeek === 'function') {
    try {
      seekableVideo.fastSeek(nextTime);
      return;
    } catch {
      // Fall back to assigning currentTime directly.
    }
  }

  video.currentTime = nextTime;
}

function getPlayableDuration(forward: HTMLVideoElement, reverse: HTMLVideoElement) {
  const forwardDuration = Number.isFinite(forward.duration) ? forward.duration : 0;
  const reverseDuration = Number.isFinite(reverse.duration) ? reverse.duration : 0;
  const duration = Math.min(forwardDuration || 0, reverseDuration || 0);

  return duration > EDGE_EPSILON ? duration : 0;
}

function getHomeMetrics(homeEl: HTMLElement) {
  return {
    height: Math.max(homeEl.offsetHeight, window.innerHeight, 1),
    top: homeEl.offsetTop,
  };
}

function getLayerTime(layer: VideoLayer, storyTime: number, duration: number) {
  if (layer === 'forward') {
    return clamp(storyTime, 0, Math.max(0, duration - EDGE_EPSILON));
  }

  return clamp(duration - storyTime, 0, Math.max(0, duration - EDGE_EPSILON));
}

export default function HomeHeroVideoBackground() {
  const reduceMotion = useReducedMotion() ?? false;
  const idleRef = useRef<HTMLVideoElement>(null);
  const forwardRef = useRef<HTMLVideoElement>(null);
  const reverseRef = useRef<HTMLVideoElement>(null);
  const activeLayerRef = useRef<VideoLayer>('forward');
  const visibleLayerRef = useRef<VideoLayer>('forward');
  const playbackPhaseRef = useRef<PlaybackPhase>('idle-start');
  const lastIntentRef = useRef<ScrollDirection | null>(null);
  const lastScrollYRef = useRef(0);
  const lastTouchYRef = useRef<number | null>(null);
  const pauseHiddenLayerTimerRef = useRef<number | null>(null);
  const [isAtTop, setIsAtTop] = useState(true);
  const [idleGateReady, setIdleGateReady] = useState(true);
  const [idleReady, setIdleReady] = useState(false);
  const [idleError, setIdleError] = useState(false);
  const [visibleLayer, setVisibleLayer] = useState<VideoLayer>('forward');
  const [forwardReady, setForwardReady] = useState(false);
  const [reverseReady, setReverseReady] = useState(false);
  const [forwardError, setForwardError] = useState(false);
  const [reverseError, setReverseError] = useState(false);

  useEffect(() => {
    visibleLayerRef.current = visibleLayer;
  }, [visibleLayer]);

  useEffect(() => {
    const idle = idleRef.current;
    const forward = forwardRef.current;
    const reverse = reverseRef.current;
    if (!idle || !forward || !reverse) return;

    const clearPauseTimer = () => {
      if (pauseHiddenLayerTimerRef.current != null) {
        window.clearTimeout(pauseHiddenLayerTimerRef.current);
        pauseHiddenLayerTimerRef.current = null;
      }
    };

    const pauseBoth = () => {
      forward.pause();
      reverse.pause();
    };

    const getStoryTime = () => {
      const duration = getPlayableDuration(forward, reverse);
      if (duration <= 0) return 0;

      if (activeLayerRef.current === 'reverse') {
        return clamp(duration - reverse.currentTime, 0, duration);
      }

      return clamp(forward.currentTime, 0, duration);
    };

    const syncBothLayers = (storyTime: number) => {
      const duration = getPlayableDuration(forward, reverse);
      if (duration <= 0) return;

      seekVideo(forward, getLayerTime('forward', storyTime, duration));
      seekVideo(reverse, getLayerTime('reverse', storyTime, duration));
    };

    const setVisible = (layer: VideoLayer) => {
      const previouslyVisible = visibleLayerRef.current;
      if (previouslyVisible === layer) return;

      clearPauseTimer();
      visibleLayerRef.current = layer;
      setVisibleLayer(layer);

      pauseHiddenLayerTimerRef.current = window.setTimeout(() => {
        const hiddenVideo = layer === 'forward' ? reverse : forward;
        hiddenVideo.pause();
        pauseHiddenLayerTimerRef.current = null;
      }, CROSSFADE_MS);
    };

    const resetToStart = () => {
      clearPauseTimer();
      pauseBoth();
      syncBothLayers(0);
      activeLayerRef.current = 'forward';
      visibleLayerRef.current = 'forward';
      setVisibleLayer('forward');
      playbackPhaseRef.current = 'idle-start';
    };

    const settleAtEnd = () => {
      const duration = getPlayableDuration(forward, reverse);
      if (duration <= 0) return;

      clearPauseTimer();
      pauseBoth();
      syncBothLayers(duration);
      activeLayerRef.current = 'forward';
      visibleLayerRef.current = 'forward';
      setVisibleLayer('forward');
      playbackPhaseRef.current = 'idle-end';
    };

    const playLayer = async (layer: VideoLayer) => {
      const target = layer === 'forward' ? forward : reverse;

      try {
        await target.play();
      } catch {
        playbackPhaseRef.current = getStoryTime() <= EDGE_EPSILON ? 'idle-start' : 'idle-end';
      }
    };

    const activateLayer = (layer: VideoLayer) => {
      const duration = getPlayableDuration(forward, reverse);
      if (duration <= 0) return;

      const storyTime = getStoryTime();
      if (layer === 'forward' && storyTime >= duration - EDGE_EPSILON) {
        settleAtEnd();
        return;
      }

      if (layer === 'reverse' && storyTime <= EDGE_EPSILON) {
        resetToStart();
        return;
      }

      clearPauseTimer();
      pauseBoth();
      syncBothLayers(storyTime);
      activeLayerRef.current = layer;
      playbackPhaseRef.current = layer === 'forward' ? 'playing-forward' : 'playing-reverse';
      setVisible(layer);
      void playLayer(layer);
    };

    const updateScrollDrivenPlayback = () => {
      const homeEl = document.getElementById('home');
      if (!homeEl) return;

      const scrollY = window.scrollY;
      const { height, top } = getHomeMetrics(homeEl);
      const orbitBottom = top + height + (window.innerHeight * HERO_ORBIT_EXTRA_VIEWPORTS);
      const isInHeroOrbit = scrollY >= top - 2 && scrollY <= orbitBottom;
      const atTop = scrollY <= top + 2;
      setIsAtTop(atTop);
      if (!atTop) {
        setIdleGateReady(false);
      } else if (!idleGateReady && playbackPhaseRef.current === 'idle-start') {
        setIdleGateReady(true);
      }

      if (!isInHeroOrbit) {
        lastScrollYRef.current = scrollY;
        return;
      }

      const storyTime = getStoryTime();
      if (lastIntentRef.current === 'up' && reverseReady && !reverseError && storyTime > EDGE_EPSILON) {
        activateLayer('reverse');
      } else if (lastIntentRef.current === 'down' && scrollY > top + 2) {
        activateLayer('forward');
      }

      lastScrollYRef.current = scrollY;
    };

    const handleMetadata = () => {
      if (getPlayableDuration(forward, reverse) <= 0) return;

      if (playbackPhaseRef.current === 'idle-start') {
        syncBothLayers(0);
        return;
      }

      if (playbackPhaseRef.current === 'idle-end') {
        syncBothLayers(getPlayableDuration(forward, reverse));
      }
    };

    const handleWheel = (event: WheelEvent) => {
      const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
        ? event.deltaY
        : event.deltaX;

      if (Math.abs(dominantDelta) < 1) return;
      lastIntentRef.current = dominantDelta > 0 ? 'down' : 'up';
    };

    const handleTouchStart = (event: TouchEvent) => {
      lastTouchYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const nextY = event.touches[0]?.clientY;
      const prevY = lastTouchYRef.current;
      if (nextY == null || prevY == null) return;

      const delta = prevY - nextY;
      lastTouchYRef.current = nextY;
      if (Math.abs(delta) < 2) return;

      lastIntentRef.current = delta > 0 ? 'down' : 'up';
    };

    const handleTouchEnd = () => {
      lastTouchYRef.current = null;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = SCROLL_TRIGGER_KEYS.get(event.key);
      if (!direction) return;
      lastIntentRef.current = direction;
    };

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      if (nextScrollY > lastScrollYRef.current + 1) {
        lastIntentRef.current = 'down';
      } else if (nextScrollY < lastScrollYRef.current - 1) {
        lastIntentRef.current = 'up';
      }

      updateScrollDrivenPlayback();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        pauseBoth();
        clearPauseTimer();
        return;
      }

      if (
        playbackPhaseRef.current === 'playing-forward' ||
        playbackPhaseRef.current === 'playing-reverse'
      ) {
        void playLayer(activeLayerRef.current);
      }
    };

    const handleForwardEnded = () => {
      settleAtEnd();
    };

    const handleReverseEnded = () => {
      resetToStart();
      setIdleGateReady(true);
    };

    idle.defaultMuted = true;
    idle.muted = true;
    idle.playsInline = true;
    idle.loop = true;
    forward.defaultMuted = true;
    forward.muted = true;
    forward.playsInline = true;
    reverse.defaultMuted = true;
    reverse.muted = true;
    reverse.playsInline = true;

    if (idle.readyState === HTMLMediaElement.HAVE_NOTHING) {
      idle.load();
    }

    if (forward.readyState === HTMLMediaElement.HAVE_NOTHING) {
      forward.load();
    }

    if (reverse.readyState === HTMLMediaElement.HAVE_NOTHING) {
      reverse.load();
    }

    lastScrollYRef.current = window.scrollY;

    if (reduceMotion) {
      resetToStart();
      return () => {
        clearPauseTimer();
        pauseBoth();
      };
    }

    forward.addEventListener('loadedmetadata', handleMetadata);
    reverse.addEventListener('loadedmetadata', handleMetadata);
    forward.addEventListener('ended', handleForwardEnded);
    reverse.addEventListener('ended', handleReverseEnded);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    handleMetadata();
    updateScrollDrivenPlayback();

    return () => {
      forward.removeEventListener('loadedmetadata', handleMetadata);
      reverse.removeEventListener('loadedmetadata', handleMetadata);
      forward.removeEventListener('ended', handleForwardEnded);
      reverse.removeEventListener('ended', handleReverseEnded);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearPauseTimer();
      pauseBoth();
    };
  }, [idleGateReady, reduceMotion, reverseError, reverseReady]);


  useEffect(() => {
    const idle = idleRef.current;
    if (!idle || reduceMotion) return;

    if (isAtTop && idleGateReady && idleReady && !idleError) {
      idle.play().catch(() => {});
      return;
    }

    idle.pause();
  }, [idleError, idleGateReady, idleReady, isAtTop, reduceMotion]);


  const showForward = !reduceMotion && forwardReady && !forwardError;
  const showReverse = !reduceMotion && reverseReady && !reverseError;
  const showIdle = !reduceMotion && idleReady && !idleError && isAtTop && idleGateReady;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 w-full overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-black" />

      <video
        ref={idleRef}
        muted
        playsInline
        preload="auto"
        loop
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        className={HERO_VIDEO_CLASS_NAME}
        style={{ opacity: showIdle ? 1 : 0 }}
        onLoadStart={() => {
          setIdleError(false);
          setIdleReady(false);
        }}
        onLoadedData={() => {
          setIdleError(false);
          setIdleReady(true);
        }}
        onCanPlay={() => {
          setIdleError(false);
          setIdleReady(true);
        }}
        onError={() => {
          setIdleError(true);
          setIdleReady(false);
        }}
      >
        <source src={IDLE_VIDEO_SRC} type="video/mp4" />
      </video>

      <video
        ref={forwardRef}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        className={HERO_VIDEO_CLASS_NAME}
        style={{ opacity: showForward && visibleLayer === 'forward' && !showIdle ? 1 : 0 }}
        onLoadStart={() => {
          setForwardError(false);
          setForwardReady(false);
        }}
        onLoadedData={() => {
          setForwardError(false);
          setForwardReady(true);
        }}
        onCanPlay={() => {
          setForwardError(false);
          setForwardReady(true);
        }}
        onError={() => {
          setForwardError(true);
          setForwardReady(false);
        }}
      >
        <source src={FORWARD_VIDEO_SRC} type="video/mp4" />
      </video>

      <video
        ref={reverseRef}
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        className={HERO_VIDEO_CLASS_NAME}
        style={{ opacity: showReverse && visibleLayer === 'reverse' && !showIdle ? 1 : 0 }}
        onLoadStart={() => {
          setReverseError(false);
          setReverseReady(false);
        }}
        onLoadedData={() => {
          setReverseError(false);
          setReverseReady(true);
        }}
        onCanPlay={() => {
          setReverseError(false);
          setReverseReady(true);
        }}
        onError={() => {
          setReverseError(true);
          setReverseReady(false);
        }}
      >
        <source src={REVERSE_VIDEO_SRC} type="video/mp4" />
      </video>

      <div
        className={HERO_VIDEO_FRAME_CLASS_NAME}
        style={{
          background: `
            radial-gradient(circle at center, transparent 48%, rgba(0, 0, 0, 0.14) 62%, rgba(0, 0, 0, 0.46) 78%, rgba(0, 0, 0, 0.94) 100%),
            linear-gradient(90deg, rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 0, 0.62) 13%, rgba(0, 0, 0, 0.12) 26%, transparent 50%, rgba(0, 0, 0, 0.12) 74%, rgba(0, 0, 0, 0.62) 87%, rgba(0, 0, 0, 0.98) 100%),
            linear-gradient(180deg, rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 0, 0.42) 14%, rgba(0, 0, 0, 0.08) 28%, transparent 50%, rgba(0, 0, 0, 0.12) 72%, rgba(0, 0, 0, 0.48) 88%, rgba(0, 0, 0, 0.99) 100%)`,
        }}
      />

    </div>
  );
}

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

const VIDEO_SRC = '/kamera-hero.mp4';
export const VIDEO_BG = '#000000';

const VIDEO_DURATION = 10;
const VIDEO_ASPECT = 16 / 9;

// Scroll phases (fraction of total progress)
const P_HERO_END        = 0.06;  // hero text visible
const P_PLAY_END        = 0.45;  // video plays 0 → T_PAUSE
const P_LABELS_OUT      = 0.70;  // labels hold then fade out
const P_PLAY2_END       = 0.95;  // video continues T_PAUSE → end

const T_PAUSE = 3.5;             // seconds where video freezes during labels

export const SECTION_VH = 500;

const HUD_SPECS: { n: string; label: string; x: string; y: string; side: 'left' | 'right' }[] = [
  { n: '01', label: 'Mode Dial',             x: '38.9%', y: '24.4%', side: 'left'  },
  { n: '02', label: 'Hot Shoe Mount',        x: '51.6%', y: '15.9%', side: 'left'  },
  { n: '03', label: 'Shutter Button',        x: '45.3%', y: '28.1%', side: 'right' },
  { n: '04', label: 'Rear Command Dial',     x: '61.3%', y: '33.0%', side: 'right' },
  { n: '05', label: 'Grip',                  x: '64.6%', y: '62.5%', side: 'right' },
  { n: '06', label: 'Viewfinder',            x: '35.8%', y: '33.5%', side: 'left'  },
  { n: '07', label: 'Built-in Flash',        x: '53.8%', y: '11.2%', side: 'left'  },
  { n: '08', label: 'Top LCD Display',       x: '41.9%', y: '16.5%', side: 'left'  },
  { n: '09', label: 'Exposure Comp. Dial',   x: '55.6%', y: '23.4%', side: 'right' },
  { n: '10', label: 'Front Command Dial',    x: '58.3%', y: '32.7%', side: 'right' },
  { n: '11', label: 'Strap Eyelet',          x: '62.7%', y: '37.4%', side: 'right' },
  { n: '12', label: 'AF Assist Beam',        x: '43.7%', y: '36.8%', side: 'left'  },
  { n: '13', label: 'Function Button',       x: '34.8%', y: '40.6%', side: 'left'  },
  { n: '14', label: 'Lens Release',          x: '44.7%', y: '46.7%', side: 'left'  },
  { n: '15', label: 'Focus Ring',            x: '34.0%', y: '53.3%', side: 'left'  },
  { n: '16', label: 'Zoom Ring',             x: '33.9%', y: '59.1%', side: 'left'  },
  { n: '17', label: 'Lens',                  x: '32.8%', y: '66.3%', side: 'left'  },
  { n: '18', label: 'Filter Thread',         x: '35.6%', y: '71.7%', side: 'left'  },
  { n: '19', label: 'Microphone Input',      x: '65.7%', y: '48.6%', side: 'right' },
  { n: '20', label: 'Headphone Output',      x: '65.7%', y: '54.2%', side: 'right' },
  { n: '21', label: 'USB-C Port',            x: '65.6%', y: '58.4%', side: 'right' },
  { n: '22', label: 'HDMI Port',             x: '64.6%', y: '66.5%', side: 'right' },
  { n: '23', label: 'Speaker',               x: '62.0%', y: '68.4%', side: 'right' },
  { n: '24', label: 'Memory Card Slot',      x: '59.3%', y: '63.3%', side: 'right' },
  { n: '25', label: 'Battery Door',          x: '57.1%', y: '73.3%', side: 'right' },
];

function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function smoothstep(t: number) { const c = clamp(t, 0, 1); return c * c * (3 - 2 * c); }

function useVideoRect(containerRef: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);
  return useMemo(() => {
    const { w, h } = size;
    if (!w || !h) return { left: 0, top: 0, width: 0, height: 0 };
    const containerAspect = w / h;
    let width: number, height: number;
    if (containerAspect > VIDEO_ASPECT) { height = h; width = h * VIDEO_ASPECT; }
    else { width = w; height = w / VIDEO_ASPECT; }
    return { left: (w - width) / 2, top: (h - height) / 2, width, height };
  }, [size]);
}

export default function ScrollVideoExperience() {
  const videoRef   = useRef<HTMLVideoElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stickyRef  = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress]     = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const rafRef      = useRef<number | null>(null);
  const lastSeekRef = useRef(0);
  const rect = useVideoRect(stickyRef as React.RefObject<HTMLElement | null>);

  useEffect(() => {
    const update = () => {
      const wrapper = wrapperRef.current;
      const video   = videoRef.current;
      if (!wrapper || !video) { rafRef.current = requestAnimationFrame(update); return; }

      const box   = wrapper.getBoundingClientRect();
      const total = box.height - window.innerHeight;
      const scrolled = clamp(-box.top, 0, total);
      const p = total > 0 ? scrolled / total : 0;
      setProgress(p);

      // Video seek target
      let target: number;
      if (p < P_HERO_END) {
        target = 0;
      } else if (p < P_PLAY_END) {
        target = lerp(0, T_PAUSE, (p - P_HERO_END) / (P_PLAY_END - P_HERO_END));
      } else if (p < P_LABELS_OUT) {
        target = T_PAUSE; // frozen during labels
      } else if (p < P_PLAY2_END) {
        const t2 = VIDEO_DURATION - 0.05;
        target = lerp(T_PAUSE, t2, (p - P_LABELS_OUT) / (P_PLAY2_END - P_LABELS_OUT));
      } else {
        target = VIDEO_DURATION - 0.05;
      }

      if (video.readyState >= 1 && video.duration && !Number.isNaN(video.duration)) {
        const t = clamp(target, 0, video.duration);
        if (Math.abs(video.currentTime - t) > 0.01 && performance.now() - lastSeekRef.current > 16) {
          lastSeekRef.current = performance.now();
          try { video.currentTime = t; } catch { /* seeking */ }
        }
      }

      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const handleLoaded = useCallback(() => {
    setVideoReady(true);
    const v = videoRef.current;
    if (v) { v.pause(); v.muted = true; }
  }, []);
  const handleError = useCallback(() => setVideoError(true), []);

  // Derived opacities
  const introOpacity = smoothstep(clamp(1 - progress / (P_HERO_END * 0.9), 0, 1));

  const labelsIn  = smoothstep(clamp((progress - P_PLAY_END)    / 0.04, 0, 1));
  const labelsOut = smoothstep(clamp((P_LABELS_OUT - progress)  / 0.04, 0, 1));
  const labelsOpacity = Math.min(labelsIn, labelsOut);

  const scrollHintOpacity = clamp(1 - progress * 12, 0, 1);

  return (
    <section
      ref={wrapperRef}
      className="relative w-full"
      style={{ height: `${SECTION_VH}vh` }}
      aria-label="Camera showcase"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ background: VIDEO_BG }}
      >
        {/* Progress bar — TOP */}
        <div className="absolute top-0 left-0 z-30 h-0.5 w-full bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-accent to-cyber transition-none"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Video */}
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          className="absolute inset-0 h-full w-full"
          style={{ objectFit: 'contain', background: VIDEO_BG }}
          playsInline muted preload="auto"
          onLoadedMetadata={handleLoaded}
          onCanPlay={handleLoaded}
          onError={handleError}
        />

        {/* Nav bar */}
        <div className="absolute inset-x-0 top-1 z-30 flex items-center justify-between px-6 py-5 sm:px-10">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-full border border-accent/40 bg-accent/10">
              <div className="h-2 w-2 rounded-full bg-accent shadow-glow" />
            </div>
            <span className="font-display text-sm font-semibold tracking-[0.35em] text-white/90">
              AURA&nbsp;CINE
            </span>
          </div>
          <div className="hidden items-center gap-6 font-display text-[11px] tracking-[0.3em] text-white/50 sm:flex">
            <span>SERIES&nbsp;X</span>
            <span className="text-accent">FLAGSHIP</span>
            <span>2026</span>
          </div>
        </div>

        {/* Hero text */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end pb-20 px-6 text-center"
          style={{ opacity: introOpacity }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            <span className="font-display text-[10px] tracking-[0.35em] text-white/70">
              INTRODUCING THE FLAGSHIP
            </span>
          </div>
          <h1 className="font-display text-[clamp(2rem,6vw,5.5rem)] font-bold leading-[1] tracking-tight text-white drop-shadow-2xl">
            THE NEXT ERA OF
            <br />
            <span className="bg-gradient-to-r from-accent via-accent-glow to-cyber bg-clip-text text-transparent">
              CINEMATOGRAPHY
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/55 sm:text-base">
            A full-frame cinema instrument engineered without compromise.
          </p>
        </div>

        {/* HUD Labels */}
        {rect.width > 0 && labelsOpacity > 0.01 && (
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{ opacity: labelsOpacity }}
          >
            {HUD_SPECS.map((s) => {
              const px = rect.left + (parseFloat(s.x) / 100) * rect.width;
              const py = rect.top  + (parseFloat(s.y) / 100) * rect.height;
              return (
                <div
                  key={s.n}
                  className="absolute flex items-center gap-2"
                  style={{
                    left: px,
                    top: py,
                    transform: `translate(${s.side === 'right' ? '-100%' : '0'}, -50%)`,
                  }}
                >
                  {s.side === 'right' && (
                    <>
                      <span className="glass whitespace-nowrap rounded-lg px-3 py-2 shadow-glass">
                        <span className="mr-2 font-display text-[9px] tracking-[0.3em] text-accent">{s.n}</span>
                        <span className="font-display text-[11px] font-medium text-white/90 sm:text-xs">{s.label}</span>
                      </span>
                      <div className="h-px w-8 bg-gradient-to-r from-accent/60 to-transparent" />
                    </>
                  )}
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1.5 rounded-full border border-accent/30 animate-pulseRing" />
                    <div className="h-2 w-2 rounded-full bg-accent shadow-glow" />
                  </div>
                  {s.side === 'left' && (
                    <>
                      <div className="h-px w-8 bg-gradient-to-l from-accent/60 to-transparent" />
                      <span className="glass whitespace-nowrap rounded-lg px-3 py-2 shadow-glass">
                        <span className="mr-2 font-display text-[9px] tracking-[0.3em] text-accent">{s.n}</span>
                        <span className="font-display text-[11px] font-medium text-white/90 sm:text-xs">{s.label}</span>
                      </span>
                    </>
                  )}
                </div>
              );
            })}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center">
              <span className="font-display text-[9px] tracking-[0.4em] text-accent/60">
                25 PRECISION COMPONENTS
              </span>
            </div>
          </div>
        )}

        {/* Scroll indicator */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex flex-col items-center gap-2"
          style={{ opacity: scrollHintOpacity }}
        >
          <span className="font-display text-[10px] tracking-[0.4em] text-white/35">SCROLL TO EXPLORE</span>
          <div className="grid h-9 w-6 place-items-start justify-center rounded-full border border-white/20 pt-1.5">
            <div className="h-1.5 w-1 animate-bounce rounded-full bg-accent" />
          </div>
        </div>

        {/* Loading */}
        {!videoReady && !videoError && (
          <div className="absolute inset-0 z-40 grid place-items-center" style={{ background: VIDEO_BG }}>
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border border-white/10 border-t-accent" />
              <span className="font-display text-[10px] tracking-[0.4em] text-white/40">LOADING</span>
            </div>
          </div>
        )}
        {videoError && (
          <div className="absolute inset-0 z-40 grid place-items-center px-6 text-center" style={{ background: VIDEO_BG }}>
            <span className="font-display text-[10px] tracking-[0.4em] text-accent/70">
              Place <code className="text-white/70">{VIDEO_SRC}</code> in <code className="text-white/70">public/</code>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

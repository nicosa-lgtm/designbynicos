import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

// ============================================================================
// ASSETS
// ============================================================================
const VIDEO_SRC = '/kamera-hero.mp4';
const DOCK_IMAGE_SRC = '/camera-front.png';
const MESIN_IMAGE_SRC = '/mesin-terbuka.png'; // taruh di public/ dengan nama ini

export const VIDEO_BG = '#000000';

// ============================================================================
// VIDEO TIMING
// ============================================================================
const VIDEO_DURATION = 10;
const VIDEO_ASPECT = 16 / 9;
const T_INTRO = 1.2;
const T_ZOOM = 1.89;
const T_END = VIDEO_DURATION - 0.05;

// ============================================================================
// SCROLL MAP (fractions of total scroll progress)
// ============================================================================
const P_INTRO_END        = 0.05;  // hero text fades, video goes 0→T_INTRO
const P_ZOOM_IN_END      = 0.10;  // T_INTRO → T_ZOOM (label pose)
const P_LABELS_FADE_IN   = 0.13;  // all labels fade IN together
const P_LABELS_HOLD_END  = 0.65;  // all labels held — 2x scroll window to read
const P_LABELS_FADE_OUT  = 0.68;  // all labels fade OUT together
const P_MESIN_IN         = 0.70;  // mesin terbuka fades in
const P_MESIN_OUT        = 0.80;  // mesin terbuka fades out
const P_ROTATE_BACK_END  = 0.91;  // T_ZOOM → T_END, camera rotates back
const P_DOCK_START       = 0.91;  // dock image starts fading in
// 0.91 → 1.0 : dock crossfade + camera begins dragging down

export const SECTION_VH = 1500; // tall enough for all phases + 2x label scroll

// ============================================================================
// CAMERA LABELS (25 items, simultaneous display)
// ============================================================================
const HUD_SPECS: { n: string; label: string; x: string; y: string; side: 'left' | 'right' }[] = [
  { n: '01', label: 'Mode Dial',                  x: '38.9%', y: '24.4%', side: 'left'  },
  { n: '02', label: 'Hot Shoe Mount',              x: '51.6%', y: '15.9%', side: 'left'  },
  { n: '03', label: 'Shutter Button',              x: '45.3%', y: '28.1%', side: 'right' },
  { n: '04', label: 'Rear Command Dial',           x: '61.3%', y: '33.0%', side: 'right' },
  { n: '05', label: 'Grip',                        x: '64.6%', y: '62.5%', side: 'right' },
  { n: '06', label: 'Viewfinder',                  x: '35.8%', y: '33.5%', side: 'left'  },
  { n: '07', label: 'Built-in Flash',              x: '53.8%', y: '11.2%', side: 'left'  },
  { n: '08', label: 'Top LCD Display',             x: '41.9%', y: '16.5%', side: 'left'  },
  { n: '09', label: 'Exposure Comp. Dial',         x: '55.6%', y: '23.4%', side: 'right' },
  { n: '10', label: 'Front Command Dial',          x: '58.3%', y: '32.7%', side: 'right' },
  { n: '11', label: 'Strap Eyelet',                x: '62.7%', y: '37.4%', side: 'right' },
  { n: '12', label: 'AF Assist / Self-Timer',      x: '43.7%', y: '36.8%', side: 'left'  },
  { n: '13', label: 'Function (Fn) Button',        x: '34.8%', y: '40.6%', side: 'left'  },
  { n: '14', label: 'Lens Release Button',         x: '44.7%', y: '46.7%', side: 'left'  },
  { n: '15', label: 'Focus Ring',                  x: '34.0%', y: '53.3%', side: 'left'  },
  { n: '16', label: 'Zoom Ring',                   x: '33.9%', y: '59.1%', side: 'left'  },
  { n: '17', label: 'Lens',                        x: '32.8%', y: '66.3%', side: 'left'  },
  { n: '18', label: 'Filter Thread',               x: '35.6%', y: '71.7%', side: 'left'  },
  { n: '19', label: 'Microphone Input',            x: '65.7%', y: '48.6%', side: 'right' },
  { n: '20', label: 'Headphone Output',            x: '65.7%', y: '54.2%', side: 'right' },
  { n: '21', label: 'USB-C Port',                  x: '65.6%', y: '58.4%', side: 'right' },
  { n: '22', label: 'HDMI Port',                   x: '64.6%', y: '66.5%', side: 'right' },
  { n: '23', label: 'Speaker',                     x: '62.0%', y: '68.4%', side: 'right' },
  { n: '24', label: 'Memory Card Slot',            x: '59.3%', y: '63.3%', side: 'right' },
  { n: '25', label: 'Battery Door',                x: '57.1%', y: '73.3%', side: 'right' },
];

// ============================================================================
// MESIN TERBUKA LABELS (exploded view — x/y is % of that image)
// Adjust coordinates once you can preview against the actual image
// ============================================================================
const MESIN_SPECS: { n: string; label: string; x: string; y: string; side: 'left' | 'right' }[] = [
  { n: 'M01', label: 'Image Sensor',           x: '48%', y: '32%', side: 'left'  },
  { n: 'M02', label: 'Shutter Mechanism',      x: '52%', y: '38%', side: 'right' },
  { n: 'M03', label: 'Mirror Box',             x: '44%', y: '44%', side: 'left'  },
  { n: 'M04', label: 'Main PCB',               x: '55%', y: '50%', side: 'right' },
  { n: 'M05', label: 'Battery Compartment',    x: '57%', y: '62%', side: 'right' },
  { n: 'M06', label: 'Viewfinder Prism',       x: '45%', y: '22%', side: 'left'  },
  { n: 'M07', label: 'AF Module',              x: '50%', y: '55%', side: 'left'  },
  { n: 'M08', label: 'Image Processor',        x: '53%', y: '42%', side: 'right' },
  { n: 'M09', label: 'Cooling System',         x: '60%', y: '35%', side: 'right' },
  { n: 'M10', label: 'Lens Mount Ring',        x: '46%', y: '60%', side: 'left'  },
];

// Dock rect: align camera-front.png to the video's last frame
const DOCK_RECT = { left: 22.3, top: 15.6, width: 48.1, height: 60.7 };

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

// Exported so MarketingSection can read the progress for the camera drag
export type ScrollState = { progress: number; dockOpacity: number; dragY: number };

interface Props { onScroll?: (state: ScrollState) => void; }

export default function ScrollVideoExperience({ onScroll }: Props) {
  const videoRef   = useRef<HTMLVideoElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stickyRef  = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress]     = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const rafRef      = useRef<number | null>(null);
  const lastSeekRef = useRef(0);
  const rect = useVideoRect(stickyRef);

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

      // ── video seek target ──
      let target: number;
      if (p < P_INTRO_END) {
        target = lerp(0, T_INTRO, p / P_INTRO_END);
      } else if (p < P_ZOOM_IN_END) {
        target = lerp(T_INTRO, T_ZOOM, (p - P_INTRO_END) / (P_ZOOM_IN_END - P_INTRO_END));
      } else if (p < P_MESIN_IN) {
        target = T_ZOOM; // frozen on label/mesin pose
      } else if (p < P_ROTATE_BACK_END) {
        target = lerp(T_ZOOM, T_END, (p - P_MESIN_OUT) / (P_ROTATE_BACK_END - P_MESIN_OUT));
      } else {
        target = T_END;
      }

      if (video.readyState >= 1 && video.duration && !Number.isNaN(video.duration)) {
        const t = clamp(target, 0, video.duration);
        if (Math.abs(video.currentTime - t) > 0.01 && performance.now() - lastSeekRef.current > 16) {
          lastSeekRef.current = performance.now();
          try { video.currentTime = t; } catch { /* seeking */ }
        }
      }

      // emit state to parent for the drag effect
      const dockOpacity = clamp((p - P_DOCK_START) / (1 - P_DOCK_START), 0, 1);
      const dragY       = smoothstep(dockOpacity) * 55; // px the camera has "fallen" inside sticky
      onScroll?.({ progress: p, dockOpacity, dragY });

      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [onScroll]);

  const handleLoaded = useCallback(() => {
    setVideoReady(true);
    const v = videoRef.current;
    if (v) { v.pause(); v.muted = true; }
  }, []);
  const handleError = useCallback(() => setVideoError(true), []);

  // ── derived opacities ──
  const introOpacity = clamp(1 - progress / (P_INTRO_END * 0.85), 0, 1);

  // All labels fade in together, hold, then fade out together
  const labelsIn  = smoothstep(clamp((progress - P_ZOOM_IN_END)   / (P_LABELS_FADE_IN  - P_ZOOM_IN_END),   0, 1));
  const labelsOut = smoothstep(clamp((P_LABELS_FADE_OUT - progress) / (P_LABELS_FADE_OUT - P_LABELS_HOLD_END), 0, 1));
  const labelsOpacity = Math.min(labelsIn, labelsOut);

  // Mesin terbuka
  const mesinIn  = smoothstep(clamp((progress - P_MESIN_IN)  / 0.03, 0, 1));
  const mesinOut = smoothstep(clamp((P_MESIN_OUT - progress) / 0.03, 0, 1));
  const mesinOpacity = Math.min(mesinIn, mesinOut);

  const dockOpacity = clamp((progress - P_DOCK_START) / (1 - P_DOCK_START), 0, 1);
  const dragY = smoothstep(dockOpacity) * 55;
  const scrollHintOpacity = clamp(1 - progress * 10, 0, 1);

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
        {/* ── VIDEO ── */}
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          className="absolute inset-0 h-full w-full"
          style={{ objectFit: 'contain', background: VIDEO_BG, opacity: 1 - dockOpacity }}
          playsInline muted preload="auto"
          onLoadedMetadata={handleLoaded}
          onCanPlay={handleLoaded}
          onError={handleError}
        />

        {/* ── DOCK IMAGE — crossfades in, then drags down ── */}
        {rect.width > 0 && (
          <img
            src={DOCK_IMAGE_SRC}
            alt="Camera — front view"
            className="pointer-events-none absolute"
            style={{
              left:   rect.left + (DOCK_RECT.left  / 100) * rect.width,
              top:    rect.top  + (DOCK_RECT.top   / 100) * rect.height,
              width:  (DOCK_RECT.width  / 100) * rect.width,
              height: (DOCK_RECT.height / 100) * rect.height,
              opacity: dockOpacity,
              objectFit: 'contain',
              transform: `translateY(${dragY}vh)`,
              transition: 'transform 0.05s linear',
            }}
          />
        )}

        {/* ── MESIN TERBUKA OVERLAY ── */}
        {mesinOpacity > 0.01 && rect.width > 0 && (
          <div
            className="pointer-events-none absolute inset-0 z-25 flex items-center justify-center"
            style={{ opacity: mesinOpacity }}
          >
            <div className="relative" style={{ width: rect.width, height: rect.height }}>
              <img
                src={MESIN_IMAGE_SRC}
                alt="Exploded view"
                className="absolute inset-0 h-full w-full object-contain"
              />
              {/* Mesin labels */}
              {MESIN_SPECS.map((s) => {
                const px = (parseFloat(s.x) / 100) * rect.width;
                const py = (parseFloat(s.y) / 100) * rect.height;
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
                        <span className="glass whitespace-nowrap rounded-lg px-3 py-1.5 shadow-glass">
                          <span className="mr-1.5 font-display text-[9px] tracking-[0.3em] text-cyber">{s.n}</span>
                          <span className="font-display text-[11px] font-medium text-white/90">{s.label}</span>
                        </span>
                        <div className="h-px w-6 bg-gradient-to-r from-cyber/60 to-transparent" />
                      </>
                    )}
                    <div className="relative shrink-0">
                      <div className="absolute -inset-1.5 rounded-full border border-cyber/30 animate-pulseRing" />
                      <div className="h-2 w-2 rounded-full bg-cyber shadow-glow-cyan" />
                    </div>
                    {s.side === 'left' && (
                      <>
                        <div className="h-px w-6 bg-gradient-to-l from-cyber/60 to-transparent" />
                        <span className="glass whitespace-nowrap rounded-lg px-3 py-1.5 shadow-glass">
                          <span className="mr-1.5 font-display text-[9px] tracking-[0.3em] text-cyber">{s.n}</span>
                          <span className="font-display text-[11px] font-medium text-white/90">{s.label}</span>
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
              {/* Mesin heading */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                <span className="font-display text-[10px] tracking-[0.4em] text-cyber/70">
                  PRECISION ENGINEERING — INTERNAL ARCHITECTURE
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── NAV BAR ── */}
        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-5 sm:px-10">
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

        {/* ── PHASE 0: Hero intro ── */}
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

        {/* ── PHASE 1: ALL HUD labels simultaneously ── */}
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

            {/* Label phase counter / context */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center">
              <span className="font-display text-[9px] tracking-[0.4em] text-accent/60">
                25 PRECISION COMPONENTS
              </span>
            </div>
          </div>
        )}

        {/* ── SCROLL INDICATOR ── */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex flex-col items-center gap-2"
          style={{ opacity: scrollHintOpacity }}
        >
          <span className="font-display text-[10px] tracking-[0.4em] text-white/35">SCROLL TO EXPLORE</span>
          <div className="grid h-9 w-6 place-items-start justify-center rounded-full border border-white/20 pt-1.5">
            <div className="h-1.5 w-1 animate-bounce rounded-full bg-accent" />
          </div>
        </div>

        {/* ── PROGRESS RAIL ── */}
        <div className="absolute bottom-0 left-0 z-30 h-0.5 w-full bg-white/5">
          <div className="h-full bg-gradient-to-r from-accent to-cyber" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* ── LOADING / ERROR ── */}
        {!videoReady && !videoError && (
          <div className="absolute inset-0 z-40 grid place-items-center" style={{ background: VIDEO_BG }}>
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border border-white/10 border-t-accent" />
              <span className="font-display text-[10px] tracking-[0.4em] text-white/40">LOADING CINEMATIC</span>
            </div>
          </div>
        )}
        {videoError && (
          <div className="absolute inset-0 z-40 grid place-items-center px-6 text-center" style={{ background: VIDEO_BG }}>
            <div className="flex flex-col items-center gap-3">
              <span className="font-display text-[10px] tracking-[0.4em] text-accent/70">VIDEO NOT FOUND</span>
              <p className="max-w-xs font-display text-xs text-white/40">
                Place <code className="text-white/70">{VIDEO_SRC}</code> in <code className="text-white/70">public/</code> and reload.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

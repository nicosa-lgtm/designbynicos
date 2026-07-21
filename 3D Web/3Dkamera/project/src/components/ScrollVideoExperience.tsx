import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

// ============================================================================
// ASSETS — drop your files into /public with these exact names, or change
// the paths below to match whatever you actually named them.
// ============================================================================
const VIDEO_SRC = '/kamera-hero.mp4';        // your new 16:9, 10s video
const DOCK_IMAGE_SRC = '/camera-front.png';  // image-removebg-preview.png (front pose, transparent bg)

export const VIDEO_BG = '#000000'; // sampled directly from the new video — it's true black now

// ============================================================================
// VIDEO TIMING — must match your actual .mp4
// ============================================================================
const VIDEO_DURATION = 10;      // seconds
const VIDEO_ASPECT = 16 / 9;
const T_INTRO = 1.2;            // video time where the intro rotation settles
const T_ZOOM = 1.89;            // ← your zoom/label pose
const T_END = VIDEO_DURATION - 0.05; // stop just shy of the true last frame

// ============================================================================
// SCROLL MAP — everything below is a FRACTION of total scroll progress
// (0 = top of section, 1 = bottom), not seconds. Scrolling up runs every
// phase in reverse automatically since it's a pure function of scroll
// position — that's what gives you the "look at the labels again" behavior.
// ============================================================================
const P_INTRO_END       = 0.08; // 0 -> T_INTRO,  hero text fades out
const P_ZOOM_IN_END     = 0.14; // T_INTRO -> T_ZOOM, camera rotates into the label pose
const P_LABELS_END      = 0.75; // video FROZEN at T_ZOOM while all labels scrub past
const P_ROTATE_BACK_END = 0.92; // T_ZOOM -> T_END, rotates back to front
// P_ROTATE_BACK_END -> 1.0 : frozen on the last frame, crossfades video -> DOCK_IMAGE_SRC

// This is your main "scroll speed" knob. 25 labels need real scroll distance
// to read comfortably without feeling rushed — raise this if it still feels
// too fast, lower it if there's dead scrolling with nothing changing.
const SECTION_VH = 900;

// How wide (as a fraction of the whole P_ZOOM_IN_END→P_LABELS_END range) each
// label's own on-screen window is, and how much of that window is spent
// fading in/out vs fully visible. Bigger LABEL_WINDOW = more labels visible
// at once (you asked for "sometimes 2 at a time" — this is tuned for that).
const LABEL_WINDOW = 0.085;
const LABEL_FADE = 0.4;

// ============================================================================
// LABEL DATA — x/y read directly off detail.png (percent of that frame,
// which is the same pose/crop as the video at T_ZOOM). If a pin isn't
// exactly on its button once you preview this, nudge its x/y here —
// nothing else needs to change.
// ============================================================================
const HUD_SPECS: { n: string; label: string; x: string; y: string; side: 'left' | 'right' }[] = [
  { n: '01', label: 'Mode Dial',                    x: '38.9%', y: '24.4%', side: 'left' },
  { n: '02', label: 'Hot Shoe Mount',                x: '51.6%', y: '15.9%', side: 'left' },
  { n: '03', label: 'Shutter Button',                x: '45.3%', y: '28.1%', side: 'right' },
  { n: '04', label: 'Rear Command Dial',             x: '61.3%', y: '33.0%', side: 'right' },
  { n: '05', label: 'Grip',                          x: '64.6%', y: '62.5%', side: 'right' },
  { n: '06', label: 'Viewfinder',                    x: '35.8%', y: '33.5%', side: 'left' },
  { n: '07', label: 'Built-in Flash',                x: '53.8%', y: '11.2%', side: 'left' },
  { n: '08', label: 'Top LCD Display',               x: '41.9%', y: '16.5%', side: 'left' },
  { n: '09', label: 'Exposure Compensation Dial',    x: '55.6%', y: '23.4%', side: 'right' },
  { n: '10', label: 'Front Command Dial',            x: '58.3%', y: '32.7%', side: 'right' },
  { n: '11', label: 'Strap Eyelet',                  x: '62.7%', y: '37.4%', side: 'right' },
  { n: '12', label: 'AF Assist / Self-Timer Lamp',   x: '43.7%', y: '36.8%', side: 'left' },
  { n: '13', label: 'Function (Fn) Button',          x: '34.8%', y: '40.6%', side: 'left' },
  { n: '14', label: 'Lens Release Button',           x: '44.7%', y: '46.7%', side: 'left' },
  { n: '15', label: 'Focus Ring',                    x: '34.0%', y: '53.3%', side: 'left' },
  { n: '16', label: 'Zoom Ring',                     x: '33.9%', y: '59.1%', side: 'left' },
  { n: '17', label: 'Lens',                          x: '32.8%', y: '66.3%', side: 'left' },
  { n: '18', label: 'Filter Thread',                 x: '35.6%', y: '71.7%', side: 'left' },
  { n: '19', label: 'Microphone Input',              x: '65.7%', y: '48.6%', side: 'right' },
  { n: '20', label: 'Headphone Output',              x: '65.7%', y: '54.2%', side: 'right' },
  { n: '21', label: 'USB-C Port',                    x: '65.6%', y: '58.4%', side: 'right' },
  { n: '22', label: 'HDMI Port',                     x: '64.6%', y: '66.5%', side: 'right' },
  { n: '23', label: 'Speaker',                       x: '62.0%', y: '68.4%', side: 'right' },
  { n: '24', label: 'Memory Card Slot',              x: '59.3%', y: '63.3%', side: 'right' },
  { n: '25', label: 'Battery Door',                  x: '57.1%', y: '73.3%', side: 'right' },
];

// Dock (handoff) image alignment — computed by scaling/positioning
// camera-front.png so its camera matches the size/position of the camera in
// the video's very last frame. Expressed as % of the video's own box so it
// stays correct at any screen size.
const DOCK_RECT = { left: 22.3, top: 15.6, width: 48.1, height: 60.7 };

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function smoothstep(t: number) {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}
/** Trapezoid: fades in over the first LABEL_FADE of the window, holds, fades
 *  out over the last LABEL_FADE. Pure function of `p` so it reverses cleanly
 *  on scroll-up. */
function windowOpacity(p: number, start: number, width: number, fade: number) {
  const local = (p - start) / width;
  if (local <= 0 || local >= 1) return 0;
  const rise = smoothstep(local / fade);
  const fall = smoothstep((1 - local) / fade);
  return Math.min(rise, fall);
}

/** Tracks the container size and returns the actual on-screen rect (in px,
 *  relative to the container) that the video occupies once object-fit:
 *  contain has letterboxed it. Every label anchors to THIS rect instead of
 *  the full container — that's what keeps pins stuck to the camera on any
 *  screen size/aspect instead of drifting into the black bars. */
function useVideoRect(containerRef: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
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
    if (containerAspect > VIDEO_ASPECT) {
      height = h;
      width = h * VIDEO_ASPECT;
    } else {
      width = w;
      height = w / VIDEO_ASPECT;
    }
    return { left: (w - width) / 2, top: (h - height) / 2, width, height };
  }, [size]);
}

export default function ScrollVideoExperience() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null); // tall scroll driver (SECTION_VH)
  const stickyRef = useRef<HTMLDivElement | null>(null);  // pinned 100vh viewport
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastSeekRef = useRef(0);
  const rect = useVideoRect(stickyRef);

  useEffect(() => {
    const update = () => {
      const wrapper = wrapperRef.current;
      const video = videoRef.current;
      if (!wrapper || !video) {
        rafRef.current = requestAnimationFrame(update);
        return;
      }
      const box = wrapper.getBoundingClientRect();
      const total = box.height - window.innerHeight;
      const scrolled = clamp(-box.top, 0, total);
      const p = total > 0 ? scrolled / total : 0;
      setProgress(p);

      let target: number;
      if (p < P_INTRO_END) {
        target = lerp(0, T_INTRO, p / P_INTRO_END);
      } else if (p < P_ZOOM_IN_END) {
        target = lerp(T_INTRO, T_ZOOM, (p - P_INTRO_END) / (P_ZOOM_IN_END - P_INTRO_END));
      } else if (p < P_LABELS_END) {
        target = T_ZOOM;
      } else if (p < P_ROTATE_BACK_END) {
        target = lerp(T_ZOOM, T_END, (p - P_LABELS_END) / (P_ROTATE_BACK_END - P_LABELS_END));
      } else {
        target = T_END;
      }

      if (video.readyState >= 1 && video.duration && !Number.isNaN(video.duration)) {
        const t = clamp(target, 0, video.duration);
        if (
          Math.abs(video.currentTime - t) > 0.01 &&
          performance.now() - lastSeekRef.current > 16
        ) {
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

  const introOpacity = clamp(1 - progress / (P_INTRO_END * 0.9), 0, 1);
  const labelsPhase = clamp(
    (progress - P_ZOOM_IN_END) / (P_LABELS_END - P_ZOOM_IN_END),
    0,
    1
  );
  const dockOpacity = clamp(
    (progress - P_ROTATE_BACK_END) / (1 - P_ROTATE_BACK_END),
    0,
    1
  );
  const scrollHintOpacity = clamp(1 - progress * 8, 0, 1);

  const N = HUD_SPECS.length;
  const spacing = N > 1 ? (1 - LABEL_WINDOW) / (N - 1) : 0;

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
          playsInline
          muted
          preload="auto"
          onLoadedMetadata={handleLoaded}
          onCanPlay={handleLoaded}
          onError={handleError}
        />

        {/* ── DOCK IMAGE — crossfades in as the video finishes, aligned to
             the exact same on-screen rect the video uses ── */}
        {rect.width > 0 && (
          <img
            src={DOCK_IMAGE_SRC}
            alt="Camera — front view"
            className="pointer-events-none absolute"
            style={{
              left: rect.left + (DOCK_RECT.left / 100) * rect.width,
              top: rect.top + (DOCK_RECT.top / 100) * rect.height,
              width: (DOCK_RECT.width / 100) * rect.width,
              height: (DOCK_RECT.height / 100) * rect.height,
              opacity: dockOpacity,
              objectFit: 'contain',
            }}
          />
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
          style={{ opacity: introOpacity, transition: 'opacity 0.3s' }}
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

        {/* ── PHASE 1: HUD callouts — 25 labels, scroll-scrubbed, reversible ── */}
        {rect.width > 0 && (
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{ opacity: smoothstep(clamp(labelsPhase * 6, 0, 1)) * smoothstep(clamp((1 - labelsPhase) * 6, 0, 1)) }}
          >
            {HUD_SPECS.map((s, i) => {
              const start = i * spacing;
              const local = windowOpacity(labelsPhase, start, LABEL_WINDOW, LABEL_FADE);
              if (local <= 0.01) return null;
              const px = rect.left + (parseFloat(s.x) / 100) * rect.width;
              const py = rect.top + (parseFloat(s.y) / 100) * rect.height;
              const tx = lerp(s.side === 'left' ? -10 : 10, 0, local);
              return (
                <div
                  key={s.n}
                  className="absolute flex items-center gap-2"
                  style={{
                    left: px,
                    top: py,
                    transform: `translate(${s.side === 'right' ? '-100%' : '0'},-50%) translateX(${tx}px)`,
                    opacity: local,
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
                  {/* dot on the actual button */}
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
          </div>
        )}

        {/* ── SCROLL INDICATOR ── */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex flex-col items-center gap-2"
          style={{ opacity: scrollHintOpacity }}
        >
          <span className="font-display text-[10px] tracking-[0.4em] text-white/35">
            SCROLL TO EXPLORE
          </span>
          <div className="grid h-9 w-6 place-items-start justify-center rounded-full border border-white/20 pt-1.5">
            <div className="h-1.5 w-1 animate-bounce rounded-full bg-accent" />
          </div>
        </div>

        {/* ── PROGRESS RAIL ── */}
        <div className="absolute bottom-0 left-0 z-30 h-0.5 w-full bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-accent to-cyber"
            style={{ width: `${progress * 100}%` }}
          />
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
                Place <code className="text-white/70">{VIDEO_SRC}</code> and{' '}
                <code className="text-white/70">{DOCK_IMAGE_SRC}</code> in{' '}
                <code className="text-white/70">public/</code> and reload.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

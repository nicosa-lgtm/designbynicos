import { useEffect, useRef, useState, useCallback } from 'react';

const VIDEO_SRC  = '/kamera-hero.mp4';
const LABEL_IMG  = '/image-removebg-preview.png';
export const VIDEO_BG = '#000000';

const VIDEO_DURATION = 10;
const T_PAUSE        = 3.5;

// Scroll phases
const P_HERO_END   = 0.06;
const P_PLAY_END   = 0.42;
const P_LABELS_OUT = 0.70;
const P_PLAY2_END  = 0.95;

export const SECTION_VH = 500;

// ─── Front-facing camera label map ───────────────────────────────────────────
// dotX/dotY: position on the camera image (% of image bounding box)
// textY:     explicit vertical position for the label text (% of viewport)
//            to prevent overlap between labels on the same side
// ─────────────────────────────────────────────────────────────────────────────

// The camera image is displayed at ~48vw wide, centered.
// On a 16:9 viewport the image occupies roughly:
//   x: 26% – 74% of viewport width
//   y: 12% – 86% of viewport height  (assuming ~1.1:1 aspect ratio image)

const IMG_VX = 26;   // image left edge % of viewport w
const IMG_VW = 48;   // image width     % of viewport w
const IMG_VY = 12;   // image top edge  % of viewport h
const IMG_VH = 74;   // image height    % of viewport h

interface LabelSpec {
  n: string;
  label: string;
  dotX: number;   // % of image width
  dotY: number;   // % of image height
  textY: number;  // % of viewport height — explicit to avoid stacking
  side: 'left' | 'right';
}

// 12 labels: 6 per side, well spread vertically, text placed outside camera body
const LABELS: LabelSpec[] = [
  // ── LEFT side (text anchored at left edge of screen) ──
  { n:'01', label:'Mode Dial',        dotX:22, dotY:21, textY:22, side:'left'  },
  { n:'02', label:'Top LCD Display',  dotX:35, dotY:13, textY:13, side:'left'  },
  { n:'03', label:'Lens Release',     dotX:38, dotY:46, textY:43, side:'left'  },
  { n:'04', label:'Focus Ring',       dotX:21, dotY:57, textY:55, side:'left'  },
  { n:'05', label:'Lens',             dotX:30, dotY:67, textY:66, side:'left'  },
  { n:'06', label:'Filter Thread',    dotX:25, dotY:78, textY:78, side:'left'  },
  // ── RIGHT side (text anchored at right edge of screen) ──
  { n:'07', label:'Hot Shoe Mount',   dotX:54, dotY: 7, textY: 8, side:'right' },
  { n:'08', label:'Shutter Button',   dotX:76, dotY:24, textY:21, side:'right' },
  { n:'09', label:'Exp. Comp. Dial',  dotX:82, dotY:17, textY:14, side:'right' },
  { n:'10', label:'Grip',             dotX:87, dotY:55, textY:55, side:'right' },
  { n:'11', label:'USB-C Port',       dotX:85, dotY:48, textY:45, side:'right' },
  { n:'12', label:'Battery Door',     dotX:67, dotY:84, textY:80, side:'right' },
];

// Convert label dot coords (% of image) → % of viewport
function dotVP(dotX: number, dotY: number) {
  return {
    vx: IMG_VX + (dotX / 100) * IMG_VW,
    vy: IMG_VY + (dotY / 100) * IMG_VH,
  };
}

// Text anchor positions in viewport %
const TEXT_LEFT_X  = 1;   // left labels: text right edge at ~22% (leaves 21% for text)
const TEXT_RIGHT_X = 99;  // right labels: text left edge at ~78%
const LINE_END_LEFT  = 23; // where line ends on left side (just before text column)
const LINE_END_RIGHT = 77; // where line ends on right side

function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function smoothstep(t: number) { const c = clamp(t, 0, 1); return c * c * (3 - 2 * c); }

export default function ScrollVideoExperience() {
  const videoRef    = useRef<HTMLVideoElement | null>(null);
  const wrapperRef  = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress]     = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const rafRef      = useRef<number | null>(null);
  const lastSeekRef = useRef(0);

  useEffect(() => {
    const update = () => {
      const wrapper = wrapperRef.current;
      const video   = videoRef.current;
      if (!wrapper || !video) { rafRef.current = requestAnimationFrame(update); return; }

      const box    = wrapper.getBoundingClientRect();
      const total  = box.height - window.innerHeight;
      const p      = total > 0 ? clamp(-box.top / total, 0, 1) : 0;
      setProgress(p);

      let target: number;
      if      (p < P_HERO_END)   target = 0;
      else if (p < P_PLAY_END)   target = lerp(0, T_PAUSE, (p - P_HERO_END) / (P_PLAY_END - P_HERO_END));
      else if (p < P_LABELS_OUT) target = T_PAUSE;
      else if (p < P_PLAY2_END)  target = lerp(T_PAUSE, VIDEO_DURATION - 0.05, (p - P_LABELS_OUT) / (P_PLAY2_END - P_LABELS_OUT));
      else                       target = VIDEO_DURATION - 0.05;

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

  const introOpacity  = smoothstep(clamp(1 - progress / (P_HERO_END * 0.9), 0, 1));
  const labelsIn      = smoothstep(clamp((progress - P_PLAY_END)   / 0.05, 0, 1));
  const labelsOut     = smoothstep(clamp((P_LABELS_OUT - progress) / 0.05, 0, 1));
  const labelsOpacity = Math.min(labelsIn, labelsOut);
  // video fades out while label image fades in
  const videoOpacity  = 1 - smoothstep(clamp((progress - (P_PLAY_END - 0.04)) / 0.06, 0, 1))
                          * smoothstep(clamp((P_LABELS_OUT - progress)          / 0.06, 0, 1));
  const scrollHint    = clamp(1 - progress * 12, 0, 1);

  return (
    <section
      ref={wrapperRef}
      className="relative w-full"
      style={{ height: `${SECTION_VH}vh` }}
      aria-label="Camera showcase"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ background: VIDEO_BG }}>

        {/* Progress bar — top */}
        <div className="absolute top-0 left-0 z-40 h-0.5 w-full bg-white/5">
          <div className="h-full bg-gradient-to-r from-accent to-cyber" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* Video (fades out during label phase) */}
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          className="absolute inset-0 h-full w-full"
          style={{ objectFit: 'contain', background: VIDEO_BG, opacity: videoOpacity }}
          playsInline muted preload="auto"
          onLoadedMetadata={handleLoaded}
          onCanPlay={handleLoaded}
          onError={handleError}
        />

        {/* Label phase: front-facing PNG + HUD overlay */}
        {labelsOpacity > 0.005 && (
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{ opacity: labelsOpacity }}
          >
            {/* Camera image — front facing, transparent background */}
            <img
              src={LABEL_IMG}
              alt="Camera — front view"
              className="absolute object-contain"
              style={{
                width:  `${IMG_VW}vw`,
                height: `${IMG_VH}vh`,
                left:   `${IMG_VX}%`,
                top:    `${IMG_VY}%`,
                filter: 'drop-shadow(0 0 40px rgba(212,255,63,0.10))',
              }}
            />

            {/* SVG lines + dots */}
            <svg
              className="absolute inset-0"
              width="100%" height="100%"
              style={{ overflow: 'visible' }}
            >
              {LABELS.map((s) => {
                const { vx, vy } = dotVP(s.dotX, s.dotY);
                const lineEndX = s.side === 'left' ? LINE_END_LEFT : LINE_END_RIGHT;
                const ty       = s.textY;
                return (
                  <g key={s.n}>
                    {/* line from dot → text column */}
                    <line
                      x1={`${vx}%`} y1={`${vy}%`}
                      x2={`${lineEndX}%`} y2={`${ty}%`}
                      stroke="rgba(212,255,63,0.35)"
                      strokeWidth="0.8"
                    />
                    {/* dot on camera button */}
                    <circle cx={`${vx}%`} cy={`${vy}%`} r="3.5" fill="#d4ff3f" />
                    <circle cx={`${vx}%`} cy={`${vy}%`} r="6" fill="none" stroke="rgba(212,255,63,0.3)" strokeWidth="1" />
                  </g>
                );
              })}
            </svg>

            {/* Text labels — outside camera body, no background */}
            {LABELS.map((s) => (
              <div
                key={s.n}
                className="absolute flex items-baseline gap-1.5"
                style={{
                  top:       `${s.textY}%`,
                  transform: 'translateY(-50%)',
                  ...(s.side === 'left'
                    ? { left: `${TEXT_LEFT_X}%`, right: `${100 - LINE_END_LEFT + 1}%`, justifyContent: 'flex-end' }
                    : { left: `${LINE_END_RIGHT + 1}%`, right: `${100 - TEXT_RIGHT_X}%`, justifyContent: 'flex-start' }),
                }}
              >
                <span
                  className="font-display font-semibold"
                  style={{ fontSize: '9px', letterSpacing: '0.3em', color: '#d4ff3f', opacity: 0.8 }}
                >
                  {s.n}
                </span>
                <span
                  className="font-display whitespace-nowrap"
                  style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}
                >
                  {s.label}
                </span>
              </div>
            ))}

            {/* Component count */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2">
              <span className="font-display text-[9px] tracking-[0.4em] text-accent/50">
                KEY COMPONENTS
              </span>
            </div>
          </div>
        )}

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

        {/* Scroll indicator */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex flex-col items-center gap-2"
          style={{ opacity: scrollHint }}
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

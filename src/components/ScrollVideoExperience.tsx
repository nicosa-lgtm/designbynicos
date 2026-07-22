import { useEffect, useRef, useState, useCallback } from 'react';

export const VIDEO_BG  = '#000000';
const VIDEO_SRC        = '/kamera-hero.mp4';
export const CAMERA_PNG = '/image-removebg-preview.png';

// ── Scroll phases ──────────────────────────────────────────────────────────
const P_HERO_END     = 0.05; // hero text fades
const P_PLAY1_END    = 0.33; // video plays 0 → T_CAM  (3/4-angle view)
const P_LABELS1_OUT  = 0.52; // exterior labels shown, then fade
const P_PLAY2_END    = 0.70; // video plays T_CAM → T_EXPLODE
const P_LABELS2_OUT  = 0.84; // internals labels shown, then fade
const P_PLAY3_END    = 0.90; // video plays T_EXPLODE → end
const P_PNG_IN       = 0.93; // video out, PNG fades in
// 0.93-1.00: PNG visible, drifts downward slightly (entering next section)

export const SECTION_VH = 680;

const T_CAM     = 3.2;   // seconds: 3/4-angle pause frame
const T_EXPLODE = 7.0;   // seconds: exploded-view pause frame

// ── HUD label types ─────────────────────────────────────────────────────────
// All coordinates are % of VIEWPORT (video is full-screen, no image-rect math).
interface HudLabel {
  n: string;
  label: string;
  dotX: number;  // % of viewport width  — where dot sits ON the video frame
  dotY: number;  // % of viewport height
  lineX: number; // % — x where line terminates (edge of text column)
  textY: number; // % — explicit y for text div to prevent stacking
  side: 'left' | 'right';
}

// ── Phase 1 labels: 3/4-angle camera (T_CAM frame) ─────────────────────────
// Video frame at ~3.2s shows camera in 3/4-left view filling ~35-83% x, 20-76% y.
const CAM_LABELS: HudLabel[] = [
  // LEFT – text column 0-21%, line ends at 22%
  { n:'01', label:'Mode Dial',        dotX:38, dotY:23, lineX:22, textY:20, side:'left'  },
  { n:'02', label:'Top LCD Display',  dotX:44, dotY:18, lineX:22, textY:13, side:'left'  },
  { n:'03', label:'Lens Release',     dotX:39, dotY:44, lineX:22, textY:41, side:'left'  },
  { n:'04', label:'Focus Ring',       dotX:35, dotY:54, lineX:22, textY:54, side:'left'  },
  { n:'05', label:'Zoom Ring',        dotX:35, dotY:60, lineX:22, textY:63, side:'left'  },
  { n:'06', label:'Lens',             dotX:38, dotY:67, lineX:22, textY:71, side:'left'  },
  // RIGHT – text column 78-100%, line ends at 78%
  { n:'07', label:'Hot Shoe Mount',   dotX:57, dotY:18, lineX:78, textY:13, side:'right' },
  { n:'08', label:'Shutter Button',   dotX:70, dotY:24, lineX:78, textY:22, side:'right' },
  { n:'09', label:'Rear Command Dial',dotX:78, dotY:33, lineX:78, textY:33, side:'right' },
  { n:'10', label:'USB-C / HDMI',     dotX:83, dotY:50, lineX:78, textY:46, side:'right' },
  { n:'11', label:'Grip',             dotX:81, dotY:57, lineX:78, textY:56, side:'right' },
  { n:'12', label:'Memory Card Slot', dotX:79, dotY:62, lineX:78, textY:63, side:'right' },
];

// ── Phase 2 labels: exploded/internals (T_EXPLODE frame) ────────────────────
// Video at ~7s shows full camera explosion filling 5-95% of frame.
const EXPLODE_LABELS: HudLabel[] = [
  // LEFT – lens/optics on the left side of the explosion
  { n:'I1', label:'Full Lens Assembly',    dotX:14, dotY:42, lineX:22, textY:37, side:'left'  },
  { n:'I2', label:'Optical Elements',      dotX:22, dotY:44, lineX:22, textY:50, side:'left'  },
  { n:'I3', label:'Zoom Barrel',           dotX:29, dotY:37, lineX:22, textY:30, side:'left'  },
  { n:'I4', label:'Viewfinder (EVF)',      dotX:57, dotY: 8, lineX:22, textY:10, side:'left'  },
  // RIGHT – sensor, board, ports, battery
  { n:'I5', label:'Image Sensor (CMOS)',   dotX:52, dotY:40, lineX:78, textY:33, side:'right' },
  { n:'I6', label:'Main Processor PCB',   dotX:65, dotY:43, lineX:78, textY:42, side:'right' },
  { n:'I7', label:'I/O Port Module',       dotX:81, dotY:49, lineX:78, textY:52, side:'right' },
  { n:'I8', label:'Battery Module',        dotX:73, dotY:62, lineX:78, textY:62, side:'right' },
];

function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function smoothstep(t: number) { const c = clamp(t, 0, 1); return c * c * (3 - 2 * c); }

function HudOverlay({ labels, opacity }: { labels: HudLabel[]; opacity: number }) {
  if (opacity < 0.005) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20" style={{ opacity }}>
      {/* SVG lines + dots */}
      <svg className="absolute inset-0" width="100%" height="100%">
        {labels.map((s) => (
          <g key={s.n}>
            <line
              x1={`${s.dotX}%`} y1={`${s.dotY}%`}
              x2={`${s.lineX}%`} y2={`${s.textY}%`}
              stroke="rgba(212,255,63,0.38)"
              strokeWidth="0.8"
            />
            <circle cx={`${s.dotX}%`} cy={`${s.dotY}%`} r="3.5" fill="#d4ff3f" />
            <circle cx={`${s.dotX}%`} cy={`${s.dotY}%`} r="6.5" fill="none"
              stroke="rgba(212,255,63,0.28)" strokeWidth="1" />
          </g>
        ))}
      </svg>
      {/* Text labels — no background */}
      {labels.map((s) => (
        <div
          key={s.n}
          className="absolute flex items-baseline gap-1.5"
          style={{
            top:       `${s.textY}%`,
            transform: 'translateY(-50%)',
            ...(s.side === 'left'
              ? { left: '1%', right: `${100 - s.lineX + 1}%`, justifyContent: 'flex-end', textAlign: 'right' }
              : { left: `${s.lineX + 1}%`, right: '1%', justifyContent: 'flex-start' }),
          }}
        >
          <span style={{ fontSize: '9px', letterSpacing: '0.3em', color: '#d4ff3f',
            opacity: 0.85, fontFamily: 'inherit', fontWeight: 600 }}>
            {s.n}
          </span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.88)',
            whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ScrollVideoExperience() {
  const videoRef   = useRef<HTMLVideoElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress]     = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const rafRef      = useRef<number | null>(null);
  const lastSeekRef = useRef(0);

  useEffect(() => {
    const update = () => {
      const wrapper = wrapperRef.current;
      const video   = videoRef.current;
      if (!wrapper) { rafRef.current = requestAnimationFrame(update); return; }

      const box   = wrapper.getBoundingClientRect();
      const total = box.height - window.innerHeight;
      const p     = total > 0 ? clamp(-box.top / total, 0, 1) : 0;
      setProgress(p);

      if (video && video.readyState >= 1 && video.duration && !Number.isNaN(video.duration)) {
        const dur = video.duration;
        let target: number;
        if      (p < P_HERO_END)    target = 0;
        else if (p < P_PLAY1_END)   target = lerp(0,          T_CAM,     (p - P_HERO_END)    / (P_PLAY1_END   - P_HERO_END));
        else if (p < P_LABELS1_OUT) target = T_CAM;
        else if (p < P_PLAY2_END)   target = lerp(T_CAM,      T_EXPLODE, (p - P_LABELS1_OUT) / (P_PLAY2_END   - P_LABELS1_OUT));
        else if (p < P_LABELS2_OUT) target = T_EXPLODE;
        else if (p < P_PLAY3_END)   target = lerp(T_EXPLODE,  dur - 0.05,(p - P_LABELS2_OUT) / (P_PLAY3_END   - P_LABELS2_OUT));
        else                        target = dur - 0.05;

        const t = clamp(target, 0, dur);
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

  // Label opacities
  const labels1In  = smoothstep(clamp((progress - P_PLAY1_END)    / 0.04, 0, 1));
  const labels1Out = smoothstep(clamp((P_LABELS1_OUT - progress)  / 0.04, 0, 1));
  const labels1Opacity = Math.min(labels1In, labels1Out);

  const labels2In  = smoothstep(clamp((progress - P_PLAY2_END)    / 0.04, 0, 1));
  const labels2Out = smoothstep(clamp((P_LABELS2_OUT - progress)  / 0.04, 0, 1));
  const labels2Opacity = Math.min(labels2In, labels2Out);

  // PNG fades in after video ends
  const pngOpacity = smoothstep(clamp((progress - P_PNG_IN) / 0.05, 0, 1));
  // slight downward drift so PNG appears to "fall" into next section
  const pngDrift   = clamp((progress - P_PNG_IN) / (1 - P_PNG_IN), 0, 1) * 8; // vh

  const introOpacity = smoothstep(clamp(1 - progress / (P_HERO_END * 0.85), 0, 1));
  const scrollHint   = clamp(1 - progress * 14, 0, 1);

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
          <div className="h-full bg-gradient-to-r from-accent to-cyber"
            style={{ width: `${progress * 100}%` }} />
        </div>

        {/* Full video — always visible, never replaced during scroll */}
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

        {/* Phase 1 HUD — 3/4 camera exterior labels */}
        <HudOverlay labels={CAM_LABELS} opacity={labels1Opacity} />

        {/* Phase 2 HUD — exploded internals labels */}
        <HudOverlay labels={EXPLODE_LABELS} opacity={labels2Opacity} />

        {/* PNG camera — fades in at the very end, drifts down into S2 */}
        {pngOpacity > 0.005 && (
          <div
            className="pointer-events-none absolute inset-0 z-25 flex items-center justify-center"
            style={{ opacity: pngOpacity }}
          >
            <img
              src={CAMERA_PNG}
              alt="Aura Cine Series X"
              style={{
                width: '52vw',
                maxWidth: '580px',
                transform: `translateY(${pngDrift}vh)`,
                filter: 'drop-shadow(0 20px 60px rgba(212,255,63,0.12))',
                transition: 'none',
              }}
            />
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

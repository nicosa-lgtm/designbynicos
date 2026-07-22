import { useEffect, useRef, useState } from 'react';
import { CAMERA_PNG } from '../components/ScrollVideoExperience';

interface CopyData {
  eyebrow: string;
  heading: string;
  sub: string;
  body: string;
}

const ROW1_LEFT: CopyData = {
  eyebrow: 'FULL-FRAME MASTERY',
  heading: 'See what others miss.',
  sub: '50.1MP BSI Stacked CMOS',
  body: 'A sensor architecture that captures 16+ stops of dynamic range — from the faintest shadow to a sun-blown highlight — all in a single RAW frame, no compromise.',
};
const ROW1_RIGHT: CopyData = {
  eyebrow: 'INTELLIGENT AUTOFOCUS',
  heading: 'Lock on.\nNever let go.',
  sub: 'Neural AF · 0.03s Acquisition',
  body: 'The Series X reads eyes, faces, vehicles and athletes in real time. Learns motion patterns and predicts trajectories so the decisive moment is always sharp.',
};
const ROW2_LEFT: CopyData = {
  eyebrow: 'CINEMA-GRADE VIDEO',
  heading: 'Every frame, a masterpiece.',
  sub: '8K 60fps · ProRes RAW Internal',
  body: 'Record directly to CFexpress at up to 8192 × 4320 with 16-bit linear color. No proxies, no external recorders. Pure cinematic data, from lens to card.',
};
const ROW2_RIGHT: CopyData = {
  eyebrow: 'BUILT FOR THE FIELD',
  heading: 'Rain. Dust.\nSub-zero.',
  sub: 'IP56 Sealed · Magnesium Unibody',
  body: 'Aircraft-grade magnesium chassis sealed to IP56. Tested at −20 °C and 95 % humidity. Every control, gasket, and port rated for the harshest production environments.',
};

function CopyBlock({ eyebrow, heading, sub, body, align }: CopyData & { align: 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-3 transition-all duration-700
        ${align === 'right' ? 'items-end text-right' : 'items-start text-left'}
        ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-display text-[9px] tracking-[0.35em] text-accent">
        <span className="h-1 w-1 rounded-full bg-accent" />
        {eyebrow}
      </span>
      <h3 className="font-display text-[clamp(1.4rem,2.6vw,2.4rem)] font-bold leading-tight tracking-tight text-white whitespace-pre-line">
        {heading}
      </h3>
      <span className="font-display text-xs tracking-[0.25em] text-cyber">{sub}</span>
      <p className="max-w-[260px] text-sm leading-relaxed text-white/55">{body}</p>
    </div>
  );
}

export default function MarketingSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf: number;
    const update = () => {
      const el = sectionRef.current;
      if (el) {
        const rect  = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        const p     = Math.max(0, Math.min(1, -rect.top / total));
        setProgress(p);
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Camera PNG enters from top (S1 handoff) and settles at center of row 1.
  // It STAYS at row 1 — does NOT drift to row 2.
  // Enter: translateY from -30vh (above) → 0 (center) during progress 0 → 0.15
  const enter   = smoothstep(clamp(progress / 0.15, 0, 1));
  const camY    = lerp(-30, 0, enter);  // vh
  const camOp   = enter;                // fade in
  const glowOp  = enter * (progress > 0.85 ? 1 - (progress - 0.85) / 0.15 : 1);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ height: '210vh', background: '#000000' }}
    >
      {/* Glow behind camera — sticky */}
      <div
        className="sticky top-0 pointer-events-none z-0"
        style={{ height: '100vh', marginBottom: '-100vh' }}
      >
        <div
          className="absolute left-1/2 top-1/2 rounded-full blur-[80px]"
          style={{
            width: '40vw', height: '40vw',
            transform: `translate(-50%, calc(-50% + ${camY}vh))`,
            background: 'radial-gradient(circle, rgba(212,255,63,0.06) 0%, transparent 70%)',
            opacity: glowOp,
          }}
        />
      </div>

      {/* Camera PNG — sticky, enters from top, settles at row 1 center, stays there */}
      <div
        className="sticky top-0 pointer-events-none z-10"
        style={{ height: '100vh', marginBottom: '-100vh' }}
      >
        <img
          src={CAMERA_PNG}
          alt="Aura Cine Series X"
          className="absolute left-1/2"
          style={{
            width: '44vw',
            maxWidth: '520px',
            top: '50%',
            transform: `translateX(-50%) translateY(calc(-50% + ${camY}vh))`,
            opacity: camOp,
            filter: 'drop-shadow(0 20px 60px rgba(212,255,63,0.08))',
            transition: 'none',
          }}
        />
      </div>

      {/* Row 1 copy — flanks camera */}
      <div
        className="relative z-20 grid w-full items-center"
        style={{ height: '100vh', gridTemplateColumns: '1fr 46vw 1fr', padding: '0 4vw' }}
      >
        <div className="flex items-center justify-start pr-6 lg:pr-10">
          <CopyBlock {...ROW1_LEFT} align="left" />
        </div>
        <div />
        <div className="flex items-center justify-end pl-6 lg:pl-10">
          <CopyBlock {...ROW1_RIGHT} align="right" />
        </div>
      </div>

      {/* Row 2 copy — camera is NOT here (stays at row 1) */}
      <div
        className="relative z-20 grid w-full items-center"
        style={{ height: '100vh', gridTemplateColumns: '1fr 46vw 1fr', padding: '0 4vw' }}
      >
        <div className="flex items-center justify-start pr-6 lg:pr-10">
          <CopyBlock {...ROW2_LEFT} align="left" />
        </div>
        <div />
        <div className="flex items-center justify-end pl-6 lg:pl-10">
          <CopyBlock {...ROW2_RIGHT} align="right" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#050507]" />
    </section>
  );
}

function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function smoothstep(t: number) { const c = clamp(t, 0, 1); return c * c * (3 - 2 * c); }

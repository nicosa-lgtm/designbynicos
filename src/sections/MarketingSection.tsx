import { useEffect, useRef, useState } from 'react';

const LEFT_COPY = [
  {
    eyebrow: 'FULL-FRAME MASTERY',
    heading: 'See what others miss.',
    sub: '50.1MP BSI Stacked CMOS',
    body: 'A sensor architecture that captures 16+ stops of dynamic range — from the faintest shadow to a sun-blown highlight — all in a single RAW frame, no compromise.',
  },
  {
    eyebrow: 'CINEMA-GRADE VIDEO',
    heading: 'Every frame, a masterpiece.',
    sub: '8K 60fps · ProRes RAW Internal',
    body: 'Record directly to CFexpress at up to 8192 × 4320 with 16-bit linear color. No proxies. No external recorders. Pure cinematic data, from lens to card.',
  },
];

const RIGHT_COPY = [
  {
    eyebrow: 'INTELLIGENT AUTOFOCUS',
    heading: 'Lock on. Never let go.',
    sub: 'Neural AF · 0.03s Acquisition',
    body: 'The Series X reads eyes, faces, vehicles and athletes in real time. It learns motion patterns and predicts trajectories so the decisive moment is always in focus.',
  },
  {
    eyebrow: 'BUILT FOR THE FIELD',
    heading: 'Rain. Dust. Sub-zero.',
    sub: 'IP56 Sealed · Magnesium Unibody',
    body: 'Aircraft-grade magnesium chassis sealed to IP56. Tested at −20 °C and 95% humidity. Every control, gasket, and port rated for the harshest production environments.',
  },
];

function CopyBlock({
  eyebrow, heading, sub, body, align,
}: { eyebrow: string; heading: string; sub: string; body: string; align: 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`flex flex-col gap-3 transition-all duration-700 ${align === 'right' ? 'items-end text-right' : 'items-start text-left'} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-display text-[9px] tracking-[0.35em] text-accent">
        <span className="h-1 w-1 rounded-full bg-accent" />
        {eyebrow}
      </span>
      <h3 className="font-display text-[clamp(1.5rem,3vw,2.6rem)] font-bold leading-tight tracking-tight text-white">
        {heading}
      </h3>
      <span className="font-display text-xs tracking-[0.25em] text-cyber">{sub}</span>
      <p className="max-w-xs text-sm leading-relaxed text-white/55">{body}</p>
    </div>
  );
}

export default function MarketingSection() {
  const sectionRef  = useRef<HTMLDivElement | null>(null);
  const videoRef    = useRef<HTMLVideoElement | null>(null);
  const [scrollY, setScrollY]     = useState(0);
  const [sectionTop, setSectionTop] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const update = () => setSectionTop(el.getBoundingClientRect().top + window.scrollY);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const sectionH = typeof window !== 'undefined' ? window.innerHeight * 2 : 800;
  const rawProgress = sectionTop > 0 ? (scrollY - sectionTop + window.innerHeight) / (sectionH + window.innerHeight) : 0;
  const progress = Math.max(0, Math.min(1, rawProgress));

  // Camera enters from top-center, moves down into the copy text, shrinks
  const cameraY     = 2 + progress * 75;            // vh: 2% → 77% (deep into text)
  const cameraScale = 1 - progress * 0.5;           // 1.0 → 0.5
  const cameraOpacity = progress < 0.88 ? 1 : 1 - (progress - 0.88) / 0.12;

  // Pause video when in view
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ minHeight: '200vh', background: '#000000' }}
    >
      {/* Radial glow behind camera */}
      <div
        className="pointer-events-none absolute left-1/2 rounded-full blur-3xl"
        style={{
          top: `${cameraY}vh`,
          width: '42vw',
          height: '42vw',
          background: 'radial-gradient(circle, rgba(212,255,63,0.07) 0%, transparent 70%)',
          transform: `translateX(-50%) scale(${cameraScale})`,
        }}
      />

      {/* Camera video — sticky, moves down into copy */}
      <div
        className="pointer-events-none sticky top-0 z-10 h-screen w-full"
        style={{ opacity: cameraOpacity }}
      >
        <video
          ref={videoRef}
          src="/kamera-hero.mp4"
          className="absolute object-contain"
          style={{
            width: `${42 * cameraScale}vw`,
            maxWidth: '540px',
            top: `${cameraY}vh`,
            left: '50%',
            transform: 'translateX(-50%)',
            filter: 'drop-shadow(0 40px 80px rgba(212,255,63,0.12))',
          }}
          playsInline muted preload="auto"
        />
      </div>

      {/* Copy blocks */}
      <div className="relative z-20 mx-auto grid max-w-7xl grid-cols-1 gap-32 px-6 pt-32 pb-40 sm:px-10 lg:grid-cols-[1fr_340px_1fr] lg:gap-16 lg:px-16">
        <div className="flex flex-col justify-around gap-36 lg:gap-48">
          {LEFT_COPY.map((c) => (
            <CopyBlock key={c.eyebrow} {...c} align="left" />
          ))}
        </div>
        <div className="hidden lg:block" />
        <div className="flex flex-col justify-around gap-36 lg:gap-48">
          {RIGHT_COPY.map((c) => (
            <CopyBlock key={c.eyebrow} {...c} align="right" />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-ink-950" />
    </section>
  );
}

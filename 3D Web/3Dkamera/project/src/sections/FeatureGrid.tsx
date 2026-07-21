import { useState } from 'react';

const FEATURES = [
  {
    title: '8K 60FPS & 4K 120FPS',
    sub: 'Uncompressed RAW',
    desc: 'Frame-by-frame fidelity with internal ProRes RAW recording up to 8192×4320.',
    span: 'lg:col-span-2 lg:row-span-2',
    accent: 'accent',
  },
  {
    title: '16+ Stops',
    sub: 'Dynamic Range',
    desc: 'Sensor architecture preserves every highlight and shadow in a single exposure.',
    span: '',
    accent: 'cyber',
  },
  {
    title: 'AI Autofocus',
    sub: 'Real-Time Tracking',
    desc: 'Neural subject acquisition locks onto eyes, faces and vehicles in 0.03s.',
    span: '',
    accent: 'accent',
  },
  {
    title: 'Weather-Sealed',
    sub: 'Aircraft-Grade Build',
    desc: 'IP56-rated magnesium chassis engineered for monsoons, dust and sub-zero shoots.',
    span: 'lg:col-span-2',
    accent: 'cyber',
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="relative px-6 py-28 sm:px-10 lg:px-16">
      <SectionHeading
        eyebrow="FEATURE HIGHLIGHTS"
        title="Engineered for the impossible shot"
        desc="Every system on the Series X was rebuilt from the sensor up. This is what that work produces."
      />
      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className={`group glass relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:border-white/20 ${f.span}`}
          >
            <div
              className={`absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40 ${
                f.accent === 'accent' ? 'bg-accent' : 'bg-cyber'
              }`}
            />
            <div className="relative flex h-full flex-col">
              <div className="mb-5 flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    f.accent === 'accent' ? 'bg-accent' : 'bg-cyber'
                  }`}
                />
                <span className="font-display text-[10px] tracking-[0.3em] text-white/40">
                  {f.sub}
                </span>
              </div>
              <h3 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
                {f.title}
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55">
                {f.desc}
              </p>
              <div className="mt-auto pt-6">
                <span
                  className={`font-display text-[10px] tracking-[0.3em] ${
                    f.accent === 'accent' ? 'text-accent' : 'text-cyber'
                  }`}
                >
                  LEARN MORE →
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="font-display text-[10px] tracking-[0.35em] text-white/60">
          {eyebrow}
        </span>
      </div>
      <h2 className="font-display text-[clamp(1.8rem,4vw,3.2rem)] font-semibold leading-tight tracking-tight text-white">
        {title}
      </h2>
      {desc && (
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
          {desc}
        </p>
      )}
    </div>
  );
}

const SPECS = {
  Sensor: [
    ['Type', 'Full-Frame BSI Stacked CMOS'],
    ['Resolution', '50.1 MP / 8192×4320'],
    ['Pixel Pitch', '4.6 µm'],
    ['Native ISO', '800 / 12800 (Dual)'],
    ['Dynamic Range', '16+ stops'],
  ],
  'Video Modes': [
    ['8K', '60 fps — ProRes RAW'],
    ['6K', '90 fps — ProRes 4444'],
    ['4K', '120 fps — ProRes 422 HQ'],
    ['Slow Motion', 'Up to 960 fps HD'],
    ['Bit Depth', '16-bit linear'],
  ],
  Audio: [
    ['Inputs', '2× XLR + 3.5mm stereo'],
    ['Recording', '32-bit float, 96 kHz'],
    ['Mics', 'Built-in stereo capsule'],
    ['Latency', '< 2ms monitoring'],
  ],
  Connectivity: [
    ['Wireless', 'Wi-Fi 6E / Bluetooth 5.3'],
    ['Wired', '10Gbps Ethernet, USB-C 4'],
    ['Video Out', 'Full-size HDMI 2.1'],
    ['Timecode', 'BNC in/out, LTC'],
    ['Storage', 'CFexpress Type B ×2'],
  ],
  'Physical Dimensions': [
    ['Body', 'Magnesium alloy unibody'],
    ['Weight', '1.42 kg (body only)'],
    ['Dimensions', '150 × 99 × 88 mm'],
    ['Weather', 'IP56 sealed'],
    ['Mount', 'AURA X interchangeable'],
  ],
};

export function SpecsShowcase() {
  const tabs = Object.keys(SPECS) as (keyof typeof SPECS)[];
  const [active, setActive] = useState<keyof typeof SPECS>(tabs[0]);
  return (
    <section id="specs" className="relative px-6 py-28 sm:px-10 lg:px-16">
      <SectionHeading
        eyebrow="SPECIFICATIONS"
        title="Every detail, laid bare"
        desc="The full instrument, documented to the last decimal."
      />
      <div className="mx-auto mt-12 max-w-4xl">
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`rounded-full px-5 py-2 font-display text-xs tracking-wider transition-all duration-300 ${
                active === t
                  ? 'bg-accent text-ink-950 shadow-glow'
                  : 'border border-white/10 bg-white/[0.03] text-white/60 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="glass rounded-2xl p-2">
          <div className="divide-y divide-white/5">
            {SPECS[active].map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8"
              >
                <span className="font-display text-[11px] tracking-[0.25em] text-white/45">
                  {k.toUpperCase()}
                </span>
                <span className="text-right font-display text-sm text-white/90 sm:text-base">
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

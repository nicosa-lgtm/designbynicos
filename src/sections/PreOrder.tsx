import { useState } from 'react';
import { SectionHeading } from './FeatureGrid';

const TIERS = [
  {
    name: 'Standard Edition',
    price: '$8,499',
    tagline: 'The flagship body, complete.',
    features: [
      'AURA CINE Series X body',
      'AURA X lens mount kit',
      '2× CFexpress 512GB cards',
      '1-year limited warranty',
      'Firmware: Cinema OS 4',
    ],
    cta: 'Add to Cart',
    featured: false,
  },
  {
    name: 'Cinematic Production Bundle',
    price: '$14,990',
    tagline: 'Everything for a working cinema setup.',
    features: [
      'Everything in Standard',
      'Cinema Rig Pro + Top Handle X',
      'Prime 35mm T1.3 cinema lens',
      'Field Monitor 7" + V-Mount',
      'Matte Box FX with filter set',
      '3-year extended warranty',
      'Priority calibration service',
    ],
    cta: 'Configure Build',
    featured: true,
  },
];

export default function PreOrder() {
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState(1);
  return (
    <section id="preorder" className="relative px-6 py-28 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,255,63,0.08),transparent_60%)]" />
      <SectionHeading
        eyebrow="PRE-ORDER"
        title="Reserve your Series X"
        desc="Shipping begins Q2 2026. Pre-orders include a complimentary calibration session."
      />
      <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
        {TIERS.map((t, i) => (
          <div
            key={t.name}
            className={`relative overflow-hidden rounded-2xl p-8 transition-all duration-500 ${
              t.featured
                ? 'glass-strong border-accent/30 shadow-glow'
                : 'glass hover:border-white/20'
            } ${selected === i ? 'ring-1 ring-accent/50' : ''}`}
            onClick={() => setSelected(i)}
          >
            {t.featured && (
              <div className="absolute right-6 top-6 rounded-full bg-accent/15 px-3 py-1 font-display text-[9px] tracking-[0.3em] text-accent">
                BEST VALUE
              </div>
            )}
            <h3 className="font-display text-xl font-semibold text-white">
              {t.name}
            </h3>
            <p className="mt-1 text-sm text-white/50">{t.tagline}</p>
            <div className="mt-6 flex items-end gap-1">
              <span className="font-display text-4xl font-bold text-white">
                {t.price}
              </span>
              <span className="mb-1.5 font-display text-xs text-white/40">
                USD
              </span>
            </div>
            <ul className="mt-7 space-y-3">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-white/70">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      t.featured ? 'bg-accent' : 'bg-white/40'
                    }`}
                  />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-white/15 bg-white/[0.03]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQty((q) => Math.max(1, q - 1));
                  }}
                  className="grid h-9 w-9 place-items-center text-white/60 hover:text-white"
                  aria-label="decrease"
                >
                  −
                </button>
                <span className="w-8 text-center font-display text-sm text-white">
                  {qty}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQty((q) => q + 1);
                  }}
                  className="grid h-9 w-9 place-items-center text-white/60 hover:text-white"
                  aria-label="increase"
                >
                  +
                </button>
              </div>
              <button
                onClick={(e) => e.stopPropagation()}
                className={`flex-1 rounded-full px-6 py-3 font-display text-sm font-semibold tracking-wider transition-transform duration-300 hover:scale-[1.02] ${
                  t.featured
                    ? 'bg-accent text-ink-950 shadow-glow'
                    : 'border border-white/20 bg-white/[0.04] text-white hover:border-white/40'
                }`}
              >
                {t.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

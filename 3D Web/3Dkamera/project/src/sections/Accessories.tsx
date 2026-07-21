import { useState } from 'react';
import { SectionHeading } from './FeatureGrid';

const ACCESSORIES = [
  {
    name: 'Cinema Rig Pro',
    cat: 'Rig',
    desc: '15mm rod cage with quick-release top handle and NATO rails.',
    price: '$1,290',
    img: 'https://images.pexels.com/photos/2883124/pexels-photo-2883124.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'Prime 35mm T1.3',
    cat: 'Lens',
    desc: 'Cinema prime with focus gears and 330° focus rotation.',
    price: '$4,750',
    img: 'https://images.pexels.com/photos/3602258/pexels-photo-3602258.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'Top Handle X',
    cat: 'Handle',
    desc: 'Cold-shoe top handle with integrated record trigger.',
    price: '$320',
    img: 'https://images.pexels.com/photos/3785223/pexels-photo-3785223.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'Field Monitor 7"',
    cat: 'Monitor',
    desc: '2200-nit HDR field monitor with LUT support and SDI.',
    price: '$890',
    img: 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'V-Mount Battery',
    cat: 'Power',
    desc: '260Wh V-mount with USB-C 100W passthrough and D-Tap.',
    price: '$410',
    img: 'https://images.pexels.com/photos/4226258/pexels-photo-4226258.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    name: 'Matte Box FX',
    cat: 'Optics',
    desc: 'Two-stage carbon matte box with swing-away and 4×5.65 filters.',
    price: '$640',
    img: 'https://images.pexels.com/photos/3785223/pexels-photo-3785223.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
];

export default function Accessories() {
  const [active, setActive] = useState(0);
  return (
    <section id="accessories" className="relative px-6 py-28 sm:px-10 lg:px-16">
      <SectionHeading
        eyebrow="EXPANSION KIT"
        title="Build your rig, your way"
        desc="A complete ecosystem of cinema-grade accessories, engineered to fit the Series X natively."
      />
      <div className="mx-auto mt-14 max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Featured */}
          <div className="glass relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[16/10]">
            <img
              src={ACCESSORIES[active].img}
              alt={ACCESSORIES[active].name}
              className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-7">
              <span className="font-display text-[10px] tracking-[0.35em] text-accent">
                {ACCESSORIES[active].cat.toUpperCase()}
              </span>
              <h3 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">
                {ACCESSORIES[active].name}
              </h3>
              <p className="mt-2 max-w-md text-sm text-white/60">
                {ACCESSORIES[active].desc}
              </p>
              <div className="mt-4 flex items-center gap-4">
                <span className="font-display text-lg text-white">
                  {ACCESSORIES[active].price}
                </span>
                <button className="rounded-full border border-white/20 bg-white/[0.04] px-5 py-2 font-display text-xs tracking-wider text-white/80 backdrop-blur-md transition-colors hover:border-white/40 hover:text-white">
                  ADD TO RIG
                </button>
              </div>
            </div>
          </div>
          {/* List */}
          <div className="flex flex-col gap-3">
            {ACCESSORIES.map((a, i) => (
              <button
                key={a.name}
                onClick={() => setActive(i)}
                className={`group flex items-center gap-4 rounded-xl border p-3 text-left transition-all duration-300 ${
                  active === i
                    ? 'border-accent/40 bg-accent/[0.06]'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={a.img}
                    alt={a.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[9px] tracking-[0.3em] text-white/40">
                      {a.cat.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-display text-sm font-medium text-white">
                    {a.name}
                  </h4>
                  <p className="truncate text-xs text-white/45">{a.desc}</p>
                </div>
                <span className="font-display text-xs text-white/70">
                  {a.price}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

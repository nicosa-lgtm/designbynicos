import { useState } from 'react';

const SOCIAL = ['Instagram', 'YouTube', 'X', 'Vimeo', 'Behance'];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <footer className="relative border-t border-white/10 bg-ink-950 px-6 pt-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Newsletter */}
        <div className="glass relative mb-16 overflow-hidden rounded-2xl p-8 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h3 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                Join the inner circle
              </h3>
              <p className="mt-2 max-w-md text-sm text-white/55">
                Firmware drops, behind-the-scenes cinema, and early access to
                limited production runs.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes('@')) setSent(true);
              }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="flex-1 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 font-display text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-accent/50"
              />
              <button
                type="submit"
                className="rounded-full bg-accent px-7 py-3 font-display text-sm font-semibold tracking-wider text-ink-950 shadow-glow transition-transform hover:scale-[1.03]"
              >
                {sent ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}
              </button>
            </form>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid h-7 w-7 place-items-center rounded-full border border-accent/40 bg-accent/10">
                <div className="h-2 w-2 rounded-full bg-accent shadow-glow" />
              </div>
              <span className="font-display text-sm font-semibold tracking-[0.35em] text-white">
                AURA CINE
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-white/45">
              Cinema instruments engineered without compromise. Designed in
              Tokyo, assembled in Bavaria.
            </p>
          </div>
          <FooterCol
            title="Product"
            links={['Series X', 'Lenses', 'Accessories', 'Cinema OS', 'Compare']}
          />
          <FooterCol
            title="Support"
            links={['Warranty', 'Service Centers', 'Firmware', 'Contact']}
          />
          <FooterCol
            title="Company"
            links={['About', 'Films', 'Press', 'Careers', 'Sustainability']}
          />
        </div>

        {/* Social */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 py-8">
          <div className="flex flex-wrap gap-2">
            {SOCIAL.map((s) => (
              <a
                key={s}
                href="#"
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-display text-[11px] tracking-wider text-white/60 transition-colors hover:border-white/30 hover:text-white"
              >
                {s}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-6 font-display text-[11px] tracking-wider text-white/40">
            <span>2-YEAR WARRANTY</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>CARBON NEUTRAL</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>SECURE CHECKOUT</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col items-center justify-between gap-3 pb-10 text-center sm:flex-row sm:text-left">
          <p className="font-display text-[11px] tracking-wider text-white/35">
            © 2026 AURA CINE INSTRUMENTS. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-5 font-display text-[11px] tracking-wider text-white/35">
            <a href="#" className="hover:text-white/60">Privacy</a>
            <a href="#" className="hover:text-white/60">Terms</a>
            <a href="#" className="hover:text-white/60">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="font-display text-[11px] tracking-[0.3em] text-white/40">
        {title.toUpperCase()}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l}>
            <a
              href="#"
              className="text-sm text-white/65 transition-colors hover:text-white"
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

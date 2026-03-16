import React from "react";
import ThemeToggle from "./components/theme-toggle";

const CURRENT_YEAR = new Date().getFullYear();

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

const FEATURES = [
  {
    title: "Lightning Fast",
    description:
      "Blazing performance with optimized builds. Your users will never wait.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    color: "bg-yellow-300",
  },
  {
    title: "Fully Responsive",
    description:
      "Pixel-perfect on every device. Desktop, tablet, or mobile — it just works.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    ),
    color: "bg-green-300",
  },
  {
    title: "Easy Integration",
    description:
      "Drop-in components that work with your existing stack. No config headaches.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
      </svg>
    ),
    color: "bg-purple-300",
  },
  {
    title: "Open Source",
    description:
      "Free forever, community-driven. Inspect, modify, and contribute with full transparency.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    color: "bg-pink-300",
  },
] as const;

const STEPS = [
  { step: "01", title: "Install", description: "One command to get started." },
  {
    step: "02",
    title: "Configure",
    description: "Pick your colors and components.",
  },
  { step: "03", title: "Ship", description: "Deploy and go live in minutes." },
] as const;

const PRICING_PLANS = [
  {
    name: "Starter",
    price: "Free",
    description: "For personal projects",
    features: [
      "All core components",
      "Community support",
      "Basic themes",
      "MIT License",
    ],
    cta: "Get Started",
    highlight: false,
    color: "bg-background",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "For teams & startups",
    features: [
      "Everything in Starter",
      "Premium components",
      "Priority support",
      "Custom themes",
      "Figma files",
    ],
    cta: "Start Free Trial",
    highlight: true,
    color: "bg-[oklch(0.6747_0.1725_259.61)]",
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/mo",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "White-label license",
      "Dedicated support",
      "SLA guarantee",
      "Custom development",
    ],
    cta: "Contact Sales",
    highlight: false,
    color: "bg-yellow-300",
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "What is Neobrutalism?",
    a: "Neobrutalism is a design style featuring bold borders, strong shadows, vivid colors, and an intentionally raw aesthetic. It's web design with personality.",
  },
  {
    q: "Can I use this with my existing project?",
    a: "Absolutely. The components are built with Tailwind CSS and can be dropped into any React or Next.js project with minimal configuration.",
  },
  {
    q: "Is it accessible?",
    a: "Yes. All components follow WAI-ARIA patterns, have proper focus states, keyboard navigation, and meet WCAG 2.1 AA contrast requirements.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, we offer a 14-day money-back guarantee. If you're not satisfied, reach out and we'll process your refund — no questions asked.",
  },
] as const;

const MARQUEE_ITEMS = [
  "Next.js",
  "React",
  "Tailwind CSS",
  "TypeScript",
  "Radix UI",
  "shadcn/ui",
  "Open Source",
  "Accessible",
];

/* ────────────────────────────────────────────────────────── */
/*  Page                                                     */
/* ────────────────────────────────────────────────────────── */

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Marquee ── */}
      <MarqueeBanner />

      {/* ── Features ── */}
      <FeaturesSection />

      {/* ── How It Works ── */}
      <HowItWorksSection />

      {/* ── Pricing ── */}
      <PricingSection />

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── CTA ── */}
      <CTASection />

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
};

export default Home;

/* ────────────────────────────────────────────────────────── */
/*  Components                                               */
/* ────────────────────────────────────────────────────────── */

const Navbar: React.FC = () => (
  <nav className="sticky top-0 z-50 border-b-[2px] border-border bg-background">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <a
        href="#"
        className="text-xl font-bold tracking-tight"
        aria-label="Home"
      >
        neo<span className="text-[oklch(0.6747_0.1725_259.61)]">brutal</span>
      </a>

      <ul className="hidden items-center gap-8 text-sm font-medium md:flex">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="transition-colors hover:text-[oklch(0.6747_0.1725_259.61)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.6747_0.1725_259.61)] rounded px-2 py-1"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <a
          href="#pricing"
          className="btn-brutal cursor-pointer bg-[oklch(0.6747_0.1725_259.61)] px-5 py-2 text-sm font-bold text-foreground"
        >
          Get Started
        </a>
      </div>
    </div>
  </nav>
);

const HeroSection: React.FC = () => (
  <section className="relative overflow-hidden border-b-[2px] border-border bg-background">
    {/* Decorative grid dots */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    />

    <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-6 py-24 text-center md:py-36">
      {/* Badge */}
      <div className="btn-brutal inline-flex items-center gap-2 bg-yellow-300 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
        <span className="inline-block h-2 w-2 rounded-full bg-foreground" />
        Now in Beta
      </div>

      <h1 className="max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl">
        Build bold interfaces 2222{" "}
        <span className="relative inline-block">
          <span className="relative z-10">without limits</span>
          <span className="absolute bottom-1 left-0 -z-0 h-4 w-full bg-[oklch(0.6747_0.1725_259.61)] md:h-6" />
        </span>
      </h1>

      <p className="max-w-2xl text-lg font-medium leading-relaxed text-fg-muted md:text-xl">
        A design system that embraces raw aesthetics, thick borders, and vivid
        colors. Stop blending in — start standing out.
      </p>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <a
          href="#pricing"
          className="btn-brutal cursor-pointer bg-[oklch(0.6747_0.1725_259.61)] px-8 py-3.5 text-base font-bold text-foreground"
        >
          Start Building →
        </a>
        <a
          href="#features"
          className="btn-brutal cursor-pointer bg-background px-8 py-3.5 text-base font-bold text-foreground"
        >
          See Features
        </a>
      </div>

      {/* Stats */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-8 text-sm font-medium">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">4.3k</span>
          <span className="text-fg-muted">GitHub Stars</span>
        </div>
        <div className="h-6 w-px bg-border-muted" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">120+</span>
          <span className="text-fg-muted">Components</span>
        </div>
        <div className="h-6 w-px bg-border-muted" />
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">50k+</span>
          <span className="text-fg-muted">Downloads</span>
        </div>
      </div>
    </div>
  </section>
);

const MarqueeBanner: React.FC = () => (
  <div className="overflow-hidden border-b-[2px] border-border bg-[oklch(0.6747_0.1725_259.61)] py-3">
    <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
      {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
        <span
          key={`${item}-${i}`}
          className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-foreground"
        >
          <span className="inline-block h-1.5 w-1.5 rotate-45 bg-foreground" />
          {item}
        </span>
      ))}
    </div>
  </div>
);

const FeaturesSection: React.FC = () => (
  <section id="features" className="border-b-[2px] border-border bg-background">
    <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      <div className="mb-16 max-w-xl">
        <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-[oklch(0.6747_0.1725_259.61)]">
          Features
        </span>
        <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          Everything you need to ship fast
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feat) => (
          <div
            key={feat.title}
            className="card-brutal flex cursor-pointer flex-col gap-4 p-6 transition-all"
          >
            <div
              className={`${feat.color} border-brutal shadow-brutal flex h-12 w-12 items-center justify-center rounded-[5px]`}
            >
              {feat.icon}
            </div>
            <h3 className="text-lg font-bold">{feat.title}</h3>
            <p className="text-sm font-medium leading-relaxed text-fg-muted">
              {feat.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const HowItWorksSection: React.FC = () => (
  <section
    id="how-it-works"
    className="border-b-[2px] border-border bg-bg-secondary"
  >
    <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      <div className="mb-16 text-center">
        <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-[oklch(0.6747_0.1725_259.61)]">
          How It Works
        </span>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Three steps to launch
        </h2>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.step} className="card-brutal p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[5px] border-[2px] border-border bg-yellow-300 text-2xl font-bold shadow-brutal">
              {s.step}
            </div>
            <h3 className="mb-2 text-xl font-bold">{s.title}</h3>
            <p className="text-sm font-medium text-fg-muted">
              {s.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const PricingSection: React.FC = () => (
  <section id="pricing" className="border-b-[2px] border-border bg-background">
    <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
      <div className="mb-16 text-center">
        <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-[oklch(0.6747_0.1725_259.61)]">
          Pricing
        </span>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Simple, honest pricing
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`card-brutal flex flex-col justify-between p-8 ${plan.highlight ? "relative scale-[1.02] ring-2 ring-border" : ""}`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-[5px] border-[2px] border-border bg-yellow-300 px-4 py-1 text-xs font-bold uppercase shadow-brutal-sm">
                Most Popular
              </div>
            )}
            <div>
              <div
                className={`mb-4 inline-block rounded-[5px] border-[2px] border-border ${plan.color} px-3 py-1 text-sm font-bold shadow-brutal-sm`}
              >
                {plan.name}
              </div>
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {"period" in plan && (
                  <span className="text-sm font-medium text-fg-muted">
                    {plan.period}
                  </span>
                )}
              </div>
              <p className="mb-6 text-sm font-medium text-fg-muted">
                {plan.description}
              </p>
              <ul className="mb-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <a
              href="#"
              className={`btn-brutal block cursor-pointer text-center text-sm font-bold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[oklch(0.6747_0.1725_259.61)] ${plan.highlight ? "bg-[oklch(0.6747_0.1725_259.61)]" : "bg-background"} px-6 py-3 text-foreground`}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FAQSection: React.FC = () => (
  <section id="faq" className="border-b-[2px] border-border bg-bg-secondary">
    <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <div className="mb-16 text-center">
        <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-[oklch(0.6747_0.1725_259.61)]">
          FAQ
        </span>
        <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
          Got questions?
        </h2>
      </div>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item) => (
          <details key={item.q} className="card-brutal group cursor-pointer">
            <summary className="flex items-center justify-between px-6 py-5 text-base font-bold">
              {item.q}
              <span className="ml-4 text-xl transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="border-t-[2px] border-border px-6 py-5 text-sm font-medium leading-relaxed text-fg-muted">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  </section>
);

const CTASection: React.FC = () => (
  <section className="border-b-[2px] border-border bg-[oklch(0.6747_0.1725_259.61)]">
    <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
      <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
        Ready to build something bold?
      </h2>
      <p className="mb-10 text-lg font-medium text-fg-muted">
        Join thousands of developers who chose raw aesthetics over boring
        defaults.
      </p>
      <a
        href="#"
        className="btn-brutal inline-block cursor-pointer bg-background px-10 py-4 text-base font-bold text-foreground transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-foreground"
      >
        Get Started for Free →
      </a>
    </div>
  </section>
);

const Footer: React.FC = () => (
  <footer className="bg-[#0d0d0d] dark:bg-[#1a1a1a] text-white">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
      <a href="#" className="text-xl font-bold tracking-tight">
        neo<span className="text-[oklch(0.6747_0.1725_259.61)]">brutal</span>
      </a>

      <ul className="flex items-center gap-6 text-sm font-medium text-white/70 dark:text-white/60">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <p className="text-xs text-white/50 dark:text-white/40">
        © {CURRENT_YEAR} neobrutal. All rights reserved.
      </p>
    </div>
  </footer>
);

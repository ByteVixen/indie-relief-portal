// pages/index.js
import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Script from "next/script";
import CONFIG from "../lib/config";

// Currency helper (stable SSR/CSR)
const money = (n, currency = (CONFIG.totals?.currency || "USD")) =>
  typeof n !== "number"
    ? n
    : new Intl.NumberFormat("en-US", { style: "currency", currency, currencyDisplay: "symbol" }).format(n);

// Simple sparkle background
function SparkleBg() {
  return (
    <svg className="sparkle" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <radialGradient id="g" r="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="transparent" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="18" r="1.2" fill="url(#g)" />
      <circle cx="84" cy="9" r="1.6" fill="url(#g)" />
      <circle cx="92" cy="44" r="1.1" fill="url(#g)" />
      <circle cx="30" cy="70" r="1.3" fill="url(#g)" />
      <circle cx="68" cy="86" r="1.4" fill="url(#g)" />
    </svg>
  );
}

// A small progressive GFM widget mount with fallback notice
function GfmWidget({ url }) {
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [failed, setFailed] = useState(false);

  // exact URL (no sanitizing) — best chance to match GFM expectation
  const WIDGET_URL = url;

  // Kick the embed script after it loads (below with <Script/>)
  const kick = () => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute("data-url", WIDGET_URL);

    // If script had already run before, replace the node to trigger a re-scan
    const parent = el.parentElement;
    if (parent) {
      const clone = el.cloneNode(false);
      clone.setAttribute("data-url", WIDGET_URL);
      parent.replaceChild(clone, el);
      ref.current = clone;
    }
  };

  useEffect(() => {
    setMounted(true);
    kick();

    // In 2.5s, if the div is still empty/short, assume CSP blocked it
    const t = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const tooSmall = el.offsetHeight < 60; // widget normally is much taller
      if (tooSmall) setFailed(true);
    }, 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Load official script once, then we "kick" it to rescan */}
      <Script
        src="https://www.gofundme.com/static/js/embed.js"
        strategy="afterInteractive"
        onLoad={kick}
      />
      <div className="media" style={{ background: "#0b0c0c" }}>
        <div ref={ref} className="gfm-embed" data-url="" />
      </div>

      {mounted && failed && (
        <div className="card" style={{ marginTop: 10 }}>
          <div className="card-inner small">
            <strong>Having trouble showing the official widget here.</strong>
            <p style={{ margin: "6px 0 0" }}>
              This often happens on <code>localhost</code> due to GoFundMe’s embed security. It should work on a deployed HTTPS site.
              In the meantime, you can open it directly:
            </p>
            <p style={{ margin: "6px 0 0" }}>
              <a className="btn btn-ghost" href={WIDGET_URL} target="_blank" rel="noopener noreferrer">
                Open the GoFundMe widget in a new tab
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  // Theme vars
  useEffect(() => {
    document.documentElement.style.setProperty("--hunter", CONFIG.brand.primary);
    document.documentElement.style.setProperty("--gold", CONFIG.brand.accent);
  }, []);

  // Live totals via our API (robust, no widget needed)
  const [goal, setGoal] = useState(CONFIG.cause.goal ?? 0);
  const [raised, setRaised] = useState(CONFIG.cause.raised ?? 0);
  const [apiOk, setApiOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchTotals() {
      try {
        const api = `/api/gfm?url=${encodeURIComponent(CONFIG.gofundme.embedUrl)}`;
        const r = await fetch(api, { cache: "no-store" });
        if (!r.ok) return;
        const data = await r.json();
        if (!cancelled && data?.ok) {
          if (typeof data.goal === "number") setGoal(data.goal);
          if (typeof data.raised === "number") setRaised(data.raised);
          setApiOk(true);
        }
      } catch {
        // ignore
      }
    }
    fetchTotals();
    const id = setInterval(fetchTotals, 60000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const pct = useMemo(() => {
    if (!goal || goal <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((raised / goal) * 100)));
  }, [goal, raised]);

  return (
    <>
      <Head>
        <title>Inkbound × Ash B — Indie Relief Portal</title>
        <meta name="description" content="A transparent, digital fundraiser hub for indie creators. Donate via GoFundMe, confirm your entry, and see the impact grow." />
        <meta property="og:title" content="Indie Relief Portal — Inkbound × Ash B" />
        <meta property="og:description" content="Support indie creators fast and transparently. Donate on GoFundMe, confirm your entry, see live totals." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://inkboundsociety.com/og/indie-relief-portal.png" />
        <meta property="og:image:alt" content="Indie Relief Portal banner" />
      </Head>

      <a className="sr-only" href="#main">Skip to content</a>
      <SparkleBg />

      <main id="main" className="wrap">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <img
            src="/logo.png"
            alt="Portal logo"
            style={{ height: 250, width: "auto", borderRadius: 20, boxShadow: "0 0 50px rgba(240,185,3,.534)" }}
          />
        </div>

        {/* HERO */}
        <section className="hero" style={{ marginTop: 16 }}>
          <div>
            <h1 className="title">Indie Relief Portal</h1>
            <p className="subtitle">
              Support indie creators fast and transparently. Donations go <strong>directly</strong> to GoFundMe.
              Digital raffle prizes make it global and instant.
            </p>

            {/* Overall static total (from config) */}
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-inner" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <span className="badge">Overall Total Raised</span>
                <h2 style={{ margin: 0 }}>{money(CONFIG.totals?.amount || 0)}</h2>
                <a className="btn" href={CONFIG.gofundme.url} target="_blank" rel="noopener noreferrer">
                  💖 Donate on GoFundMe
                </a>
              </div>
            </div>

            {/* Live totals (from our API) */}
            <div className="card" style={{ marginTop: 12 }}>
              <div className="card-inner">
                <div className="kicker">Current Campaign Totals</div>
                <p className="small" style={{ marginTop: 8 }}>
                  {apiOk ? "Live from GoFundMe (parsed by our server):" : "Loading live totals…"}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
                  <div>
                    <div className="small">Progress</div>
                    <div className="progress" aria-label="Progress toward goal">
                      <div className="bar" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="small" style={{ display: "flex", gap: 10, marginTop: 6 }}>
                      <span aria-live="polite">
                        {money(raised)} raised of {money(goal)}
                      </span>
                    </div>
                  </div>
                  <div className="notice small">
                    <strong>Transparency:</strong> You donate on the verified GoFundMe. We don’t touch the funds.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <a className="btn btn-help" href="#current">🛟 Current Featured Indie Author</a>
              <a className="btn btn-ghost" href="#gfm">📊 View Official Widget</a>
            </div>
          </div>

          <div className="card halo">
            <div className="media" aria-label="Featured image">
              <img className="img" alt="Featured fundraiser visual" src={CONFIG.cause.heroImage} />
            </div>
          </div>
        </section>

        <div className="divider" role="presentation" />

        {/* CURRENT FEATURED INDIE AUTHOR */}
        <section id="current" className="grid g-2" style={{ marginTop: 18 }}>
          <article className="card">
            <div className="card-inner">
              <div className="kicker">Current Featured Indie Author</div>
              <h2 style={{ margin: "0 0 6px" }}>Terrah&nbsp;Faire</h2>
              <p className="small" style={{ marginTop: 8 }}>
                Hello! My name is Mille, and I started this fundraiser for my dear friend Terrah Faire. Terrah is facing
                severe health issues, and with her permission, I will share her story below.
              </p>
              <blockquote className="small" style={{ marginTop: 8, opacity: 0.95 }}>
                <p>
                  “In 2017, I nearly died of a septic infection due to a compound strep/mono infection, where I lost my
                  sense of smell and began having idiopathic hypoglycemia. From there, I was having hypoglycemic seizures,
                  went into borderline liver failure, and developed a severe migraine disorder where I will suffer 5 to 9 a
                  week on average, even with preventatives. In 2019, I was declining so rapidly that I eventually underwent
                  a Tilt Table Test, where I nearly coded and was unresponsive for 15 minutes after losing consciousness.
                  Over the course of my life, I have been diagnosed with several genetic mutations, scoliosis, severe
                  chronic pain, Ehlers-Danlos, POTS, Mast Cell Activation Syndrome, and other systemic disabilities.
                  In 2021, I found the strength to get out of an abusive marriage.
                </p>
                <p>
                  Recently, I was seeking simple med management at a local low-cost clinic, but when they demanded that I
                  see specialists to refill my meds, and I explained that was not possible due to lack of health care and
                  income, they have since abandoned me in care. I have been off my chronic medications for nearly a year
                  now, and I am only getting worse.
                </p>
                <p>
                  I have bad valves in my heart as well as other cardiovascular compromises, and I can feel myself getting
                  worse nearly every day with limited physical activity. My chest feels like it is caving in, and I am
                  losing consciousness more often. I am always short of breath, it seems, and I am struggling to exist.
                </p>
                <p>
                  I had to medically retire my service dog early, and his understudy has learned to alert well at home but
                  struggles with public access. Getting him up to speed would greatly increase my independence again.”
                </p>
              </blockquote>

              <div className="notice small" style={{ marginTop: 8 }}>
                <strong>Donations will be used for:</strong>
                <ul className="list small" style={{ marginTop: 8 }}>
                  <li>Accessing necessary medications for Terrah.</li>
                  <li>Seeing proper specialists for her chronic medical conditions.</li>
                  <li>Travel and potential boarding to see proper specialists and treatments.</li>
                  <li>Assistance with public access training for her service dog.</li>
                </ul>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a className="btn" href={CONFIG.gofundme.url} target="_blank" rel="noopener noreferrer">
                  💖 Donate on GoFundMe
                </a>
                <a className="btn btn-ghost" href={CONFIG.form.url} target="_blank" rel="noopener noreferrer">
                  📩 Confirm your entry (Google Form)
                </a>
              </div>
            </div>
          </article>

          <aside className="card halo">
            <div className="media">
              <img className="img" alt="Terrah's service dog" src="/doggo.webp" />
            </div>
            <div className="card-inner">
              <ul className="list small">
                {CONFIG.cause.impact.map((it, i) => (
                  <li key={i}>• {it}</li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        {/* PRIZES */}
        <section className="card halo" style={{ marginTop: 18 }}>
          <div className="card-inner">
            <div className="kicker">This Round’s Digital Prizes</div>
            <div id="prizes" className="grid g-3" style={{ marginTop: 8 }}>
              {CONFIG.prizes.map((p, i) => (
                <div className="card" key={i}>
                  <div className="card-inner">
                    <h4 style={{ margin: "0 0 4px" }}>{p.name}</h4>
                    <p className="small">by <strong>{p.by}</strong></p>
                    <p className="small">{p.details}</p>
                    <p className="small" style={{ opacity: 0.9 }}>{p.value || ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GOOGLE FORM CTA */}
        <section id="entries" className="card" style={{ marginTop: 18 }}>
          <div className="card-inner">
            <div className="kicker">Confirm Your Entries</div>
            <h3 style={{ margin: "0 0 8px" }}>Upload Receipt → Get Tickets</h3>
            <p className="small">
              After donating on GoFundMe,{" "}
              <a id="form-link-2" href={CONFIG.form.url} target="_blank" rel="noopener">
                open this form
              </a>{" "}
              and attach your receipt (screenshot or PDF). Every $10 = 1 ticket.
            </p>
          </div>
        </section>

        {/* OFFICIAL GFM WIDGET (progressive) */}
        <section id="gfm" className="card" style={{ marginTop: 18 }}>
          <div className="card-inner">
            <div className="kicker">Live Totals</div>
            <h3 style={{ margin: "0 0 8px" }}>GoFundMe Widget</h3>
            <p className="small">
              If it doesn’t display on localhost, that’s expected — test on a deployed HTTPS site.
            </p>
          </div>
          <GfmWidget url={CONFIG.gofundme.embedUrl} />
        </section>

        <footer className="wrap" style={{ padding: "12px 0 32px" }}>
          <div className="divider" />
          <div className="footer">
            <p>© <span id="year">{new Date().getFullYear()}</span> {CONFIG.brand.name}. All rights reserved.</p>
            <p className="small">Any issues? Contact <strong>Amanda</strong> @the.inkbound.society or <strong>Ash.B</strong> @reptilesandreads.</p>
            <p className="small">By participating, you agree to the raffle rules and our privacy notice.</p>
          </div>
        </footer>
      </main>
    </>
  );
}

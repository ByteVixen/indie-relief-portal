// lib/config.js
const CONFIG = {
  totals: {
    amount: 0,
    currency: "USD",
  },


  brand: { name: "Inkbound × Ash B", primary: "#355e3b", accent: "#d4af37" },
  gofundme: {
    url: "https://gofund.me/b0a31fc33",
    embedUrl: "https://www.gofundme.com/f/donate-to-restore-terrahs-independence/widget/large",
  },
  form: { url: "https://forms.gle/fja1KcQQ2mJc38Mx8" },  // <-- Google Form link

  cause: {
    name: "Current Creative — Community Relief",
    title: "Support Our Featured Indie Creator",
    summary:
      "We’re rallying the community to cover urgent costs so this member of the Indie Community can stay safe, stable, and keep creating.",
    image:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1974&auto=format&fit=crop",
    heroImage:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1974&auto=format&fit=crop",
    impact: [
      "Covers immediate essentials (rent, groceries, utilities)",
      "Provides recovery time to get back on their feet",
      "Keeps indie work moving forward",
    ],
    goal: 7000,
    raised: 0,
    drawISO: "2025-10-20T20:00:00Z",
  },

  // <-- Donation prizes
  prizes: [
    {
      name: "Custom Character Art Voucher",
      by: "Ash B",
      details: "One fully rendered character portrait (digital)",
      value: "$TBC value",
    },
    {
      name: "Website Audit or Mini Build",
      by: "Inkbound (Amanda)",
      details: "Audit + action plan, or a 1–3 page mini-build",
      value: "€TBC value",
    },
    {
      name: "Editing Consultation",
      by: "Partner Editor",
      details: "1-hour developmental consultation via Zoom",
      value: "$TBC value",
    },
  ],
  past: [
    { name: " A", total: 4200, date: "2025-08-12", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1974&auto=format&fit=crop" },
    { name: " B", total: 3100, date: "2025-06-03", image: "https://images.unsplash.com/photo-1455884981818-54cb785db6fc?q=80&w=1974&auto=format&fit=crop" },
    { name: " C", total: 5200, date: "2025-03-21", image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1974&auto=format&fit=crop" },
  ],
};

export default CONFIG;

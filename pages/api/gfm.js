// pages/api/gfm.js
export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ ok: false, error: "Missing ?url" });
    }
    const r = await fetch(url, {
      headers: {
        // Pretend to be a browser so we get the full widget HTML
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      // prevent Next from caching a stale widget
      cache: "no-store",
    });
    const html = await r.text();

    // Normalize non-breaking narrow spaces, then find money-like tokens
    const normalized = html.replace(/\u202F/g, " ").replace(/\u00A0/g, " ");
    const matches = [...normalized.matchAll(/([$£€])\s?([\d.,]+)/g)];
    const nums = matches
      .map((m) => {
        const sym = m[1];
        const raw = m[2];
        const val = Number(raw.replace(/[^\d.]/g, "").replace(/,/g, ""));
        return { sym, raw, val };
      })
      .filter((x) => Number.isFinite(x.val));

    if (!nums.length) {
      return res.status(200).json({ ok: false, error: "No totals found" });
    }

    // Heuristic: largest number tends to be the goal; the next one down is raised
    nums.sort((a, b) => b.val - a.val);
    let goal = nums[0].val;
    let currencySymbol = nums[0].sym;
    let raised = (nums.find((x) => x.val < goal) || nums[1] || nums[0]).val;

    if (raised > goal) [raised, goal] = [goal, raised];

    return res.status(200).json({ ok: true, goal, raised, currencySymbol });
  } catch (e) {
    return res.status(200).json({ ok: false, error: e?.message || "Unknown error" });
  }
}

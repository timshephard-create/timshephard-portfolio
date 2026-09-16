# timshephard.co — live portfolio (`main`)

`main` is the production site: static HTML/CSS/JS, no build step, deployed by Vercel to https://www.timshephard.co. Shared styles and chrome live in `shared/styles.css` and `shared/nav.js`; serverless functions in `api/`. The parked NIGHT CREW redesign lives on branch `rebuild` and has its own CLAUDE.md — these rules are for `main`.

## Deploy and workflow

1. **`main` is production.** Every push to `main` auto-deploys to timshephard.co. Branch for anything non-trivial; any other branch gets its own Vercel preview.
2. **Vercel previews sit behind Vercel Authentication.** A preview URL returns a 302 to `vercel.com/sso-api` for everyone who isn't signed in, so a bare status code proves nothing. Verify in a real browser (e.g. Playwright/Chromium) against the branch content, or verify on production after merge — otherwise say plainly that you couldn't verify.
3. **Vercel occasionally misses the GitHub webhook.** If nothing builds within a couple of minutes of a push, an empty commit (`git commit --allow-empty`) re-triggers it. Per-commit deployment URLs are in GitHub's deployment records (`gh api repos/timshephard-create/timshephard-portfolio/deployments` → statuses → `environment_url`).
4. **`build.py` is defunct.** Never run it.
5. **This project must never contain a `public/` directory.** Vercel's static classification treats it as the output root, so the root `index.html` stops being served (see commits `c403901`, `69a8b46`). Assets live in `/images`.
6. **Every non-dotfile in the repo is publicly served.** A `.md`, `.py` or other file committed anywhere in the tree becomes a URL on timshephard.co (e.g. `/MORNING-REVIEW.md`). The GitHub repo is public too. Don't commit anything you wouldn't publish.
7. **Preserve the integrations:** Formspree endpoint `https://formspree.io/f/xnjgddyr` (the `/hire/` form) and GA4 `G-82B9C9WGMG`. Never submit the live form to test it. When testing production headlessly, block GA's `/g/collect` requests so test visits don't pollute analytics.
8. **The retired cmv-proxy does not return.** `api/brief.js` and `api/personalize.js` call `api.anthropic.com` directly with narrow, non-general-purpose endpoints. New AI features get their own serverless function with a dedicated, spend-capped API key — never a proxy pattern, never a shared or unlimited key.

## Copy and attribution

9. **`FACTS.md` is copy law.** Every reader-facing claim must trace to it. Anything unconfirmed is omitted, never guessed — open items live in its PENDING VERIFICATION section and stay there until Tim rules.
10. **KAB attribution is two-tier.**
    - **Tier A — Tim's, stated plainly, no hedging:** 160K+ PSA airings, $77.5M earned media, 4.5M+ GIF views.
    - **Tier B — the organization's, never Tim's personal result:** 11.9M participants, $300M economic impact, 20K+ affiliates. Always carries the org-reported citation, hardcoded in markup with the marker comment on the same line so it can be found by grep:
      ```html
      <a class="cite" href="https://kab.org/annual-reviews-financial-reports/" target="_blank" rel="noopener">org-reported</a><!-- KAB_SOURCE_URL -->
      ```
    - **Banned, always:** the 745M impressions figure in any phrasing; attributing any KAB work to National CleanUp Day (the PSA is KAB's "Recycle Like Everyone's Watching").
11. **No fictional provenance.** No visit counters, edition numbers, archive counts or any number implying real history unless it is literally true and backed by real data.
12. **Never repeat the same stat sentence verbatim on two pages.** Reword it per page.
13. **Gaming and Tim & The Time Machine are not professional work.** They never appear on `/work/` or in a professional vertical list. Gaming is transferable skills and intent only — no shipped-game credits.
14. **Location is "DFW" or "Dallas–Fort Worth" only**, never a single city or suburb. **Experience is "15+ years" / "Fifteen years" only.**

## Decisions already made — do not "fix" these

15. **The `/projects/` Website Audit & Rebuild card is kept by decision.** It was demoted to the last card on purpose, overriding an earlier brief that said to delete it. Do not remove it or clean it up.
16. **The homepage is zero-chrome.** No `nav.js` injection, no footer. Its contact line is plain static markup.
17. **The homepage fold is deliberately built mobile-first in the DOM.** `index.html`'s identity block is written in mobile order (CTAs → dual-track line → chips); above 700px a flex column with CSS `order` restores the desktop sequence (chips → dual-track line → CTAs → KAB case). This keeps mobile's DOM, visual and tab order aligned. Don't "simplify" it back to block flow, and don't remove either compensation — `.id-ctas { margin-top: 0 }` and `.id-tertiary { margin-bottom: 1px }` in the `min-width: 701px` block keep desktop pixel-identical to the approved layout.

## Rendering

18. **All reader-facing text is real DOM text** in the static HTML — never baked into images, never injected by JS into empty containers.
19. **First paint must show real content before any animation runs.** No `opacity: 0` starting states on hero or proof text; entrance motion is transform-only; `prefers-reduced-motion: reduce` must leave content visible and still.

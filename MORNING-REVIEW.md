# MORNING REVIEW — Ship 1, "Callback critical"

**Branch:** `ship-1-callback` (from `main` @ `96ff882`) · **Commits:** 5, one per page · **Not merged, not deployed to production.**

Everything below happened on that branch only. `main` is untouched. `rebuild` was read from (`git show`) and never modified.

---

## 1. Step 0 findings

**Stack — confirmed as described.** Static HTML/CSS/JS, no build step. Shared system in `shared/styles.css` + `shared/nav.js` (nav + footer injected on the 12 pages carrying `data-nav="full"`). `vercel.json` is exactly `{cleanUrls: true, trailingSlash: false}`. Serverless functions `api/personalize.js` and `api/brief.js` — not touched. Formspree `xnjgddyr` and GA4 `G-82B9C9WGMG` — intact and verified by grep after every edit. `build.py` present, never run. Repo is the source for the live site (no CMS); `origin` = `timshephard-create/timshephard-portfolio`.

**CLAUDE.md on `main`: does not exist.** No CLAUDE.md on `main`, `homepage-flagship` or `homepage-variants`. One exists on `rebuild` only, and its rule 10 *is* the `public/` exclusion ("This project must never contain a `public/` directory — Vercel static classification treats it as the output root, so root `index.html` stops being served"). Not binding on `main`, but obeyed anyway: no `public/` directory was created.

**Custom cursor — exists, homepage only.** [index.html](index.html): CSS `#cursor` / `#cursor.expanded`, `cursor: none` on `.panel`, markup `<div id="cursor">`, and the mousemove/hover JS at the bottom of the file. No other page has it. Preserved exactly; the hover-target selector list was extended to cover the new identity-section links so the expand behaviour still works everywhere.

**FACTS.md — found at `rebuild:handoff/FACTS.md`** (status: APPROVED 2026-07-06). Not present on `main`.

**"Rebrand" for KAB — verified, twice.** FACTS.md §3: "Complete rebrand of a 70-year-old national nonprofit," with Helen Lowman (CEO) on record: "successfully led the rebranding efforts." Existing site copy agrees — [about/index.html:870](about/index.html:870) and [work/index.html](work/index.html). The hero role line ships as written: *Creative Director. National rebrand and PSA system.*

**`<!-- KAB_SOURCE_URL -->` markers placed: 4.**

| # | File | Placement |
|---|---|---|
| 1 | [index.html](index.html) | homepage hero-case outcome line |
| 2 | [work/index.html](work/index.html) | metric row — "11.9M Participants (org-reported)" |
| 3 | [work/index.html](work/index.html) | lead case `#case-kab` outcome line |
| 4 | [work/index.html](work/index.html) | KAB archive card — `$300M` (see §5) |

All four hardcode `https://kab.org/annual-reviews-financial-reports/` with the comment on the same line. `org-reported` is attached **only** to Tier B numbers (11.9M / $300M). Never to 160K+, $77.5M or 4.5M+.

**Attribution sweep, whole repo:** zero hits for `745`, zero for "National CleanUp Day", zero for "20 years" / "20+ years". Clean going in, clean going out.

---

## 2. What changed, per page

### `/` — [index.html](index.html) · commit `a0e14f3`
- New `.identity` section, **first in DOM**, all real static text: name, `Creative Director`, subhead, availability line (`Dallas–Fort Worth · Fractional & contract first · Full-time welcome`), 4 proof chips, KAB hero case with visual + cited outcome line, primary CTAs (`see the work →` / `let's talk →`), secondary `my story →`, tertiary `not sure where to go? start here →`, and a static contact line (email · LinkedIn · `hire →`).
- The fixed orange **"START HERE." band is gone from the top**; demoted to that tertiary text link, keeping its original "not sure where to go?" vernacular.
- `.split-container` and `.third-strip` converted from `position: fixed` to static flow — **the page scrolls now**. MY WORK. / MY STORY. and the WHAT I'M BUILDING. strip are the first scroll, with the dual-track line between them.
- Zero-chrome preserved: no `nav.js`, no footer injection. Contact line is plain markup.
- Hero-case visual reuses the existing Greatest American Cleanup brand image already on `/nonprofit/`.
- Header spacing and type scale tightened so identity + chips + the whole hero case clear the fold at 1440×900.

### `/projects/` — [projects/index.html](projects/index.html) · commit `779a365`
- **Website Audit & Rebuild demoted, not deleted** — moved from first card to last. Card markup, status treatment, copy and the `sites.timshephard.co` link (`target="_blank" rel="noopener noreferrer"`) all unchanged.
- Final order: The Lab · AI Daily Digest · Kindora · The Other 1776 · Tim & The Time Machine · Website Audit & Rebuild. Reveal-delay classes re-sequenced.
- Intro copy untouched (that's Ship 2+).

### `/work/` — [work/index.html](work/index.html) · commit `fc7b3b2`
- H1 stays `My Work.` with the existing `Selected Work` eyebrow — **no second headline added**. New subhead: *"Open these three first. Then what I'm building. Then everything else."*
- Metric row now: `15+ Years · 5 Verticals · 11.9M Participants (org-reported) · NAGC Blue Pencil & Gold Screen · 160K+ PSA Airings`. The standalone `$300M Org. Impact` chip is gone.
- **Three lead cases before the filter strip and grid**: `#case-kab`, `#case-dhs`, `#case-ecrion` — each with role, one visual reused from its vertical page, an outcome line and a deep link. `scroll-margin-top` keeps them clear of the sticky nav.
- **Builder section** "Also shipping." — The Lab, AI Daily Digest, Kindora (all new-tab). No Time Machine, no gaming, no audit/rebuild anywhere on this page.
- **Archive** "Everything else." — the existing filtered grid, cards capped at 250px so they read lighter than the lead three. The filter strip moved into this section, wrapped in a sticky container with `role="group"`, `aria-label="Filter categories"` and a mobile edge fade. Filters still work.
- One Thousand Voices card relabelled `One Thousand Voices (ISCS)` with light framing: *"Founded · communication strategy & field storytelling · 2014–2022"*. (A card already existed — I rewrote it rather than adding a duplicate.)
- Athens / Apocalypto copy untouched; they sit in the archive, visually demoted. Copy rewrite is Ship 2.
- Header padding + title scale reduced so lead case 01 clears the fold.

### `/hire/` — [hire/index.html](hire/index.html) · commit `01dc27f`
- Existing H1 kept (`Let's Build This.`). New subhead: *"Fractional and contract first. Full-time, let's talk."*
- **Lane 1 — Recruiters & hiring managers**, first and above Lane 2: *"Email or LinkedIn works. No form."* with mailto, the page's existing LinkedIn href (new tab), a `Dallas–Fort Worth` row, pills `// fractional & contract — first` and `// full-time — open`, and *"Engagements via Creative Mind Ventures LLC"*. **No fields, no required inputs, no budget control in this lane.**
- **Lane 2 — Clients & project inquiries**, carrying the page's own intake line ("Drop your details and I'll come back with something useful") and the **Formspree form completely unchanged** — same fields, same engagement-type options, same budget pills, same "I typically respond within 24 hours."
- Contact details and availability moved *out of* the left column into Lane 1 so nothing duplicates; the left column keeps the identity and the single "I build creative systems that turn strategy into results" instance.
- Personalised Brief quiz untouched, still `// Optional — takes 2 minutes`; `/api/brief` wiring not modified.
- Bottom bar reordered fractional-first, and the location string normalised from `Dallas / Fort Worth, TX` to `Dallas–Fort Worth`.
- **The form was never submitted and no one was contacted.**

### Anchors — [nonprofit/index.html](nonprofit/index.html), [gov/index.html](gov/index.html), [tech/index.html](tech/index.html) · in commit `fc7b3b2`
One anchor span each (`#kab`, `#dhs`, `#ecrion`) with `scroll-margin-top`. **Anchor markup only — no other change to those pages.**

### First paint — [projects/index.html](projects/index.html), [work/index.html](work/index.html) · commit `8f50abd`
(`/` and `/hire/` got theirs inside their own commits.)
- `/projects/` was the P0: hero label, H1 and description were literally `opacity: 0` until a delayed animation ran, and every card was `opacity: 0` behind an IntersectionObserver — JS off meant a blank page. All now paint immediately; motion is transform-only.
- `/work/` archive cards: `cardIn` converted from opacity+transform to transform-only.
- `prefers-reduced-motion: reduce` added to all four Ship 1 pages — it existed **nowhere** in the repo before. Other verticals and `/explore/` left alone (Ship 3).

---

## 3. Grep hit list — before, and what happened

| Pattern | Hits before | After |
|---|---|---|
| `sites.timshephard.co` | 1 — [projects/index.html:330](projects/index.html) card link | **Kept**, moved to the last card by decision |
| `1,500` | 0 | — |
| `1500` | 1 — [gaming/index.html:452](gaming/index.html) *"glass-making around 1500 BC"* | Left alone (unrelated trivia) |
| `Website Audit` | 2 — comment + card name in `projects/index.html` | **Kept**, moved to last position |
| `300+ Sites` | 0 | — |
| `audit` (case-insensitive) | 6 total — the 3 in `projects/index.html`; [entertainment/index.html:615](entertainment/index.html) *"audited at the highest level"*; [tech/index.html:631](tech/index.html) *"Audit brand, audience…"*; and 3 in [shared/adventure.js](shared/adventure.js) describing "an automated audit platform" / "a website audit platform" as CMV ventures | Card copy kept as-is (it already carried **no price, no "300+ sites", no "20 years"** — nothing to strip). The two unrelated uses left alone. **adventure.js left alone by your decision** — it's the Explore engine's copy, and Explore is Ship 3. Flagged below. |

**Nothing was removed.** No audit/rebuild mention existed on the homepage, in nav/footer, or on `/hire/`, so there was nothing to remove from those either.

---

## 4. Placeholders and things awaiting you

**No placeholder dates were introduced.** Every date shipped (2014–2022 for One Thousand Voices) is confirmed in FACTS.md §3. No date was invented.

**LinkedIn href reused — please confirm it's current:**
```
https://www.linkedin.com/in/tim-shephard
```
Taken verbatim from the existing `/hire/` markup, used unchanged in Lane 1 and on the homepage contact line, both `target="_blank" rel="noopener noreferrer"`.

**Open date/fact questions found in FACTS.md §8 (unchanged, still open):**
1. NAGC award specifics — exact certificate wording: category, placement, year, and whether it's one honour or two. See §5.
2. DHS title qualifier — "Lead Creative Director" appears on three older pages; unconfirmed, so copy says "Creative Director".
3. Early-career employment span — old pages conflict ("2004–2006" vs "2007–2015"); Pali Camp dates unknown. No span claim shipped.
4. "Est. 2005" on the old nonprofit masthead — unconfirmed, omitted.
5. Rick Ringel quote — recommendation exists, no verbatim text.

---

## 5. Decisions, deviations and things I couldn't do

**NAGC wording — you chose FACTS.md over the prompt.** The prompt specified "NAGC 1st Place" in three places; FACTS.md §8 lists placement as pending verification and permits only "NAGC Blue Pencil & Gold Screen Award". You ruled for FACTS.md, so on the Ship 1 pages the placement claim is gone:
- homepage chip 2 → `Led a team of 10 · NAGC Blue Pencil & Gold Screen`
- `/work/` metric row → `NAGC / Blue Pencil & Gold Screen`
- `/work/` `#case-dhs` outcome → `NAGC Blue Pencil & Gold Screen Award.`
- `/work/` DHS grid card stat → `NAGC / Blue Pencil`; the Mobilizing Innovation card stat → `Gold / Screen Award` (so the two honours split across two cards instead of duplicating)

**Worth knowing before Ship 2:** `"1st Place"` still appears on **eight other pages** I was not scoped to touch — `/about/` (×3, incl. "NAGC — 2× Winner"), `/branding/` (×2), `/entertainment/` (×2), `/gaming/`, `/gov/` (×6), `/nonprofit/`, `/tech/`. Two of them are *more* specific than FACTS.md assumed: [gov/index.html](gov/index.html) and [branding/index.html](branding/index.html) both state **"First Place in Electronic Publication"** alongside Blue Pencil. That specificity suggests FACTS.md §8 item 1 may already be answerable from your records — if you can confirm the certificate, you could restore "1st Place" everywhere instead. Right now the site is inconsistent: `/work/` and `/` say Blue Pencil, eight other pages say 1st Place. **This needs your call before merge.**

**Extra citation I added on my own judgement.** The KAB archive card on `/work/` read *"$300M documented economic impact"* bare. That's a Tier B number next to your name with no label — a FACTS.md attribution-law violation sitting on a page I was already editing. I attached the `org-reported` citation, making 4 markers instead of the 3 the prompt listed. Revert if you'd rather keep the count at 3.

**Title: "Creative Director" vs FACTS.md's "Senior Creative Director".** FACTS.md §2 says the title is *Senior* Creative Director "everywhere, per ruling". The prompt's exact copy says `Creative Director`, and the prompt wins over the brief — so that's what shipped, on the homepage and in the lead cases. Flagging it because it contradicts an approved ruling, not because I think it's wrong for a recruiter fold.

**adventure.js left untouched** (your decision). `shared/adventure.js` still describes CMV as building "an automated audit platform" / "a website audit platform" in the Explore narrative. No link, no price, no card. Remaining mention for Ship 3.

**Pre-existing issue I did not fix:** the `/hire/` H1 has a visible gap between "BUILD" and "THIS." — caused by a `<br>` following a `display:block` `<em>` in the original markup. It predates this branch. One-character fix, but outside Ship 1's named scope, so I left it. Say the word.

**Minor:** on `/work/`, the DHS grid card's stat label sits over the poster artwork's own headline and is partly hard to read. The original "1st Place" label had the same collision; my label is a similar length, so this is not a regression — but it belongs on the Ship 4 "lead-case imagery polish" list.

**Not started:** Ship 2, 3 and 4. No entertainment copy cuts, no gov "zero-fail" de-spam, no About reorder, no `/sky` redirect, no robots/sitemap.

---

## 6. Preview URL and how I verified

**Preview:** https://timshephard-portfolio-git-s-ec1286-timshephard-creates-projects.vercel.app

(Vercel truncated the branch alias; that hostname came from the deployment's own check-run payload, not a guess. Vercel dashboard: `vercel.com/timshephard-creates-projects/timshephard-portfolio` — deployment `9ynydSyt7WbxuF5Nom8S1XDPgV1g`, status **success**.)

**Verification through the protection wall: not achieved — and I'm not going to dress that up.** The preview returns a 302 to `vercel.com/sso-api`. There is no Protection Bypass secret in the environment, the Vercel CLI here is unauthenticated (it wanted an OAuth device flow, which I did not put you through), and there's no public file tree on a static deployment. So I have a deployment-exists signal and nothing more from the live preview.

**What I did instead — real browser, real rendering, against the exact branch content.** Playwright + Chromium against a local static server, because the in-app browser pane can't screenshot on this machine:

| Check | Result |
|---|---|
| `/`, `/work/`, `/projects/`, `/hire/` at 1440×900 and 390×844 | All render correctly; no horizontal overflow at 390 |
| **First paint** (screenshot with zero settle delay, no animation time) | `/` identity block, `/work/` H1 + metric row + lead case 01, `/projects/` H1 + cards, `/hire/` H1 + both lane headings — **all fully visible**. `/projects/` was blank before this branch. |
| `prefers-reduced-motion: reduce` emulated | Content at rest, fully visible, nothing animating |
| All six anchors — `/work/#case-kab`, `#case-dhs`, `#case-ecrion`, `/nonprofit/#kab`, `/gov/#dhs`, `/tech/#ecrion` | All six resolve and land clear of the 52px nav (element top at 120px / 72px) |
| Console + page errors | None on any page. (One 404 on desktop loads is a missing favicon — pre-existing, site-wide.) |
| Integrations after editing | Formspree `xnjgddyr` ×1, GA4 `G-82B9C9WGMG` ×2, `/api/brief` ×2 — all present on `/hire/` |

**The one thing local testing cannot prove:** that `trailingSlash: false` preserves the fragment when `/work/#case-kab` redirects to `/work#case-kab`. Browsers do preserve fragments across 3xx when the target carries none, so it should hold — but **please click one chip on the preview** while signed in to Vercel and confirm it lands on the case. That's the single highest-value thing for you to check by hand.

---

## 7. Acceptance checklist (brief section G)

| # | Item | Status |
|---|---|---|
| 1 | Homepage fold shows name, Creative Director, Dallas–Fort Worth, fractional-first availability, 4 chips, KAB hero, View work + Hire | **done** — using the prompt's copy, not the brief's strings |
| 2 | No `sites.timshephard.co` / $1,500 audit anywhere on timshephard.co | **kept on /projects/ by decision** — no $1,500 figure exists anywhere in the repo; the card and link remain, demoted to last |
| 3 | `/work/` opens with KAB → DHS → Ecrion, then builder trio, then archive | **done** |
| 4 | Athens/Apocalypto have no leadership-scale numbers or "no safety net" language | **not in Ship 1** — visually demoted to the archive; copy rewrite is Ship 2 |
| 5 | `/hire/` shows email + LinkedIn before any form; form only in client lane | **done** |
| 6 | Hard refresh: no blank heroes on Ship 1 pages | **done** — verified by zero-delay screenshots on all four |
| 7 | iPhone-width: Work filters not clipped without affordance | **done** — sticky wrapper, `overflow-x: auto`, edge fade, `aria-label="Filter categories"` |
| 8 | `lab.timshephard.co/sky` redirects to working sky route | **not in Ship 1** (Ship 3; also a different property) |
| 9 | Location never names a specific city beyond Dallas–Fort Worth / DFW | **done on Ship 1 pages** — `/hire/`'s "Dallas / Fort Worth, TX" normalised. Other pages not audited (Ship 3) |
| 10 | Experience says 15+ only | **done** — zero "20 years" hits repo-wide |
| 11 | KAB metrics marked org-reported and link to the source | **done** on the 4 Ship 1 placements. `/about/` and `/nonprofit/` first-mention citations are Ship 2 (brief E6) |
| — | robots.txt / sitemap.xml | **not in Ship 1** (Ship 3) |

---

## What I'd look at first, in order

1. **The NAGC inconsistency** — `/work/` and `/` now say Blue Pencil, eight other pages still say 1st Place. Pick one and I'll make the site consistent in Ship 2.
2. **Click a proof chip on the preview** to confirm the anchor survives the trailing-slash redirect.
3. **The homepage fold** — it's the biggest behavioural change on the branch; the page scrolls now.

# MORNING REVIEW — Ship 1, "Callback critical"

**Branch:** `ship-1-callback` (from `main` @ `96ff882`) · **Reflects:** `5ff0c30` · **Merged to `main` with `--no-ff` on 2026-09-16 and deployed to production** — rollback target below.

All Ship 1 work was done on that branch and reviewed there before the merge. `rebuild` was read from (`git show`) and never modified.

## Rollback

If Ship 1 needs to come out of production, this is the last known-good state:

| | |
|---|---|
| **Commit** | `96ff882` — "Projects: add The Lab — live card for lab.timshephard.co" (`main` before the Ship 1 merge) |
| **Production deployment** | https://timshephard-portfolio-o3c3mnes7-timshephard-creates-projects.vercel.app |
| **Vercel deployment ID** | `9cbpjPE9RSaKCmQXpC5qP9n6ghE7` — [dashboard](https://vercel.com/timshephard-creates-projects/timshephard-portfolio/9cbpjPE9RSaKCmQXpC5qP9n6ghE7) |
| **Deployed** | 2026-09-03 16:10 UTC |

**Fastest path — no git:** in the Vercel dashboard, open that deployment and use **Promote to Production** (Instant Rollback). Vercel points `timshephard.co` back at the existing build in seconds; nothing is rebuilt and nothing in git changes. Note that the next push to `main` will deploy again and supersede the rollback.

**Git path:** the merge is a `--no-ff` merge commit, so `git revert -m 1 <merge-commit>` backs out all of Ship 1 in one commit. Each Ship 1 commit also stays individually revertible.

---

> **Refreshed 2026-09-16** to match `5ff0c30`. The first version of this file was written at `c352cd2`, before four homepage commits changed the fold. If you are reviewing an older deployment, see §6 for which URL serves which commit.

---

## 0. Commit log

| Commit | Scope |
|---|---|
| `a0e14f3` | `/` — identity + proof section first in DOM, page becomes scrollable |
| `779a365` | `/projects/` — Website Audit & Rebuild card demoted to last position |
| `fc7b3b2` | `/work/` — lead three, builder, archive; deep anchors on `/nonprofit/`, `/gov/`, `/tech/` |
| `01dc27f` | `/hire/` — two-lane layout |
| `8f50abd` | First paint — `/projects/` and `/work/` |
| `c352cd2` | This file, first version |
| `661806f` | `/` — dual-track line moved into the identity block, under the chips |
| `acb03b5` | `/` — primary CTAs moved above the KAB hero case |
| `3f19f6c` | `/` — mobile: eyebrow label hidden, CTAs reordered above the chips (superseded by `5ff0c30`) |
| `5ff0c30` | `/` — CTAs lead in the DOM; mobile line introduces the chips; desktop restored with CSS `order` |

---

## 1. Step 0 findings

**Stack — confirmed as described.** Static HTML/CSS/JS, no build step. Shared system in `shared/styles.css` + `shared/nav.js` (nav + footer injected on the 12 pages carrying `data-nav="full"`). `vercel.json` is exactly `{cleanUrls: true, trailingSlash: false}`. Serverless functions `api/personalize.js` and `api/brief.js` — not touched. Formspree `xnjgddyr` and GA4 `G-82B9C9WGMG` — intact and verified by grep after every edit. `build.py` present, never run. Repo is the source for the live site (no CMS); `origin` = `timshephard-create/timshephard-portfolio`.

**CLAUDE.md on `main`: does not exist.** No CLAUDE.md on `main`, `homepage-flagship` or `homepage-variants`. One exists on `rebuild` only, and its rule 10 *is* the `public/` exclusion ("This project must never contain a `public/` directory — Vercel static classification treats it as the output root, so root `index.html` stops being served"). Not binding on `main`, but obeyed anyway: no `public/` directory was created.

**Custom cursor — exists, homepage only.** [index.html](index.html): CSS `#cursor` / `#cursor.expanded`, `cursor: none` on `.panel`, markup `<div id="cursor">`, and the mousemove/hover JS at the bottom of the file. No other page has it. Preserved exactly; the hover-target selector list was extended to cover the identity-section links.

**FACTS.md — found at `rebuild:handoff/FACTS.md`** (status: APPROVED 2026-07-06). Not present on `main`.

**"Rebrand" for KAB — verified, twice.** FACTS.md §3: "Complete rebrand of a 70-year-old national nonprofit," with Helen Lowman (CEO) on record: "successfully led the rebranding efforts." Existing site copy agrees — [about/index.html:870](about/index.html:870) and [work/index.html](work/index.html). The hero role line ships as written: *Creative Director. National rebrand and PSA system.*

**`<!-- KAB_SOURCE_URL -->` markers placed: 4 — settled, all four stay.**

| # | File | Placement |
|---|---|---|
| 1 | [index.html](index.html) | homepage hero-case outcome line |
| 2 | [work/index.html](work/index.html) | metric row — "11.9M Participants (org-reported)" |
| 3 | [work/index.html](work/index.html) | lead case `#case-kab` outcome line |
| 4 | [work/index.html](work/index.html) | KAB archive card — `$300M` (see §5) |

All four hardcode `https://kab.org/annual-reviews-financial-reports/` with the comment on the same line. `org-reported` is attached **only** to Tier B numbers (11.9M / $300M). Never to 160K+, $77.5M or 4.5M+.

**Attribution sweep, whole repo:** zero hits for `745`, zero for "National CleanUp Day", zero for "20 years" / "20+ years".

---

## 2. What changed, per page

### `/` — [index.html](index.html) · `a0e14f3`, `661806f`, `acb03b5`, `3f19f6c`, `5ff0c30`

**Base (`a0e14f3`).** New `.identity` section, **first in DOM**, all real static text. The fixed orange "START HERE." band is gone from the top, demoted to a tertiary text link that keeps its "not sure where to go?" vernacular. `.split-container` and `.third-strip` moved from `position: fixed` to static flow — **the page scrolls**; MY WORK. / MY STORY. and the WHAT I'M BUILDING. strip are the first scroll. Zero-chrome preserved: no `nav.js`, no footer injection; the contact line is plain markup. The hero-case visual reuses the Greatest American Cleanup brand image already on `/nonprofit/`.

**Current fold order (`5ff0c30`).** The two viewports show the same content in a different sequence:

| Position | Desktop (>700px) — visual order | Mobile (≤700px) — visual order = DOM order = tab order |
|---|---|---|
| 1 | `// creative director — dallas–fort worth` label | *(label hidden)* |
| 2 | Name — Tim Shephard | Name — Tim Shephard |
| 3 | Headline — Creative Director | Headline — Creative Director |
| 4 | Subhead | Subhead |
| 5 | Availability line | Availability line |
| 6 | **4 proof chips** | **Primary CTAs** — see the work / let's talk / my story |
| 7 | **Dual-track line** | **Dual-track line** |
| 8 | **Primary CTAs** — see the work / let's talk / my story | **4 proof chips** |
| 9 | KAB hero case | KAB hero case |
| 10 | Tertiary Explore link | Tertiary Explore link |
| 11 | Contact line | Contact line |

**How the split works.** The HTML is written in the **mobile** order. Below 700px there is no reordering at all — the label is hidden and the section's top padding drops from 52px to 36px. Above 700px, `.id-inner` becomes a flex column and CSS `order` restores the desktop sequence. Two flex side-effects are compensated so desktop renders pixel-identically to `acb03b5`:
- `.id-ctas { margin-top: 0 }` — flex items don't collapse margins, so without this the gap above the CTAs would double.
- `.id-tertiary { margin-bottom: 1px }` — reproduces the 16px line box the inline link had in block flow (measured at exactly 1.000px).

**Why it's built this way:**
- **Real-device height.** 390×844 is the headless viewport; a real iPhone shows roughly 660–740px after Safari's chrome. Identity and the contact action have to fit that true first screen, so on mobile the CTAs come before the 400px chip stack.
- **Chip framing.** Two cold recruiter reads stopped at the fold, saw chip 4 ("Currently shipping — The Lab · Kindora · AI Daily Digest") with no framing, and read it as side-hustle / flight risk. The line *"I lead creative teams. I also ship AI products. Same bar for both."* now travels with the chips on both viewports: as their caption on desktop, as their introduction on mobile — so chip 4 never appears without it.
- **Tab order.** An earlier version (`3f19f6c`) reordered mobile with CSS, which left keyboard and screen-reader users reaching the chips before the CTAs they could see first. Writing the HTML in mobile order fixes that where it matters. Desktop's visual order no longer matches DOM, which is acceptable there: everything sits in one screen, and CTAs-then-chips is a sensible tab order.

**Where things land** (headless Chromium, reduced motion):

| | 1440×900 | 390×844 | 390×700 |
|---|---|---|---|
| Primary CTAs | 528–574 | **251–329** | **251–329** |
| Dual-track line | 461–494 | 361–431 | 361–431 |
| Chips | 329–439 | 1–3 fully visible | 1–2 fully visible |
| KAB hero case | starts 614 (title and outcome in first screen; its button at 918) | starts 891 | starts 891 |

### `/projects/` — [projects/index.html](projects/index.html) · `779a365`
- **Website Audit & Rebuild — kept and demoted by Tim's decision. This deliberately overrides brief section E7** ("delete the card", "remove entirely"). **Do not "fix" it by deleting the card.** It moved from first to last; card markup, status treatment, copy and the `sites.timshephard.co` link (`target="_blank" rel="noopener noreferrer"`) are unchanged. The copy already carried no price, no "300+ sites", no "20 years".
- Final order: The Lab · AI Daily Digest · Kindora · The Other 1776 · Tim & The Time Machine · Website Audit & Rebuild.
- Intro copy untouched (Ship 2+).

### `/work/` — [work/index.html](work/index.html) · `fc7b3b2`
- H1 stays `My Work.` with the existing `Selected Work` eyebrow — no second headline. New subhead: *"Open these three first. Then what I'm building. Then everything else."*
- Metric row: `15+ Years · 5 Verticals · 11.9M Participants (org-reported) · NAGC Blue Pencil & Gold Screen · 160K+ PSA Airings`. The standalone `$300M Org. Impact` chip is gone.
- **Three lead cases before the filter strip and grid**: `#case-kab`, `#case-dhs`, `#case-ecrion` — each with role, one visual reused from its vertical page, an outcome line and a deep link. `scroll-margin-top` keeps them clear of the sticky nav.
- **Builder section** "Also shipping." — The Lab, AI Daily Digest, Kindora (all new-tab). No Time Machine, no gaming, no audit/rebuild anywhere on this page.
- **Archive** "Everything else." — the existing filtered grid, cards capped at 250px. The filter strip sits in this section inside a sticky wrapper with `role="group"`, `aria-label="Filter categories"` and a mobile edge fade.
- One Thousand Voices card relabelled `One Thousand Voices (ISCS)`: *"Founded · communication strategy & field storytelling · 2014–2022"* (existing card rewritten, not duplicated).
- Athens / Apocalypto copy untouched; visually demoted to the archive. Copy rewrite is Ship 2.

### `/hire/` — [hire/index.html](hire/index.html) · `01dc27f`
- Existing H1 kept (`Let's Build This.`). New subhead: *"Fractional and contract first. Full-time, let's talk."*
- **Lane 1 — Recruiters & hiring managers**, above Lane 2: *"Email or LinkedIn works. No form."* — mailto, the page's existing LinkedIn href (new tab), a `Dallas–Fort Worth` row, pills `// fractional & contract — first` and `// full-time — open`, and *"Engagements via Creative Mind Ventures LLC"*. No fields, no required inputs, no budget control.
- **Lane 2 — Clients & project inquiries**, with the page's own intake line and the **Formspree form unchanged** — same fields, engagement types, budget pills and "I typically respond within 24 hours."
- Personalised Brief quiz untouched, still `// Optional — takes 2 minutes`; `/api/brief` wiring not modified.
- Bottom bar reordered fractional-first; location normalised from `Dallas / Fort Worth, TX` to `Dallas–Fort Worth`.
- **The form was never submitted and no one was contacted.**

### Anchors — [nonprofit/index.html](nonprofit/index.html), [gov/index.html](gov/index.html), [tech/index.html](tech/index.html) · `fc7b3b2`
One anchor span each (`#kab`, `#dhs`, `#ecrion`) with `scroll-margin-top`. Anchor markup only — no other change to those pages.

### First paint — [projects/index.html](projects/index.html), [work/index.html](work/index.html) · `8f50abd`
- `/projects/` was the P0: hero label, H1 and description were `opacity: 0` until a delayed animation ran, and every card was `opacity: 0` behind an IntersectionObserver. All now paint immediately; motion is transform-only.
- `/work/` archive cards: `cardIn` converted to transform-only.
- `prefers-reduced-motion: reduce` added to all four Ship 1 pages (it existed nowhere in the repo before).

---

## 3. Grep hit list — before, and what happened

| Pattern | Hits before | After |
|---|---|---|
| `sites.timshephard.co` | 1 — `projects/index.html` card link | **Kept by decision**, card moved to last (overrides brief E7) |
| `1,500` | 0 | — |
| `1500` | 1 — `gaming/index.html` *"glass-making around 1500 BC"* | Left alone (unrelated) |
| `Website Audit` | 2 — comment + card name in `projects/index.html` | **Kept by decision**, moved to last |
| `300+ Sites` | 0 | — |
| `audit` (case-insensitive) | 6 — the 3 in `projects/index.html`; `entertainment/index.html` *"audited at the highest level"*; `tech/index.html` *"Audit brand, audience…"*; and 3 in [shared/adventure.js](shared/adventure.js) naming an audit platform as a CMV venture | Card copy kept. Two unrelated uses left alone. **adventure.js deferred to Ship 2** (see §5). |

**Nothing was removed.** No audit/rebuild mention existed on the homepage, in nav/footer, or on `/hire/`.

---

## 4. Placeholders and things awaiting you

**No placeholder dates were introduced.** Every date shipped (2014–2022 for One Thousand Voices) is confirmed in FACTS.md §3.

**LinkedIn href reused — please confirm it's current:**
```
https://www.linkedin.com/in/tim-shephard
```
Taken verbatim from the existing `/hire/` markup; used in Lane 1 and on the homepage contact line, both `target="_blank" rel="noopener noreferrer"`.

**Open fact questions from FACTS.md §8 (still open):**
1. NAGC award specifics — exact certificate wording: category, placement, year, one honour or two. Gates the Ship 2 pass in §5.
2. DHS title qualifier — "Lead Creative Director" on older pages is unconfirmed; copy says "Creative Director".
3. Early-career employment span — old pages conflict; no span claim shipped.
4. "Est. 2005" on the old nonprofit masthead — unconfirmed, omitted.
5. Rick Ringel quote — recommendation exists, no verbatim text.

---

## 5. Decisions — settled, open, and deferred

### Settled

**NAGC ships FACTS.md wording.** Ship 1 pages use "NAGC Blue Pencil & Gold Screen Award", not "1st Place":
- homepage chip 2 → `Led a team of 10 · NAGC Blue Pencil & Gold Screen`
- `/work/` metric row → `NAGC / Blue Pencil & Gold Screen`
- `/work/` `#case-dhs` outcome → `NAGC Blue Pencil & Gold Screen Award.`
- `/work/` DHS grid card → `NAGC / Blue Pencil`; Mobilizing Innovation card → `Gold / Screen Award`

**Remaining placement claims are deferred to Ship 2, pending the certificate** — to be resolved in one pass. Current count, re-verified by grep at `5ff0c30`: **16 "1st Place" / "First Place" occurrences across 7 pages**, plus one related claim:

| Page | Occurrences |
|---|---|
| `/gov/` | 6 |
| `/about/` | 2 — **plus** `NAGC — 2× Winner` in fast facts |
| `/branding/` | 2 |
| `/entertainment/` | 2 |
| `/gaming/` | 1 |
| `/nonprofit/` | 1 |
| `/tech/` | 1 |

*(An earlier version of this file said "eight other pages"; the correct figure is seven.)* Note that [gov/index.html](gov/index.html) and [branding/index.html](branding/index.html) state the category — **"First Place in Electronic Publication"** — which may answer FACTS.md §8 item 1 directly once checked against the certificate. Until that pass, the site is knowingly inconsistent: `/` and `/work/` say Blue Pencil, the seven pages above say First Place.

**Fourth `KAB_SOURCE_URL` marker stays.** The KAB archive card on `/work/` read *"$300M documented economic impact"* bare — a Tier B number next to Tim's name with no label, which the FACTS.md attribution law forbids. It carries the `org-reported` citation.

**Website Audit & Rebuild stays on `/projects/`, demoted to last.** Overrides brief E7. See §2.

### Still open

**Title: "Creative Director" vs FACTS.md's "Senior Creative Director".** FACTS.md §2 says the title is *Senior* Creative Director "everywhere, per ruling". The Ship 1 prompt's exact copy says `Creative Director`, and that is what shipped on the homepage and in the lead cases. Not yet ruled on.

**Anchor fragments through the trailing-slash redirect** — unverified on a live deployment (see §6).

### Known Ship 2 items found along the way

1. **`/hire/` H1 gap.** Visible gap between "BUILD" and "THIS." caused by a `<br>` after the `display: block` `<em>Build</em>` at [hire/index.html:297](hire/index.html:297). Pre-existing, not introduced by this branch. One-line fix.
2. **`shared/adventure.js` still names an audit platform in Explore copy.** Lines 45, 48 and 56 describe Creative Mind Ventures as building "an automated audit platform" / "a website audit platform" / "an AI audit platform". No link, no price, no card — but it's the last audit-offer language outside `/projects/`.

### Also noted (Ship 4)

On `/work/`, the DHS grid card's stat label sits over the poster artwork's own headline and is partly hard to read. The original "1st Place" label had the same collision, so it isn't a regression; it belongs with the lead-case imagery polish.

**Not started:** Ship 2, 3 and 4 — entertainment copy cuts, gov "zero-fail" de-spam, About reorder, `/sky` redirect, robots/sitemap.

---

## 6. Preview URLs and how this was verified

**Every commit has its own immutable deployment.** From GitHub's deployment records:

| Commit | Deployment URL |
|---|---|
| **`5ff0c30`** (current fold) | https://timshephard-portfolio-mtxwgz2w0-timshephard-creates-projects.vercel.app |
| `3f19f6c` | https://timshephard-portfolio-1ujqvlp1h-timshephard-creates-projects.vercel.app |
| `acb03b5` | https://timshephard-portfolio-hnzvjdnk9-timshephard-creates-projects.vercel.app |
| `661806f` | https://timshephard-portfolio-a21ue6p9c-timshephard-creates-projects.vercel.app |
| `c352cd2` — **graded by the two cold reviews** (pre-fold changes) | https://timshephard-portfolio-d3hyahrlw-timshephard-creates-projects.vercel.app |
| `8f50abd` | https://timshephard-portfolio-ojrr67soi-timshephard-creates-projects.vercel.app |

The commit that adds this refreshed file gets its own deployment too; its pages are identical to `5ff0c30`.

**Branch alias:** https://timshephard-portfolio-git-s-ec1286-timshephard-creates-projects.vercel.app — Vercel moves it to the newest ready deployment on the branch. Not independently confirmed, because the alias sits behind the protection wall.

**Verification through the protection wall: not achieved.** Every preview returns a 302 to `vercel.com/sso-api`. There is no Protection Bypass secret in the environment and the Vercel CLI in the build session was unauthenticated. From the live previews there is a deployment-exists signal and nothing more.

**What was verified instead** — Playwright + headless Chromium against a local static server serving the exact branch content:

| Check | Result |
|---|---|
| `/`, `/work/`, `/projects/`, `/hire/` at 1440×900 and 390×844 | Render correctly; no horizontal overflow at 390 |
| First paint (zero settle delay) | Identity, headings and primary content visible on all four pages; `/projects/` was blank before this branch |
| JavaScript disabled, homepage | All identity, CTA, dual-track, chip, citation, Explore and contact strings render from static HTML |
| `prefers-reduced-motion: reduce` | Content at rest, fully visible |
| Homepage desktop parity, `5ff0c30` vs `acb03b5` | Full-page screenshots **pixel-identical** at 701, 768, 1000, 1280 and 1440px (images and fonts loaded before capture) |
| Homepage mobile first screen | CTAs + dual-track line + chips 1–2 fully visible at both 390×844 and 390×700 |
| Homepage tab order at 390px | see the work → let's talk → my story → 4 chips → org-reported → open the case → Explore |
| All six anchors — `/work/#case-kab`, `#case-dhs`, `#case-ecrion`, `/nonprofit/#kab`, `/gov/#dhs`, `/tech/#ecrion` | Resolve and land clear of the 52px nav |
| Console + page errors | None (one pre-existing site-wide favicon 404) |
| Integrations | Formspree `xnjgddyr` ×1, GA4 `G-82B9C9WGMG` ×2, `/api/brief` ×2 on `/hire/` |

**What local testing cannot prove:** that `trailingSlash: false` keeps the fragment when `/work/#case-kab` redirects to `/work#case-kab`. Browsers preserve fragments across 3xx when the target carries none, so it should hold — but it needs one click on a live preview while signed in to Vercel, or a linked `vercel dev`, which emulates the routing.

---

## 7. Acceptance checklist (brief section G) — re-marked against `5ff0c30`

| # | Item | Status |
|---|---|---|
| 1 | Homepage fold shows name, Creative Director, Dallas–Fort Worth, fractional-first availability, 4 chips, KAB hero, View work + Hire | **done on desktop** — all in the 1440×900 first screen except the KAB case's own button. **Mobile by design:** identity, CTAs and dual-track line are in the first screen with chips 1–2 (chip 1 is the KAB proof); the full KAB hero case is one scroll down. Uses the prompt's copy, not the brief's strings |
| 2 | No `sites.timshephard.co` / $1,500 audit anywhere on timshephard.co | **kept on /projects/ by decision** — overrides brief E7; no $1,500 figure exists anywhere in the repo. Remaining non-link audit mention in `shared/adventure.js` → Ship 2 |
| 3 | `/work/` opens with KAB → DHS → Ecrion, then builder trio, then archive | **done** |
| 4 | Athens/Apocalypto have no leadership-scale numbers or "no safety net" language | **not in Ship 1** — visually demoted to the archive; copy rewrite is Ship 2 |
| 5 | `/hire/` shows email + LinkedIn before any form; form only in client lane | **done** |
| 6 | Hard refresh: no blank heroes on Ship 1 pages | **done** — zero-delay screenshots on all four; homepage also verified with JavaScript disabled |
| 7 | iPhone-width: Work filters not clipped without affordance | **done** — sticky wrapper, `overflow-x: auto`, edge fade, `aria-label="Filter categories"` |
| 8 | `lab.timshephard.co/sky` redirects to working sky route | **not in Ship 1** (Ship 3; different property) |
| 9 | Location never names a specific city beyond Dallas–Fort Worth / DFW | **done on Ship 1 pages** — other pages not audited (Ship 3) |
| 10 | Experience says 15+ only | **done** — zero "20 years" hits repo-wide |
| 11 | KAB metrics marked org-reported and link to the source | **done** on the 4 Ship 1 placements (settled). `/about/` and `/nonprofit/` first-mention citations are Ship 2 (brief E6) |
| — | robots.txt / sitemap.xml | **not in Ship 1** (Ship 3) |

---

## Before merge

1. **NAGC certificate → one pass** across the 16 occurrences on 7 pages, plus `/about/`'s "2× Winner".
2. **Rule on "Creative Director" vs "Senior Creative Director"** (FACTS.md §2).
3. **Click a proof chip on the `5ff0c30` preview** to confirm the anchor survives the trailing-slash redirect.
4. **Load the homepage on a real phone** — the mobile first screen was sized for ~700px of usable height.

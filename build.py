#!/usr/bin/env python3
"""Portfolio build script — processes source pages into production HTML."""
import re, os, base64

SRC = r'C:\Users\timsh\AppData\Local\Temp'
DEST = r'C:\Users\timsh\timshephard-portfolio'

GA4 = '''  <!-- GA4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-82B9C9WGMG"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-82B9C9WGMG');
  </script>'''

FONTS = '  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,300;0,700;0,900;1,700;1,900&family=DM+Mono:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">'

# ─── helpers ────────────────────────────────────────────
def rf(p):
    with open(p, 'r', encoding='utf-8', errors='replace') as f:
        return f.read()

def wf(p, c):
    d = os.path.dirname(p)
    if d:
        os.makedirs(d, exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)

def get_css(html):
    m = re.search(r'<style>(.*?)</style>', html, re.DOTALL | re.IGNORECASE)
    css = m.group(1) if m else ''
    # Keep :root{} blocks — they contain essential page-specific CSS variables
    css = re.sub(r'@import\s+url\([^)]*googleapis[^)]*\)\s*;', '', css)
    # strip any kill-squarespace-chrome comment blocks from source pages
    css = re.sub(r'/\*[^*]*KILL SQUARESPACE CHROME[^*]*\*/.*?(?=\n/\*|\Z)', '', css, flags=re.DOTALL | re.IGNORECASE)
    return css.strip()

def get_fonts(html):
    """Extract per-page Google Fonts <link> tag from source; fall back to default."""
    m = re.search(r'<link\b[^>]*href=["\']https://fonts\.googleapis\.com[^"\']+["\'][^>]*>', html)
    if m:
        tag = m.group(0)
        # ensure display=swap is present
        if 'display=swap' not in tag:
            tag = tag.replace('rel="stylesheet"', 'rel="stylesheet"').replace(
                re.search(r'href=["\']([^"\']+)["\']', tag).group(1),
                re.search(r'href=["\']([^"\']+)["\']', tag).group(1) + '&display=swap'
                if '?' in re.search(r'href=["\']([^"\']+)["\']', tag).group(1) else
                re.search(r'href=["\']([^"\']+)["\']', tag).group(1) + '?display=swap'
            )
        return '  ' + tag
    return FONTS

def get_body(html):
    m = re.search(r'<body>(.*)</body>', html, re.DOTALL | re.IGNORECASE)
    return m.group(1).strip() if m else ''

def strip_nav(body):
    return re.sub(r'<nav\b[^>]*>.*?</nav>', '', body, count=1, flags=re.DOTALL)

def strip_footer(body):
    return re.sub(r'<footer\b[^>]*>.*?</footer>', '', body, flags=re.DOTALL)

def extract_b64_image(html, out_path):
    m = re.search(r'src="data:image/jpeg;base64,([A-Za-z0-9+/=\r\n]+)"', html)
    if m:
        b64 = re.sub(r'[\r\n\s]', '', m.group(1))
        try:
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            with open(out_path, 'wb') as f:
                f.write(base64.b64decode(b64))
            html = html.replace(m.group(0), 'src="/images/tim-shephard.jpg"')
            print('  [img] Extracted photo ->', out_path)
        except Exception as e:
            print('  [img] Failed:', e)
    return html

def page(title, nav_id, body, css, prefix='../', dark=False, has_nav=True, fonts=None):
    nav_attr = ' data-theme="dark"' if dark else ''
    nav_elem = '  <header id="site-nav" data-page="{nav_id}"{nav_attr}></header>\n'.format(
        nav_id=nav_id, nav_attr=nav_attr) if has_nav else ''
    fonts_tag = fonts if fonts else FONTS
    return (
        '<!DOCTYPE html>\n'
        '<html lang="en">\n'
        '<head>\n'
        '  <meta charset="UTF-8">\n'
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
        '  <title>' + title + '</title>\n'
        '  <link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
        fonts_tag + '\n'
        '  <link rel="stylesheet" href="/shared/styles.css">\n' +
        GA4 + '\n'
        '  <style>\n' +
        css + '\n'
        '  </style>\n'
        '</head>\n'
        '<body>\n' +
        nav_elem +
        body + '\n'
        '  <footer id="site-footer"></footer>\n'
        '  <script src="/shared/nav.js" defer></script>\n'
        '</body>\n'
        '</html>\n'
    )

def sub(html, old, new):
    # Try multiple typography normalizations — Squarespace inconsistently uses
    # HTML entities (&mdash; &#8217; etc.) and literal Unicode in the same source.
    def variants(s):
        results = {s}
        for apos_in, apos_outs in [('\u2019', ["'", '&#8217;']), ('\u2018', ["'", '&#8216;'])]:
            for em_in, em_outs in [('\u2014', ['&mdash;', '&#8212;']), ('\u2013', ['&ndash;', '&#8211;'])]:
                for ldq_in, ldq_outs in [('\u201c', ['"', '&#8220;'])]:
                    for rdq_in, rdq_outs in [('\u201d', ['"', '&#8221;'])]:
                        for ao in apos_outs + [apos_in]:
                            for eo in em_outs + [em_in]:
                                for lo in ldq_outs + [ldq_in]:
                                    for ro in rdq_outs + [rdq_in]:
                                        results.add(
                                            s.replace(apos_in, ao).replace(em_in, eo)
                                             .replace(ldq_in, lo).replace(rdq_in, ro))
        return results
    for candidate in variants(old):
        if candidate in html:
            return html.replace(candidate, new, 1)
    print('  [warn] NOT FOUND: ' + repr(old[:70]))
    return html

# ═══════════════════════════════════════════════════════
# BUILD PAGES
# ═══════════════════════════════════════════════════════

# ── 1. index.html ───────────────────────────────────────
print('Building index.html...')
src = rf(SRC + '/pg_index.html')
css = get_css(src)
body = get_body(src)
body = re.sub(r'<nav\b[^>]*>.*?</nav>', '', body, count=1, flags=re.DOTALL)
body = strip_footer(body)
body = body.replace("onclick=\"window.location.href='/branding'\"",
                    "onclick=\"window.location.href='/work/'\"")
body = body.replace("href=\"/branding\" class=\"panel-cta\"",
                    "href=\"/work/\" class=\"panel-cta\"")
wf(DEST + '/index.html',
   page('Tim Shephard \u2014 Creative Director', '', body, css, has_nav=False, fonts=get_fonts(src)))
print('  done')

# ── 2. work/index.html ──────────────────────────────────
print('Building work/index.html...')
src = rf(SRC + '/pg_work.html')
css = get_css(src)
body = strip_footer(strip_nav(get_body(src)))
body = sub(body,
    '<span class="page-stat-num">6</span><span class="page-stat-label">Industries</span>',
    '<span class="page-stat-num">5</span><span class="page-stat-label">Verticals</span>')
wf(DEST + '/work/index.html',
   page('Work \u2014 Tim Shephard', 'Work', body, css, dark=True, fonts=get_fonts(src)))
print('  done')

# ── 3. about/index.html ─────────────────────────────────
print('Building about/index.html...')
src = rf(SRC + '/pg_about.html')
src = extract_b64_image(src, DEST + '/images/tim-shephard.jpg')
css = get_css(src)
body = strip_footer(strip_nav(get_body(src)))
body = sub(body, '<h2>Fifteen Years.<br>Six Industries.<br>One Method.</h2>',
    '<h2>Most Creative Directors Have a Lane.</h2>')
body = sub(body,
    "I\u2019m a Creative Director with an unusual r\u00e9sum\u00e9. Most CDs pick a lane \u2014 agency, in-house, tech, nonprofit \u2014 and stay in it. I\u2019ve directed creative work at the highest level across six fundamentally different industries: gaming, entertainment and film, nonprofit and social impact, tech and SaaS, federal government, and brand identity.",
    "Most Creative Directors have a lane. I\u2019ve built mine differently.")
body = sub(body,
    "That range isn\u2019t accidental. It\u2019s the result of a consistent methodology \u2014 a framework for closing the gap between what an organization has built and what its audience actually believes. The application changes with every vertical. The core question never does: <em>what does a human need to believe in order to act?</em>",
    "Fifteen years across nonprofit, federal government, tech, entertainment, and brand. Each one a completely different environment \u2014 different constraints, different audiences, different definitions of what success even looks like. The methodology is the same every time. The application never is.")
body = sub(body,
    "The best creative work doesn\u2019t just reach an audience. It moves them \u2014 from passive viewers to active participants, from interested to committed, from aware to changed.",
    "The best creative doesn\u2019t just reach people. It changes what they do.")
body = sub(body,
    "Multi-vertical creative consultancy operating across nonprofit, tech, government, and entertainment. Communication strategy and creative systems deployed across all client engagements. Available fractional for strategic creative leadership.",
    "Cross-sector creative direction. Nonprofit, tech, government, entertainment. Communication strategy applied to brand \u2014 closing the gap between what organizations build and what their audiences actually believe.")
body = sub(body,
    "Led the complete rebrand of a 70-year-old national nonprofit \u2014 identity, digital infrastructure, affiliate toolkits, and the national \u201cRecycle Like Everyone\u2019s Watching\u201d PSA campaign. <strong>160,000+ PSA airings. 50 states. Supported a national movement that mobilized 11.9M participants and $300M in organizational economic impact.</strong>",
    "Led the complete rebrand of a 70-year-old national nonprofit. New identity, affiliate toolkits, digital infrastructure. The \u201cRecycle Like Everyone\u2019s Watching\u201d PSA campaign earned 160,000+ airings across all 50 states. The organization mobilized 11.9M participants and generated $300M in documented economic impact that year.")
body = sub(body,
    "Directed high-compliance creative operations and interactive media for the Department of Homeland Security Science & Technology Directorate. Managed a 10-person cross-functional team. <strong>NAGC First Place \u2014 \u201cMobilizing Innovation\u201d interactive digital experience. 100% Section 508 compliance.</strong>",
    "Creative Director for DHS Science &amp; Technology. Led a 10-person team through federal communications, interactive digital experiences, and print \u2014 all cleared through a multi-tier compliance pipeline. NAGC First Place. Section 508. Both.")
body = sub(body,
    "Complete brand and GTM rebuild for a global enterprise SaaS platform. New identity, web architecture, brand mascot system \u2014 a first in the enterprise document automation category. Conversion-focused UX built to reduce onboarding churn and improve lead quality.",
    "Full rebrand and GTM rebuild for a European enterprise SaaS company entering North America. New identity, messaging framework, web architecture, and demand gen from scratch \u2014 including a brand mascot system that was a first in the document automation category.")
body = sub(body,
    "Independent creative direction, production, and brand work across entertainment and media. Credits include content reaching <strong>4 billion viewers at the Athens Olympics</strong>, and creative contribution to the $40M Mel Gibson feature <em>Apocalypto</em>. One Thousand Voices NGO \u2014 documentary and campaign work.",
    "Camera crew on the Athens 2004 Olympic Games broadcast \u2014 one of the most-watched events in TV history. In-office at Icon Productions during the $40M Mel Gibson feature Apocalypto. Founded One Thousand Voices \u2014 eight years of documentary and advocacy creative for humanitarian organizations in the Middle East.")
body = sub(body, 'The Brief Is a Diagnosis', 'Start With the Real Problem')
body = sub(body,
    "Most briefs describe what a client wants. The real work is figuring out what they actually need \u2014 and those are rarely the same thing. I spend more time on diagnosis than most teams spend on execution.",
    "Most briefs describe what someone wants. The real work is figuring out what they actually need. Those are rarely the same thing. I spend more time on diagnosis than most teams spend on execution.")
body = sub(body, 'Design for the Worst Case', 'Build for the Field')
body = sub(body,
    "A brand system that only works at headquarters is a style guide, not a brand. I test every system against the hardest real-world scenario: a local chapter with no budget, no designer, and ten minutes.",
    "A brand system that only works at headquarters isn\u2019t a brand system. I build for the worst case: no designer, no budget, ten minutes. If it holds there, it holds everywhere.")
body = sub(body, 'Constraints Are the Creative', 'Constraints Make Better Work')
body = sub(body,
    "Section 508 compliance. Federal approval pipelines. 20,000 affiliate partners. Every constraint I\u2019ve worked within has produced better work than the unconstrained version would have. Limitations force clarity.",
    "Section 508 compliance. Federal approval pipelines. 20,000 affiliate partners. Every constraint I\u2019ve worked inside has produced better work than the unconstrained version would have. Limitations force clarity.")
body = sub(body, 'Behavior Is the Metric', 'Measure What Changes')
body = sub(body,
    "Impressions are a starting point, not an outcome. The work isn\u2019t finished when it launches \u2014 it\u2019s validated by what people actually do afterward. 160,000+ PSA airings. A national movement reaching 11.9M participants. That\u2019s the standard.",
    "Impressions aren\u2019t an outcome. The work isn\u2019t done when it launches \u2014 it\u2019s done when people change what they do. That\u2019s the standard I hold myself to.")
body = sub(body, "Ready to Work<br><em>Together?</em>",
    "Let\u2019s Figure Out If We\u2019re the Right Fit.")
body = sub(body,
    "Full-time or fractional \u2014 let\u2019s figure out how I can help your organization close the gap between strategy and results.",
    "Full-time or fractional. Drop me a line and we\u2019ll know in 20 minutes.")
wf(DEST + '/about/index.html',
   page('About \u2014 Tim Shephard', 'About', body, css, fonts=get_fonts(src)))
print('  done')

# ── 4. hire/index.html ──────────────────────────────────
print('Building hire/index.html...')
src = rf(SRC + '/pg_hire.html')
css = get_css(src)
body = strip_footer(strip_nav(get_body(src)))
body = sub(body,
    "Whether you need a <strong>full-time Creative Director</strong> or a <strong>fractional strategic partner</strong> \u2014 I build creative systems that close the gap between what you\u2019ve built and what your audience believes.",
    "Full-time or fractional. I build creative systems that turn strategy into results \u2014 across nonprofit, tech, government, entertainment, and brand. Drop your details and I\u2019ll come back with something useful.")
body = sub(body, "Tell Me<br>About <em>Your</em><br>Project.",
    "Tell me what you\u2019re working on.")
body = sub(body, "// Gate 01 of 02 &mdash; 60 seconds", "60 seconds. No commitment.")
wf(DEST + '/hire/index.html',
   page('Hire \u2014 Tim Shephard', 'Hire', body, css, fonts=get_fonts(src)))
print('  done')

# ── 5. recommendations/index.html ───────────────────────
print('Building recommendations/index.html...')
src = rf(SRC + '/pg_rec.html')
css = get_css(src)
body = strip_footer(strip_nav(get_body(src)))
body = re.sub(
    r'<h1 class="hero-h1">\s*<span class="stroke">Peer</span>\s*<em>Validated\.</em>\s*</h1>',
    '<h1 class="hero-h1">People Talk.</h1>', body)
body = sub(body,
    "CEOs, CMOs, Directors, and peers \u2014 across nonprofit, federal government, tech, and media \u2014 on what it\u2019s actually like to work with Tim.\n        <strong>These aren\u2019t endorsements. They\u2019re operational accounts.</strong>",
    "These aren\u2019t traded LinkedIn endorsements. These are the people I\u2019ve actually worked with \u2014 at national nonprofits, federal agencies, global software companies, and on Hollywood productions. Here\u2019s what they say.")
wf(DEST + '/recommendations/index.html',
   page('Recommendations \u2014 Tim Shephard', 'Recommendations', body, css, fonts=get_fonts(src)))
print('  done')

# ── 6. nonprofit/index.html ─────────────────────────────
print('Building nonprofit/index.html...')
src = rf(SRC + '/pg_nonprofit.html')
css = get_css(src)
body = strip_footer(strip_nav(get_body(src)))
body = sub(body,
    "The brand wasn\u2019t broken. It was dormant. We woke it up \u2014 and built the infrastructure for 11.9 million people to show up.",
    "The brand wasn\u2019t broken. It was dormant. We woke it up \u2014 and built the infrastructure for a national movement to show up.")
body = sub(body, '<div class="sidebar-label">Movement Reach</div>',
    '<div class="sidebar-label">Movement Participants (Org Scale)</div>')
body = sub(body,
    "One Thousand Voices was founded in 2014 as a mission-driven storytelling organization operating as a DBA of ISCS Group. The mandate was specific: <strong>amplify the voices of populations whose stories weren\u2019t reaching the audiences who needed to hear them.</strong>",
    "One Thousand Voices was founded in 2014 to do one thing: get the stories of people in crisis in front of the audiences who needed to hear them.")
body = sub(body,
    "This wasn\u2019t agency work with a nonprofit client. It was <em>creative direction as an act of advocacy</em> \u2014 built from scratch, resourced through partnerships, and sustained for eight years because the mission justified the effort. The skills that make a PSA earn 160,000 airings are the same skills that make a refugee story impossible to ignore.",
    "This wasn\u2019t agency work with a nonprofit client. It was creative direction as advocacy \u2014 built from scratch, resourced through partnerships, sustained for eight years because the work mattered.")
wf(DEST + '/nonprofit/index.html',
   page('Nonprofit \u2014 Tim Shephard', 'Nonprofit', body, css, dark=True, fonts=get_fonts(src)))
print('  done')

# ── 7. entertainment/index.html ─────────────────────────
print('Building entertainment/index.html...')
src = rf(SRC + '/pg_ent.html')
css = get_css(src)
body = strip_footer(strip_nav(get_body(src)))
body = sub(body, '<span class="hero-stat-lbl">Olympic Viewers</span>',
    '<span class="hero-stat-lbl">Broadcast Audience</span>')
body = sub(body,
    "Camera crew member for the <strong>2004 Athens Summer Olympics broadcast</strong> \u2014 one of the most watched events in television history. Managed audio across multiple simultaneous live events, coordinating with international broadcast teams under zero-failure, no-second-take conditions.",
    "Part of the camera crew for the 2004 Athens Summer Olympics broadcast \u2014 one of the most-watched events in television history. Managed audio across simultaneous live events, coordinating with international broadcast teams under zero-failure conditions.")
body = sub(body,
    "This is what high-stakes production looks like in practice: no retakes, no safety nets, no margin for creative indecision. Every shot counts. The same discipline drives every campaign I lead.",
    "No retakes. No safety net. Every shot counted. That discipline lives in every project I\u2019ve led since.")
body = sub(body,
    "Worked in-office at <strong>Icon Productions</strong> during production of Mel Gibson\u2019s Apocalypto \u2014 a $40M epic feature film. Front-row seat to high-budget, high-pressure creative decision-making at the executive and director level.",
    "Worked in-office at Icon Productions during production of Mel Gibson\u2019s Apocalypto \u2014 a $40M feature film. Front row to high-budget, high-pressure creative decision-making at the director and executive level.")
body = sub(body,
    "The creative standards, production discipline, and storytelling rigor of major feature film production don\u2019t stay in the building \u2014 they become the benchmark for everything after it. <strong>I brought those standards into every campaign, every brand, every creative brief.</strong>",
    "Hollywood\u2019s creative standards don\u2019t stay in the building. They become the benchmark for everything after.")
body = sub(body,
    "Creative directed a national PSA campaign that aired <strong>over 160,000 times across all 50 states</strong> \u2014 equivalent in production scale, distribution complexity, and creative discipline to a major entertainment marketing push.",
    "Led the creative direction of a national PSA campaign that aired 160,000+ times across all 50 states \u2014 the scale and distribution complexity of a major entertainment marketing push, on a nonprofit budget.")
body = sub(body,
    "From creative brief through final cut through national distribution: every decision made under the same pressure as broadcast production. The result: <strong>$77.5M in earned media value</strong>, 745M+ impressions, and measurable behavior change at national scale.",
    "Result: $77.5M in earned media value. 745M+ impressions. Creative that broadcasters chose to run.")
wf(DEST + '/entertainment/index.html',
   page('Film &amp; TV \u2014 Tim Shephard', 'Film &amp; TV', body, css, dark=True, fonts=get_fonts(src)))
print('  done')

# ── 8. tech/index.html ──────────────────────────────────
print('Building tech/index.html...')
src = rf(SRC + '/pg_tech.html')
css = get_css(src)
body = strip_footer(strip_nav(get_body(src)))
body = sub(body, '<span class="prompt">&#62;</span> rendering output<span class="dim">...</span>',
    '<span class="prompt">&#62;</span> challenge: european_saas &#8594; north_american_enterprise <span class="ok">&#10003; READY</span>')
body = sub(body,
    "Ecrion Software was a <strong>European enterprise SaaS company</strong> with a strong product and a positioning problem. The software was built for North American enterprise buyers. The brand was not.",
    "Ecrion Software had a strong product and a positioning problem. The software was built for North American enterprise buyers. The brand wasn\u2019t.")
body = sub(body,
    "As Marketing Director, I rebuilt the full go-to-market from scratch \u2014 brand identity, messaging architecture, digital presence, and demand generation. The challenge wasn\u2019t technical. It was <em>perceptual</em>: making an unfamiliar name feel credible, trustworthy, and native to the North American enterprise software market.",
    "As Marketing Director, I rebuilt the full go-to-market: brand identity, messaging architecture, web presence, and demand gen. The challenge wasn\u2019t technical \u2014 it was perceptual. Making an unfamiliar name feel credible, trustworthy, and native to the North American enterprise market in eight seconds.")
body = sub(body,
    "That means understanding how enterprise buyers evaluate vendors before they ever talk to sales. How a brand signals <strong>stability, expertise, and category fit</strong> in the first eight seconds. How messaging has to work at the awareness level, the consideration level, and the evaluation level \u2014 simultaneously.",
    "The result: a complete repositioning. New identity, new website, new messaging framework, and a content engine built around the buyer\u2019s actual problems \u2014 not the product\u2019s feature list.")
body = sub(body,
    "The result was a complete repositioning: new brand identity, new website, new messaging framework, and a demand generation program built on content that spoke to the buyer\u2019s actual problems \u2014 not the product\u2019s features.",
    "")
body = sub(body,
    "Full rebrand and market repositioning. <strong>Brand identity, messaging architecture, digital, and demand generation rebuilt from zero</strong> for a new market, new buyer profile, and new competitive context.",
    "Brand identity, messaging architecture, digital presence, and demand gen rebuilt from zero for a new market, new buyer, and new competitive context.")
wf(DEST + '/tech/index.html',
   page('Tech \u2014 Tim Shephard', 'Tech', body, css, dark=True, fonts=get_fonts(src)))
print('  done')

# ── 9. gov/index.html ───────────────────────────────────
print('Building gov/index.html...')
src = rf(SRC + '/pg_gov.html')
css = get_css(src)
body = strip_footer(strip_nav(get_body(src)))
body = sub(body,
    "The discipline of working inside a rigid framework isn't a limitation. It's a forcing function. The constraints are why the work had to be better.",
    "The constraint isn\u2019t the obstacle. It\u2019s the forcing function. The tighter the framework, the cleaner the work has to be.")
wf(DEST + '/gov/index.html',
   page('Gov \u2014 Tim Shephard', 'Gov', body, css, dark=True, fonts=get_fonts(src)))
print('  done')

# ── 10. branding/index.html ─────────────────────────────
print('Building branding/index.html...')
src = rf(SRC + '/pg_brand.html')
css = get_css(src)
body = strip_footer(strip_nav(get_body(src)))
body = sub(body,
    "A brand isn't a logo. It's the <strong>total sum of every decision</strong> \u2014\n      visual, verbal, behavioral \u2014 that tells the world what an organization believes.\n      I've rebuilt legacy brands, built new ones from zero,\n      and created the systems that make them hold at scale.",
    "A brand isn\u2019t a logo. It\u2019s every decision an organization makes \u2014 visual, verbal, behavioral. I\u2019ve rebuilt legacy brands, built new ones from scratch, and designed the systems that make them hold when nobody\u2019s watching.")
body = sub(body,
    "Every brand decision has a reason. Select a project below to see how each rebrand was diagnosed, what was built, and what moved as a result.",
    "Every brand decision has a reason. Select a project to see how the rebrand was diagnosed, what was built, and what moved as a result.")
wf(DEST + '/branding/index.html',
   page('Branding \u2014 Tim Shephard', 'Branding', body, css, fonts=get_fonts(src)))
print('  done')

# ── 11. gaming/index.html ───────────────────────────────
print('Building gaming/index.html...')
src = rf(SRC + '/pg_gaming.html')
css = get_css(src)
body = strip_footer(strip_nav(get_body(src)))
body = sub(body,
    '// Gaming &amp; Interactive &mdash; Culture-First Creative',
    '// Gaming &amp; Interactive \u2014 Where I\u2019m Going Next')
body = sub(body, '<span>6 Verticals</span>', '<span>5 Verticals</span>')
body = sub(body,
    '<span class="t-item hi">Gaming</span><span class="t-item">Brand Architecture</span><span class="t-item hi">Community-First</span>',
    '<span class="t-item hi">Gaming</span><span class="t-item">Brand Architecture</span><span class="t-item hi">Aspirational Vertical \u2014 Building Toward It</span><span class="t-item">Community-First</span>')
body = sub(body,
    "<strong>Tim &amp; The Time Machine</strong> is an educational adventure game where players join Tim &mdash; a young explorer &mdash; and Spark, a small boxy robot with glowing blue eyes, as they travel through history solving puzzles and uncovering civilizations. Built from the ground up as a creative director's proof-of-concept: original IP, narrative architecture, and a monetized interactive product.",
    "<strong>Tim &amp; The Time Machine</strong> is an educational adventure game where players join Tim \u2014 a young explorer \u2014 and Spark, a small robot with glowing blue eyes, as they travel through history solving puzzles and uncovering civilizations. I built this from scratch: original IP, character design, narrative architecture, monetization strategy.")
body = sub(body,
    "This demonstrates the full creative pipeline \u2014 IP development, character design consistency, game UX architecture, and a monetization strategy built for scale. Creative systems applied to interactive entertainment.",
    "This isn\u2019t professional gaming work. It\u2019s a creative director applying 15 years of brand and systems thinking to interactive entertainment \u2014 learning the medium by building in it.")
body = sub(body,
    "Gaming audiences recognize immediately when a brand is performing culture rather than living it. The brief: <strong>every decision has to feel earned.</strong> Character design, world logic, and progression system all have internal consistency \u2014 because that's what players respond to.",
    "Gaming audiences know immediately when a brand is performing culture rather than living it. The brief I set for myself: every decision has to feel earned. Character design, world logic, and progression system all have internal consistency \u2014 because that\u2019s what players respond to.")
body = sub(body,
    "The educational layer is invisible. Players learn because the world demands curiosity. That's the design challenge \u2014 make the message inseparable from the experience.",
    "The educational layer is invisible. Players learn because the world demands curiosity. Making the message inseparable from the experience \u2014 that\u2019s the same design challenge I\u2019ve been solving for 15 years, just in a different medium.")
body = sub(body,
    "Original IP creation. Character design at scale. Narrative architecture across multiple timelines. UX decisions that reduce friction without reducing depth. A monetization model that doesn't break immersion. <strong>This is what a creative director who actually builds in gaming looks like.</strong>",
    "Original IP. Character design consistency. Narrative architecture. A monetization model built not to break the experience. This is what it looks like when 15 years of brand systems thinking meets interactive entertainment for the first time.")
wf(DEST + '/gaming/index.html',
   page('Gaming \u2014 Tim Shephard', 'Gaming', body, css, dark=True, fonts=get_fonts(src)))
print('  done')

print('\nAll 11 pages built successfully.')

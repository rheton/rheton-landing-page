---
# ────────────────────────────────────────────────────────────────
# Rheton landing page — content template
# Edit the values below to change copy anywhere on the page.
# Layout/styling lives in layouts/ and static/css — this file is
# the only thing you should need to touch to update text.
#
# Fields ending in `_html` intentionally contain inline HTML
# (e.g. <b>…</b> for a bolded phrase mid-sentence) and are
# rendered unescaped. Everything else is plain text.
# ────────────────────────────────────────────────────────────────

nav:
  links:
    - label: "How it works"
      href: "/#how"
    - label: "Pricing"
      href: "/#pricing"
    - label: "We're in beta"
      href: "/#beta"
    - label: "Blog"
      href: "/blog/"
  # Icon links beside the nav. `icon` names a brand in layouts/partials/icon.html.
  social:
    - icon: "discord"
      label: "Discord"
      href: "https://discord.gg/9eRqFKq2vY"
    - icon: "linkedin"
      label: "LinkedIn"
      href: "https://www.linkedin.com/company/rheton"
    - icon: "github"
      label: "GitHub"
      href: "https://github.com/rheton"
  sign_in_label: "Sign in"
  cta_label: "Sign up"

hero:
  title_prefix: "Practice the engineering interview"
  title_accent: "you're actually going to have"
  subtitle: "A voice interviewer built around the job you're applying to."
  primary_cta: "Try a free mock interview"
  secondary_cta: "Sign in"

trusted_by:
  enabled: false
  heading: "Trusted by engineers who landed offers at"
  logos:
    - icon: "google"
      name: "Google"
    - icon: "amazon"
      name: "Amazon"
    - icon: "tiktok"
      name: "TikTok"
    - icon: "meta"
      name: "Meta"
  caption: "…and many startups"

how_it_works:
  heading: "How does it work?"
  replay_label: "Replay this stage"
  # One tab per track; the first is shown by default. Each key has its own
  # panels in layouts/partials/how-<key>.html.
  tracks:
    - key: "engineering"
      label: "Real-World Engineering"
      badge: "New"
      # One full-width workspace instead of three stages.
      replay_label: "Replay"
      lead: "Debug a real codebase, out loud."
      body: "A small repo, a failing test suite, an editor and a terminal. The interviewer briefs you, nudges you when you're stuck, and asks why your fix works. Then it grades the diff you shipped."
    - key: "algorithmic"
      label: "Algorithmic"
      badge: ""
      stages:
        - lead: "Set up the session."
          body: "Fully customizable and personalized, so it fits any company’s flow."
        - lead: "Let the agent take over."
          body: "It runs the interview, and it watches your code as you write it, not just what you say."
        - lead: "Get the summary."
          body: "The whole session, written up: what you did well and what needs work."

tailored:
  heading_line1: "Tailored to you,"
  heading_line2: "built to fit any flow"
  cards:
    - icon: "resume"
      title: "Personalized by your resume"
      body_html: "It can ask about <b>your own projects</b>, the ones on your resume, not some textbook problem. <b>Grilling is optional.</b> You pick the heat, we bring the questions"
    - icon: "flow"
      title: "Fully customizable flow"
      body_html: "Pick the <b>round</b>, the <b>length</b>, the <b>language</b>, and reorder the stages however you want. Set it up to match the interview you're actually walking into"

rounds:
  heading: "Beyond an agent..."
  intro: "With sophisticated harness design, our agent interviewer…"
  footnote: "* Powered by the latest Cartesia Sonic and Inworld Realtime TTS models."
  items:
    - icon: "eye"
      lead: "Watches while you code."
      body_html: "Reacts to your approach in real time"
    - icon: "brain"
      lead: "Asks real follow-up questions."
      body_html: "Probes the decisions you actually made"
    - icon: "wave"
      lead: "Sounds like a person."
      body_html: "A state-of-the-art voice model<sup>*</sup> gives it a natural tone"

session_summary:
  heading: "A summary you can act on"
  body: "Every interview ends with a plain-language summary: what you got right, where you struggled, and what to work on next. Re-run the same session later to track how you've improved."
  closing: "We want you to succeed."

beta:
  enabled: false
  heading: "We're in beta"
  body_html: "Free early access: <b>100 min of total free interview sessions</b> per week, no credit card required. We're still shipping fast and ironing out rough edges, so if something breaks or feels off, tell us. Pricing isn't live yet. While we're in beta, <b>it's on us.</b>"

pricing:
  enabled: true
  heading: "Start free. Go Plus when it counts."
  subheading: "Your next offer is worth more than this."
  # Plus's prices and each plan's minutes are fetched live through this
  # public endpoint (rheton's supabase/functions/plus-prices), so a price
  # change in the Stripe Dashboard or a new get_plan_minutes needs no edit
  # here. The `minutes` below are only the fallback if it can't be reached.
  prices_url: "https://ueczlyounsnssvuauump.supabase.co/functions/v1/plus-prices"
  monthly_label: "Monthly"
  quarterly_label: "3 months"
  # {n} is replaced with the 3-month plan's discount vs. paying monthly.
  savings_label: "save {n}%"
  minutes_label: "{n} practice minutes a month"
  # The feature lists mirror FREE_FEATURES / PLUS_FEATURES on the app's
  # Subscription page (frontend/src/pages/Subscription.tsx). Keep them in
  # sync by hand: the Plus-only items are enforced by the app, not here.
  plans:
    - name: "Free"
      key: "free"
      minutes: 70
      price: "$0"
      unit: "/ month"
      featured: false
      blurb_html: "The full interview, with problems and questions picked at random. <b>No credit card required.</b>"
      items:
        - "Coding, engineering, technical and behavioral stages"
        - "Random problems and questions"
        - "Interview summary and skill charts"
      cta: "Start free"
      cta_href: "https://app.rheton.io/signup"
    - name: "Plus"
      key: "plus"
      minutes: 300
      # The price row is filled in by main.js. If it can't load, the card
      # shows this line instead of a price.
      live: true
      price: ""
      unit: "Billed monthly or every 3 months"
      featured: true
      blurb: "Choose exactly what you practice, and practice more of it."
      items:
        - "Everything in Free"
        - "Choose any problem or question"
        - "Sample answers for technical questions"
        - "Re-run past sessions"
        - "Resume questions"
      cta: "Subscribe to Plus"
      # Plus is bought from the Subscription page in the app, signed in.
      cta_href: "https://app.rheton.io/subscription"

cta:
  heading: "The best agent interviewer in the market. Period."
  button: "Try a free mock interview"

footer:
  # Link columns. The social icons reuse nav.social above.
  columns:
    - title: "Product"
      links:
        - label: "Home"
          href: "/"
        - label: "Pricing"
          href: "/#pricing"
    - title: "Company"
      links:
        - label: "About us"
          href: "/about/"
        - label: "Contact us"
          href: "/contact/"
        - label: "Brand guidelines"
          href: "/brand/"
    - title: "Legal"
      links:
        - label: "Privacy"
          href: "/privacy/"
        - label: "Terms and conditions"
          href: "/terms/"
  copyright: "© 2026 Rheton, LLC"
---

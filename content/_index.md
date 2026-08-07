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
      href: "#how"
    - label: "Pricing"
      href: "#pricing"
    - label: "Blogs"
      href: "#"
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

pricing:
  enabled: false
  heading: "Cheaper than one bad onsite"
  monthly_label: "Monthly"
  annual_label: "Annual, save 20%"
  annual_discount: 0.2
  plans:
    - name: "Free"
      price: "$0"
      unit: ""
      featured: false
      badge: ""
      blurb: "One full interview, all rounds. See if it holds up."
      items:
        - "1 interview"
        - "Any round"
        - "Full written summary"
        - "Saved for 30 days"
      cta: "Start free"
    - name: "Pro"
      price: "$29"
      base_price: 29
      unit: "/mo"
      annual_unit: "/mo, billed annually"
      featured: true
      badge: "Most picked"
      blurb: "For an active search. Interview as often as you need to."
      items:
        - "Unlimited interviews"
        - "Job-description and resume targeting"
        - "Rounds that remember the last one"
        - "Session history and comparison"
        - "Export summaries"
      cta: "Start free, then Pro"
    - name: "Teams"
      price: "Custom"
      unit: ""
      featured: false
      badge: ""
      blurb: "For bootcamps and university career centers."
      items:
        - "Seats for a whole cohort"
        - "Shared question sets per employer"
        - "Cohort progress view"
        - "SSO and invoicing"
      cta: "Talk to us"

cta:
  heading: "The best agent interviewer in the market. Period."
  button: "Try a free mock interview"

footer:
  links:
    - label: "Privacy"
      href: "/privacy/"
    - label: "Contact"
      href: "#"
  copyright: "2026 Rheton"
---

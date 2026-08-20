---
name: easy-shadcn
description: Transit wayfinding, distilled — a component-library landing page built from platform signage, numbered route lines, and one coral signal.
colors:
  platform: "#FAF9F7"
  ink: "#111111"
  signal: "#EB5436"
  signal-deep: "#C8401F"
  muted: "#5C5C54"
  rule: "rgba(17, 17, 17, 0.16)"
  syntax-sky: "#8ECAFC"
  syntax-coral: "#FF6F4F"
  syntax-leaf: "#7AC478"
  white: "#FFFFFF"
typography:
  display:
    fontFamily: "'Barlow Semi Condensed', 'Arial Narrow', 'Helvetica Neue', sans-serif"
    fontSize: "clamp(3.4rem, 11.5vw, 11rem)"
    fontWeight: 700
    lineHeight: 0.88
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Barlow Semi Condensed', 'Arial Narrow', 'Helvetica Neue', sans-serif"
    fontSize: "clamp(2.6rem, 6vw, 5.6rem)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Barlow Semi Condensed', 'Arial Narrow', 'Helvetica Neue', sans-serif"
    fontSize: "clamp(1.5rem, 2.6vw, 2.1rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.01em"
  wordmark:
    fontFamily: "'Barlow Semi Condensed', 'Arial Narrow', 'Helvetica Neue', sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
  lead:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  body-small:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  quote:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
    fontStyle: italic
  label:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.22em"
  micro:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.26em"
  mono:
    fontFamily: "'Geist Mono', monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
rounded:
  none: "0"
spacing:
  gutter: "24px"
  gutter-lg: "40px"
  gap: "32px"
  section: "80px"
  section-lg: "112px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "#FFFFFF"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.signal-deep}"
    textColor: "#FFFFFF"
  button-outline:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
  button-outline-hover:
    backgroundColor: "{colors.ink}"
    textColor: "#FFFFFF"
  nav-link:
    textColor: "{colors.ink}"
    padding: "6px 12px"
  nav-link-hover:
    textColor: "{colors.signal-deep}"
  install-card:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  line-marker:
    backgroundColor: "{colors.ink}"
    textColor: "#FFFFFF"
    rounded: "{rounded.none}"
    size: "36px"
  chip-install:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  chip-install-hover:
    backgroundColor: "{colors.ink}"
    textColor: "#FFFFFF"
  highlight-chip:
    backgroundColor: "{colors.signal-deep}"
    textColor: "#FFFFFF"
    rounded: "{rounded.none}"
    padding: "2px 6px"
---

# Design System: easy-shadcn

## Overview

**Creative North Star: "Transit Wayfinding, Distilled"**

easy-shadcn's landing page is a quiet station, not a showcase. The surface is built from the materials of transit signage — a warm platform field, ink type, hairline rules, numbered route lines, semi-condensed destination caps — with exactly one accent: the logo coral, pinned from the brand mark. The thesis is wayfinding: one glance should locate every component and the command that installs it, so the system optimizes for legibility and orientation, never for atmosphere.

This is the distilled pass of the world. Earlier devices from the roll — ticker bands, ticket perforation, station dots on rails, dark sign plates — were deliberately removed; what remains is the quiet core: one warm ground, one ink, one coral, hairlines, and drawn arrows. Depth is tonal (white cards on the warm field, one dark band), never shadowed. Motion is sparse and singular: headlines rise into place once, and the signature demo folds code lines in and out.

Scope: this system governs the landing surface only (`app/page.tsx`, `app/collapse-demo.tsx`, the `.landing-root` block in `app/globals.css`). The Fumadocs documentation app intentionally keeps its own look and tokens and is out of scope.

**Key Characteristics:**
- One accent only — logo coral — used at display size for a single word per headline, plus markers and selection.
- White cards with hairline borders sit on the warm off-white field; dark is reserved for code/npm surfaces.
- All display type is uppercase Barlow Semi Condensed at overwhelming scale (up to 11rem).
- Square corners everywhere, zero radius, no shadows.
- State changes are solid color flips (ink ↔ white, ink → deep coral), never tints, fades, or lifts.
- Themed focus rings via a scoped `--focus` custom property that flips to coral on dark panels (`.on-ink`).

## Colors

The palette is a quiet platform: one warm off-white ground, one ink, one coral signal with a deep working variant, and a warm gray for secondary information.

### Primary
- **Logo Coral** (#EB5436): the single accent, pinned from the brand mark. Used at display size — one accent word per headline, the slash in the wordmark, manifesto numerals, the blockquote square, the `$` prompt, selection background. Always a flat fill or display-size text, never a gradient, tint, or glow.

### Secondary
- **Deep Coral** (#C8401F): the working variant. Whenever coral must carry white text (highlight chips, the npm badge, the active demo toggle) or act as an interactive hover color (nav links, stop names, primary-button hover, arrows), this is the coral. Display-size words use the pure signal; everything load-bearing goes deep.

### Neutral
- **Platform Warm White** (#FAF9F7): the page field (`--platform`), and the light text color on ink surfaces.
- **Enamel Ink** (#111111): primary text, primary button fields, line markers, the one dark band, and code-window panels (`--ink`).
- **Warm Platform Gray** (#5C5C54): secondary information only — captions, notes, stop numbers, footer metadata (`--muted`).
- **Hairline Rule** (rgba(17, 17, 17, 0.16)): the default separator; in practice used at 10–25% ink opacity for section edges, card borders, and row dividers (`--rule`).
- **Syntax Sky** (#8ECAFC), **Syntax Coral** (#FF6F4F), **Syntax Leaf** (#7AC478): syntax highlighting inside dark code panels only — keywords, identifiers/tags, strings, with platform at 45% for comments. These never leave the code window.

### Named Rules
**The One Signal Rule.** There is exactly one accent hue on the surface, and it is the logo coral. No second accent, no tint ramp of it, no gradients of it. Its rarity is the point — on any given screen, coral covers a single-digit percentage of the pixels.

**The Deep-Coral Rule.** When coral does work — text on top of it, or text that deepens on hover — it is always the deep variant. Pure signal is reserved for display-size type and graphic marks sitting directly on the platform field.

**The Hairline Rule.** Separators are 1px ink at 10–16% opacity. The only 2px stroke on the surface is the outline button's border. Nothing thicker exists.

## Typography

**Display Font:** Barlow Semi Condensed (via `next/font`, `--font-display`; fallbacks "Arial Narrow", "Helvetica Neue", sans-serif)
**Body Font:** Barlow (via `next/font`, `--font-body`; fallback system-ui, sans-serif)
**Label/Mono Font:** Geist Mono (site-wide `--font-mono`)

**Character:** destination-board caps over a plain-spoken transit body. The condensed display face does all the announcing — uppercase, tightly leaded, clamp-scaled — while Barlow stays quiet and readable, and Geist Mono handles anything a user might type or copy.

### Hierarchy
- **Display** (700, clamp(3.4rem, 11.5vw, 11rem), line-height 0.88, tracking −0.01em, uppercase): hero and final call-to-action headlines; one overwhelming statement per surface. The departures headline scales at clamp(2.5rem, 11vw, 10.5rem) to keep the full call to action visible at 320px.
- **Headline** (700, clamp(2.4–2.6rem, 5.5–7vw, 4.4–5.6rem), line-height 0.9–0.92, uppercase): section headers ("Twenty-seven stops. Four lines.").
- **Figure** (600, clamp(2.8rem, 5vw, 4.4rem), line-height 1): service-fact numerals ("27", "80/20").
- **Title** (600, clamp(1.5rem, 2.6vw, 2.1rem), line-height 1, tracking 0.01em, uppercase): stop names in the route map; 1.35–1.5rem for feature terms and card titles.
- **Body** (400, 1–1.15rem, line-height 1.6–1.65): platform-information prose, ink at 70–85% opacity; blurbs at 14px. Italic at 12.5–13px, gray, for notes and line labels.
- **Label** (600, 10–12px, tracking 0.18–0.26em, UPPERCASE): the signage layer — nav items, buttons, card headers, rule metadata, footer. Never sentence case.
- **Mono** (400, 11–13px, line-height 1.7–1.75): install commands, stop numbers (A01–D03), code panels, package names. Anything the user might copy is mono.

### Named Rules
**The Destination Board Rule.** Headlines are always uppercase Barlow Semi Condensed at tight leading (0.88–0.92), scaled by clamp() only. If a heading wants sentence case or the body face, it is not a headline — demote it to body.

**The One Accent Word Rule.** Exactly one word per headline may go coral — "easy", "shipping.", "lines.", "command." — or the slash inside a headline. Never two words, never a whole line.

**The Signage Label Rule.** Meta text is always small (10–11px), semibold, uppercase, and widely tracked (0.18em minimum). Labels whisper in the world's register; they never grow into titles.

## Layout

A single centered container (max-width 1400px) with 24px gutters widening to 40px at the small breakpoint; inside it, a loose 12-column grid (32px gaps) carries every section. Sections breathe on a vertical rhythm of 80–112px padding at desktop (56–96px on mobile), with the hero and departures sections reaching 128px. Long sections open with a split headline row — 7/5 or 8/4 headline-plus-prose — before the content below. The route map reuses the same 12 columns per stop row: stop number / name / blurb / install chip. Responsive behavior is a simple collapse: grids stack to full width under the medium breakpoint (768px), and clamp() does all type scaling — there are no per-breakpoint font sizes.

## Elevation & Depth

The system is flat. There are no box-shadows anywhere on the landing surface. Depth is conveyed by tonal layering alone: white cards with hairline borders sitting on the warm platform field, and one dark ink band (the express/npm section) plus dark code windows. State changes flip solid colors instead of lifting.

### Named Rules
**The Flat-by-Default Rule.** No shadows, ever. A card that needs prominence gets a white field and a hairline; a section that needs weight gets ink. Elevation is a color decision, not a shadow decision.

## Shapes

Square corners are absolute: buttons, cards, markers, chips, and code windows all have 0 radius. Borders are 1px translucent ink on cards, lists, and panels; the single 2px border belongs to the outline button. The recurring geometry is the drawn arrow: SVG strokes with square caps (6px weight in buttons, 2.5px for the up-right variant), always horizontal or up-right, nudging 4px forward on hover. The only pure-coral shapes are small and flat: the 12px blockquote square and the line-highlight chips.

### Named Rules
**The Square Rule.** Radius is zero across the surface. If a shape seems to want a rounded corner, the answer is no — the world's sharpness is its voice.

**The Real Arrow Rule.** Arrows always point at an actual navigation target or state change. An arrow that points at nothing is deleted.

## Components

### Buttons
Signage plates: uppercase labels in the label register (12px semibold, tracking 0.18em), square corners, generous padding.
- **Shape:** square (0 radius).
- **Primary:** solid ink field, white text, 14px 24px padding; carries a small drawn arrow that nudges 4px forward on hover.
- **Hover / Focus:** the primary flips solidly to deep coral (still white text) — a sign flipping over, not a light dimming. Focus is a 2px solid `--focus` outline offset 2px: ink on light panels, coral on dark panels (`.on-ink`).
- **Outline:** 2px ink border, transparent body, 12px 24px padding; hover fills solid ink with white text.
- **Tertiary:** plain label-register links with underline on hover, for low-stakes exits (GitHub).

### Navigation
A quiet masthead on the platform field, separated by a hairline (ink at 10%): the coral-slash logo, a display-face wordmark (15px semibold, tracking 0.08em), and label-register links (11px, tracking 0.18em). Link hover deepens the text to deep coral; external links carry a small up-right arrow. No mobile hamburger — the three links simply stay put.

### Install Card (signature)
The white install card: hairline border (ink at 15%), a header row split by a hairline carrying the label ("Install any component", 10px / 0.26em) and a mono qualifier ("shadcn CLI"), then the command body in 13px Geist Mono at 1.75 line-height — a coral `$`, the command in ink, the package name in bold. Used twice (hero, departures): it is the object's handshake.

### Route Map (signature)
The component catalogue as a transit map: four lines (A–D), 27 stops. Each line opens with a 36px ink square marker carrying a white display-face letter, a label-register "Line X", and an italic gray line label. Stop rows are separated by hairlines (ink at 10%) and carry a mono stop number (A01), an uppercase semi-condensed name, a 14px blurb at 75% ink, and a mono install chip (`@easy-shadcn/<name>`, 1px border at 20% ink). Row hover lifts the row to white, deepens the stop name to deep coral, and the chip hover flips solidly to ink field + white text.

### Code Panels
Ink panels with a title bar (mono 10px uppercase labels at 0.22em tracking, hairline platform/15 dividers) and a 12.5px mono body at 1.75 line-height. Syntax colors: Syntax Coral for identifiers and tags, Syntax Sky for keywords, Syntax Leaf for strings, platform at 45% for comments. Dark panels declare `.on-ink` so focus rings flip to coral.

### Collapse Demo (signature)
The before/after code window: 13 lines of nested shadcn primitives fold into 7 flat-prop lines, animating row by row (staggered 50ms in, 32ms reverse-direction out, height folding 330px → 200px over 0.9s) on the shared ease cubic-bezier(0.2, 0.7, 0.2, 1). It auto-plays once when scrolled into view (−20% margin), and the Primitive/Compose toggle uses solid flips — platform field for active Primitive, deep coral for active Compose. Reduced motion collapses all durations to ~0.

### Manifesto Cards
White hairline-bordered cards on the platform field: a coral display-face numeral (2.6rem), label-register "Rule N / 3" metadata, an uppercase semi-condensed title, and 14px body at 70% ink. Square corners, no shadow, generous 28–32px padding.

### Service Facts
Oversized semibold display numerals (clamp(2.8rem, 5vw, 4.4rem)) over label-register captions and italic gray notes, in a 4-column grid opened by a hairline and separated by vertical hairlines (1px, ink at 10%) at desktop.

### Page Entrance & Motion
Hero elements rise into place once (`ink-rise`: 1.2em translate + fade, 0.9s, cubic-bezier(0.2, 0.7, 0.2, 1), staggered 60–560ms). All motion is transform/opacity (plus the demo's height fold) and everything honors `prefers-reduced-motion` by collapsing to near-instant. Text selection is white on coral.

## Do's and Don'ts

### Do:
- **Do** use one accent word per headline in pure Logo Coral (#EB5436) — the hoarding device: one decisive word.
- **Do** switch to Deep Coral (#C8401F) whenever coral carries white text or acts as an interactive hover color.
- **Do** separate with 1px hairlines at 10–16% ink; reserve the single 2px stroke for the outline button.
- **Do** put content on white hairline cards over the warm platform field; keep dark for code/npm surfaces only.
- **Do** set every headline in uppercase Barlow Semi Condensed, tight leading (0.88–0.92), clamp() scaling.
- **Do** keep meta text in the signage register: 10–11px, semibold, uppercase, tracked 0.18–0.26em.
- **Do** put anything copyable — commands, package names, stop numbers — in Geist Mono.
- **Do** flip `--focus` to coral on dark panels via `.on-ink`; every focusable element gets the 2px offset outline.
- **Do** make arrows earn their place: each one points at a real link, button, or state change.

### Don't:
- **Don't** introduce a second accent hue, or tint, gradient, fade, or glow the coral — it is a flat signal.
- **Don't** add box-shadows or elevation; depth is tonal layering only.
- **Don't** round any corner; the surface is square everywhere.
- **Don't** use opacity fades or color tints as state — hovers are solid flips, white row lifts, or deep-coral text.
- **Don't** let more coral onto a screen than a word, a marker, and a chip or two — the One Signal Rule.
- **Don't** use sentence-case headings, kickers/eyebrows, glyph-icon fonts, or the category defaults the world refuses (dark gradient hero, bento grid, fake terminal glow).
- **Don't** let motion escape transform/opacity/height, and never ship it without a `prefers-reduced-motion` collapse.

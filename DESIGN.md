# Design System: Necromancer / Cursed Archive

## 1. Core Direction

This launcher uses a necromancer-style dark gothic language: cursed archive energy, bone ash, iron trim, ink-black surfaces, restrained corpse-green magic, and a cold crystal violet accent.
Base surfaces should carry a subtle violet undertone so the whole UI feels coherent with the crystal accent.
The target is a crystal cave mood: deep amethyst, cold stone, and faint inner glow, never neon.

The feel:
- Severe, ritualistic, cold, and ominous
- Dark base surfaces with deep layered shadow and a faint violet cast
- Emerald is necrotic power, not cheerful brand color
- Violet splits between dim bruise depth and crystal violet highlights
- Gold is almost gone; if used, it is faint and deadened
- Panels should feel sealed, iron-bound, or ossuary-like
- UI should look like a cursed vault, grave ledger, or death rite terminal, not a glass dashboard

This is the default visual direction for all user-facing screens.

Admin area is intentionally exempt. Admin UI may stay utilitarian and less stylized.

## 2. Visual Rules

### Background
- Use very dark backgrounds, near-black but not pure black
- Preferred base: `#050509`, `#09090d`, `#101016`
- Dark surfaces may lean into muted violet so cards and shells feel connected to the crystal accent
- Push the surface family toward crystal cave amethyst rather than flat gray
- Add layered shadow, smoke-like darkness, faint rune grids, and ash grain
- Backgrounds should feel heavy and old, not flat

### Surfaces
- Use layered dark surfaces with subtle contrast
- Let surfaces pick up a faint crystal violet tint instead of staying neutral gray
- Favor amethyst cave depth in panels, cards, and modal shells
- Panels should use gradients, inner borders, and cold steel highlights
- Prefer carved stone, iron plate, ash, bone, and sealed parchment feeling
- Avoid flat, modern, clean app surfaces

### Accents
- Emerald green is necrotic power and active magic
- Violet splits into bruise depth and crystal violet magic highlights
- Crystal violet should feel like cut gemstone light, not neon
- Crystal violet should feel like cut gemstone light inside a cave wall, not neon
- Gold is nearly absent; use only as deadened relic trace
- Red is danger, corruption, or blood
- Never use bright accent colors as large fills unless the state demands it

### Texture
- Use subtle noise, rune grids, etched lines, and controlled glow
- Prefer atmospheric depth over shadows alone
- Decorative layers should be sparse, angular, and visible only in key surfaces

## 3. Color Palette

### Primary Dark Palette
- `#050509` - abyss
- `#09090d` - crypt background
- `#101016` - surface deep
- `#15151c` - surface soft
- `#1d1d27` - elevated shadow

### Magic Accents
- `#3ecf8e` - corpse-green magic
- `#50e3a1` - active necrotic highlight
- `#7b6b95` - bruise violet
- `#a98cff` - crystal violet
- `#8f8465` - dead gold trace

### Neutrals
- `#fafafa` - primary text
- `#d0cddb` - secondary text
- `#9a93a8` - muted text
- `#686174` - tertiary text
- `rgba(255,255,255,0.035)` - soft border
- `rgba(126,126,154,0.12)` - iron border
- `rgba(62,207,142,0.16)` - necrotic border

### Semantic
- Success uses corpse-green
- Warning uses dead gold or pale amber
- Error uses crimson / blood red
- Info may use crystal violet or bruise violet, depending on tone

## 4. Typography

### Tone
- Primary text should feel stern, grave, and a little haunted
- Labels should feel like ritual inscriptions or archive stamps
- Hero text should feel like a title carved into tomb stone

### Rules
- Display titles: tight line height, strong contrast, minimal glow
- Section headings: use readable weight, not heavy bold
- Utility labels: uppercase, tracked out, monospace or rune-like
- Body copy: clean and readable, but not sterile

### Font Strategy
- Primary body: current launcher sans stack
- Labels and technical tags: `Source Code Pro`
- Hero or branded headlines: same family, but with tighter tracking and harder shadow treatment

## 5. Component Language

### Panels
- Use `.fantasy-panel`
- Panels should have:
  - layered gradient fill
  - soft iron border
  - sparse edge highlight
  - subtle inner light

### Cards
- Use `.fantasy-card`
- Cards should feel like sealed plaques, ossuary slabs, or chapel plates
- Prefer rounded corners with strong border presence
- Add only faint corner glow

### Chips and Badges
- Use `.fantasy-chip`
- Chips should look like iron tags or sealed talismans
- Use for filters, role tags, metadata, and status pills

### Buttons
- Use `.fantasy-button`
- Primary buttons should feel powered, not cheerful
- Primary buttons may use crystal violet as the sharper arcane accent
- Secondary buttons should feel carved and substantial
- Danger buttons should feel cursed, not just red
- Pill shape is allowed for main CTAs, but it should feel like a ward seal

### Inputs
- Inputs should look like etched glass, dark enamel, or coffin lacquer
- Use `.fantasy-input` or `.fantasy-input-shell`
- Focus state should glow emerald or crystal violet, but lightly
- Labels should use rune style

### Modals
- Modals should feel like sealed chambers or summoning wards
- Backdrop should be darker than the rest of UI
- Modal panels should have layered borders and stronger contrast than normal cards

### Progress
- Progress bars should feel like cursed charge accumulation or ward stabilization
- Use emerald fill with subtle glow
- Crystal violet can appear as an edge highlight or completion spark

## 6. Layout Principles

### Page Structure
- User-facing screens should feel like scenes in a ritual chamber or cursed archive
- Use large atmospheric backgrounds plus contained cards
- Keep a strong hierarchy:
  - background atmosphere
  - panel / surface
  - content
  - accent

### Spacing
- Keep content relatively dense
- Use larger empty zones around hero areas and primary cards
- Avoid sterile evenly spaced layouts

### Borders
- Borders are important
- Prefer layered border hierarchies over box shadows
- Use visible lines, edge highlights, and faint inner strokes

### Radius
- Cards: 16px to 22px
- Chips: 9999px or soft pill shapes
- Inputs: 10px to 14px
- Modals: 20px-ish with strong mass

## 7. Motion

- Motion should feel occult, not playful
- Use slow fade, subtle lift on hover, and restrained reveal animations
- Avoid bouncy microinteractions
- Spin animations are fine for loaders and ritual processing states
- Console / loading states can pulse softly

## 8. Theme Tokens

### Required Classes
- `.fantasy-ui` for the overall user-facing page shell
- `.fantasy-shell` for layered atmospheric containers
- `.fantasy-panel` for larger framed containers
- `.fantasy-card` for content cards
- `.fantasy-chip` for tags and pills
- `.fantasy-button` for themed buttons
- `.fantasy-button--primary` for main CTA
- `.fantasy-input` and `.fantasy-input-shell` for form controls
- `.fantasy-rune-label` for uppercase labels
- `.fantasy-hero-title` for major headings
- `.fantasy-divider` for ornamental separators
- `.fantasy-orb` variants for ambient glow

### Tokens
- Backgrounds: abyss, crypt, surface deep, surface soft
- Accents: corpse-green, bruise violet, crystal violet, dead gold trace
- Borders: soft, iron, strong, crystal
- Text: primary, secondary, muted

## 9. Do / Dont

### Do
- Use dark layered surfaces
- Use corpse-green as active magic
- Add violet sparingly for bruise depth
- Use crystal violet sparingly for crystal highlights and active CTAs
- Use gold only as dead trace, if at all
- Keep labels uppercase and ritual-like
- Make cards feel carved, framed, iron-bound, or ossuary-like
- Use glow and ornament sparingly but visibly
- Keep admin area separate and pragmatic

### Dont
- Dont revert to clean modern glass UI
- Dont use flat white surfaces on user-facing screens
- Dont overuse generic rounded rectangle cards
- Dont make buttons look like default system controls
- Dont use box shadows as the main depth mechanism
- Dont apply the necromancer style to admin screens
- Dont let backgrounds feel empty or sterile

## 10. Screen Guidance

### Login
- Most severe screen
- Use strongest darkness, framing, and warding
- Card should feel like a sealed gate or altar stone
- Crystal violet may highlight the main CTA, border glow, or ritual focus point

### Dashboard
- Should feel like a command hall or archive vault
- Sidebar can be a relic archive
- Tabs should feel like iron seals
- Crystal violet can mark active navigation, selected content, and high-value actions

### Settings
- Should feel like a spellbook or vault of configurations
- Sections should be framed like chapters or tablets
- Use clear hierarchy but keep gothic tone

### Update / Integrity
- Should feel like ritual progress and ward verification
- Use restrained energy, charged bars, and guarded presentation
- Crystal violet can appear in progress edges or confirmed states, but not as a full-screen wash

### News / Changelog
- Should feel like a chronicle, ledger, or funeral record
- Cards should resemble entries in an old magical record

## 11. Implementation Notes

- Use the CSS theme layer first, then refine individual pages
- Prefer global theme classes over one-off per-component hacks
- If a user-facing component looks too plain, wrap it in fantasy classes before adding ad hoc styles
- If a screen is not user-facing, leave it simpler unless explicitly requested
- When in doubt, move toward darker, colder, more necromancer-like styling

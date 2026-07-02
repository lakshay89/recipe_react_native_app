---
name: Heritage Archive
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#444748'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#a04100'
  on-secondary: '#ffffff'
  secondary-container: '#fe7f3b'
  on-secondary-container: '#652600'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001946'
  on-tertiary-container: '#6782c6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#ffdbcc'
  secondary-fixed-dim: '#ffb693'
  on-secondary-fixed: '#351000'
  on-secondary-fixed-variant: '#7a2f00'
  tertiary-fixed: '#dae2ff'
  tertiary-fixed-dim: '#b1c5ff'
  on-tertiary-fixed: '#001946'
  on-tertiary-fixed-variant: '#264484'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter-desktop: 32px
  gutter-mobile: 16px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style
The design system is anchored in the "Digital Museum" philosophy—a marriage of editorial sophistication and technical precision. It is designed to evoke the feeling of a high-end physical gallery: quiet, spacious, and focused on the artifact. 

The style utilizes a **Modern-Editorial** approach, characterized by generous Apple-inspired whitespace that allows high-resolution culinary photography to breathe. It avoids unnecessary ornamentation, relying instead on impeccable typography and a "Tactile Parchment" feel to convey warmth and scholarly authority. The emotional response should be one of "Timeless Discovery"—where the user feels they are uncovering a curated treasure rather than browsing a database.

## Colors
The palette is grounded in natural pigments and historical materials.
- **Canvas (Background):** A warm `canvas_parchment` (#FDFCF8) serves as the primary surface, reducing the eye strain of pure white and evoking archival paper.
- **Ink (Text/Primary):** Deep charcoal (#1A1A1A) provides high-contrast legibility for scholarly text.
- **Heritage Accents:**
  - **Saffron & Terracotta:** Used for call-to-actions and navigational highlights to evoke warmth and spices.
  - **Indigo:** Reserved for secondary information, citations, or metadata, providing a cool, stable counterpoint to the warmer tones.

## Typography
The typographic hierarchy follows an "Editorial First" rule. **Playfair Display** is used for all narrative entry points and titles, providing a classic, authoritative voice. **Public Sans** is utilized for body copy and UI elements to ensure accessibility and a clean, modern feel.

- **Display Text:** Use large sizes for immersive chapter headings.
- **Body Text:** Maintain a maximum line length of 65-75 characters for optimal readability in long-form archival descriptions.
- **Labels:** Use `label-caps` for metadata (e.g., "REGION: RAJASTHAN") to create a structured, cataloged appearance.

## Layout & Spacing
The layout uses a **Fluid-Fixed Hybrid Grid** to ensure content feels curated on all screens.
- **Mobile:** A strict 4-column grid with 16px gutters.
- **Desktop:** A 12-column grid with a maximum container width of 1280px.
- **Immersive Headers:** Use "Full-Bleed" image containers for recipe hero sections, breaking the grid to create high-impact visual moments.
- **Vertical Rhythm:** Utilize an 8px base unit. Spacing between sections should be aggressive (80px - 120px) to signify a change in "exhibit" or narrative topic.

## Elevation & Depth
This design system avoids heavy shadows in favor of **Tonal Layering** and **Micro-Depth**.
- **Surface Elevation:** Objects do not "float" high above the page; they sit on the parchment surface. 
- **Shadows:** Use extremely soft, low-opacity (#000000 at 4%) ambient shadows with a large blur radius (24px) for cards.
- **Depth via Contrast:** Use subtle 1px borders in #E5E1D8 (a darker parchment shade) to define areas instead of drop shadows where possible. This maintains the "flat-paper" museum aesthetic.

## Shapes
The shape language is **Soft (0.25rem)**. While modern, the design avoids overly round "bubbly" corners to maintain its scholarly gravitas. Rectilinear forms with micro-rounding represent the precision of professional archiving, while large-scale image containers should remain sharp (0px) to maximize the "full-bleed" impact.

## Components
- **Buttons:** Primary buttons use a solid Charcoal background with White text and `rounded-sm` corners. Secondary buttons use a simple underline (2px thickness) and a Saffron hover state.
- **Archive Cards:** Feature a top-aligned image, a Playfair Display title, and a Public Sans metadata label at the bottom. The card background is a slightly lighter tint than the canvas.
- **Input Fields:** Minimalist design with only a bottom border (1px). Focus state transitions the border color to Indigo.
- **Chips/Tags:** Used for "Ingredients" or "Eras," these should have a light Terracotta background and no border, using `rounded-xl` for a pill-shaped appearance to contrast against the otherwise linear grid.
- **Image Overlays:** Gradient scrims (bottom-to-top) should be used on full-bleed images to ensure Playfair Display titles remain legible.
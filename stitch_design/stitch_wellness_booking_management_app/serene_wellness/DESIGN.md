---
name: Serene Wellness
colors:
  surface: '#effcfe'
  surface-dim: '#d0dcdf'
  surface-bright: '#effcfe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eaf6f8'
  surface-container: '#e4f0f2'
  surface-container-high: '#deeaed'
  surface-container-highest: '#d9e5e7'
  on-surface: '#121d1f'
  on-surface-variant: '#3d494a'
  inverse-surface: '#273234'
  inverse-on-surface: '#e7f3f5'
  outline: '#6d797a'
  outline-variant: '#bcc9ca'
  surface-tint: '#00696e'
  primary: '#00696e'
  on-primary: '#ffffff'
  primary-container: '#0fa6ad'
  on-primary-container: '#003437'
  inverse-primary: '#5dd8df'
  secondary: '#4d6261'
  on-secondary: '#ffffff'
  secondary-container: '#cfe7e5'
  on-secondary-container: '#536867'
  tertiary: '#526164'
  on-tertiary: '#ffffff'
  tertiary-container: '#8a999c'
  on-tertiary-container: '#233134'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#7df4fc'
  primary-fixed-dim: '#5dd8df'
  on-primary-fixed: '#002021'
  on-primary-fixed-variant: '#004f53'
  secondary-fixed: '#cfe7e5'
  secondary-fixed-dim: '#b4cbc9'
  on-secondary-fixed: '#091f1e'
  on-secondary-fixed-variant: '#354b4a'
  tertiary-fixed: '#d6e5e9'
  tertiary-fixed-dim: '#bac9cc'
  on-tertiary-fixed: '#101e20'
  on-tertiary-fixed-variant: '#3b494c'
  background: '#effcfe'
  on-background: '#121d1f'
  surface-variant: '#d9e5e7'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system establishes a tranquil, pristine, and restorative digital sanctuary for premium massage therapy, bodywork, and holistic wellness scheduling. The design language marries clinical reliability with sensory relaxation. By balancing ample white space with soothing aquatic tones, the interface evokes the peaceful ambiance of high-end wellness spas while maintaining frictionless booking functionality.

### Design Movement
- **Modern Minimal Wellness:** A hybrid of calm Scandinavian minimalism and subtle tactile warmth.
- **Atmospheric Clarity:** Interfaces rely on spacious visual breathing room, crisp structural borders, and delicately tinted backgrounds rather than heavy gradients or complex ornaments.
- **Tactile Softness:** Elements feature balanced curved corners, soft ambient drops, and smooth visual feedback that convey therapeutic peace and reassurance.

## Colors

The palette draws directly from mineral waters, steam baths, and botanical wellness sanctuaries:

- **Primary Teal (`#0FA6AD`):** The primary anchor for key calls-to-action, calendar selection pills, active state highlights, and primary headers. Represents clarity, renewal, and clean energy.
- **Secondary Aqua Tint (`#DDF5F3`):** Soft aqua tint dedicated to badges, unselected status fills, therapist role chips, and highlighted slot containers.
- **Canvas Aqua Mist (`#F0FAF9`):** A soft, whisper-light background tone used for app canvas surfaces to eliminate sterile eye strain.
- **Surface Pure White (`#FFFFFF`):** Reserved for elevated cards, modal drawers, calendar grids, and input containers.
- **Dark Charcoal (`#202B2D`):** Primary headline and body typography, offering high contrast and legibility without the harshness of pitch black.
- **Muted Slate (`#758487`):** Secondary informational copy, metadata, time ranges, and inactive icons.
- **Hairline Border (`#E7EEEE`):** Used across cards, separators, and calendar dividers for crisp spatial order.
- **Semantic Accents:**
  - **Success (`#23856D`):** Confirmed bookings and check-in receipts.
  - **Warning (`#D99A36`):** Limited slot alerts and re-booking notices.
  - **Error (`#D9534F`):** Cancellation notifications and payment warnings.

## Typography

The typographic scale uses **Plus Jakarta Sans** across all levels. Its balanced geometric construction and gentle curves evoke contemporary clinical elegance while guaranteeing exceptional legibility in dense calendar matrices, timestamps, and appointment metadata.

- **Restrained Weights:** Limit choices to `400` (Regular), `600` (Semi-Bold), and `700` (Bold) to preserve clean readability.
- **Compact Scannability:** Calendar day numbers and slot badges leverage `label-md` and `label-sm` with slight positive tracking (`0.06em`) for uppercase category titles (e.g., "WED, 7 AUG").
- **Contrast Governance:** Main titles employ `#202B2D`, while operational metadata (time ranges, clinic addresses) strictly uses `#758487`.

## Layout & Spacing

The layout is anchored in an 8-point spatial system with intentional 4-point adjustments for dense calendar rows and appointment cards.

- **Canvas Grids:** Mobile viewports follow a single-column layout flanked by `16px` (`margin-mobile`) horizontal gutters. Tablet and desktop views switch to an 8-column and 12-column grid respectively with a maximum content container width of `1120px`.
- **Rhythm & Stacking:** 
  - Group related elements (e.g., date strip header with its appointment card) with `space-sm` (`8px`).
  - Separate modular sections (e.g., Calendar strip, Team Members scroll, Booking Details) with `space-xl` (`24px`).
  - Card internal padding sticks to `14px - 16px` (`space-lg`) to balance information density with generous tap targets.

## Elevation & Depth

This design system avoids dark or heavy shadows in favor of an airy, clinical feel built on subtle layering and tinted ambient drops:

- **Level 0 (Flat Canvas):** `#F0FAF9` base background.
- **Level 1 (Structural Cards & Surfaces):** `#FFFFFF` surfaces bounded by a crisp `1px solid #E7EEEE` border and lifted by an ambient shadow: `box-shadow: 0px 4px 16px rgba(15, 166, 173, 0.05), 0px 1px 2px rgba(32, 43, 45, 0.03)`.
- **Level 2 (Active Appointment Tiles & Floating Bars):** `box-shadow: 0px 8px 24px rgba(15, 166, 173, 0.12), 0px 2px 6px rgba(32, 43, 45, 0.04)`.
- **Level 3 (Modal Sheets & Navigation Bars):** Grounded by a delicate upper outline and soft blur: `box-shadow: 0px -4px 20px rgba(32, 43, 45, 0.04)`.

## Shapes

The interface embraces organic curvature that feels welcoming and restorative:

- **Appointment & Detail Cards:** Fixed at `14px - 16px` corner radii (`rounded-lg`), reinforcing a softened, approachable appearance.
- **Buttons, Status Pills & Calendar Chips:** Styled as full pill forms (`rounded-full` / `9999px`) to create clear touch points for dates, filtering categories, and action steps.
- **Therapist Avatars & Circular Utilities:** Full geometric circles (`rounded-full`) framed with subtle `2px` white borders when overlapping.
- **Inputs & Dropdowns:** `10px - 12px` roundedness to harmonize with adjacent card structures.

## Components

### Buttons
- **Primary:** Background `#0FA6AD`, text `#FFFFFF`, rounded pill (`9999px`) or `12px` rounded corners. Hover/Active state darkens slightly to `#0D8F95`.
- **Secondary / Ghost:** White surface with `1px solid #E7EEEE` border, text `#202B2D`.
- **Soft Accent:** Background `#DDF5F3`, text `#0FA6AD`, used for non-destructive actions, quick-shares, and tags.

### Appointment & Schedule Cards
- **Card Base:** Clean white `#FFFFFF` surface, `1px solid #E7EEEE` border, `14px` border radius.
- **Header Strip:** Full-width or top-inset header bar in Primary Teal (`#0FA6AD`) displaying formatted day and time ranges (e.g., `WED, 7 AUG` on the left, `11:00 am - 11:30 am` on the right) in bold white typography.
- **Body Content:** Therapist avatar (circle, `40px`), client/session name in `#202B2D` (`font-weight: 600`), location line prefixed with a subtle map-pin icon in `#758487`.

### Calendar Strip & Date Pickers
- **Week/Month Horizontal Strip:** Displays compact three-letter day labels (`label-md`) stacked over the day number.
- **Active / Selected Day:** Rounded pill or circular badge filled with `#0FA6AD`, text `#FFFFFF`.
- **Available Day:** Highlighted with subtle `#DDF5F3` dot or pill outline.
- **Inactive / Disabled Day:** Muted `#758487` copy with zero background fill.

### Filter Chips
- **Selected Filter:** `#0FA6AD` fill, `#FFFFFF` text, `9999px` border radius.
- **Unselected Filter:** `#FFFFFF` or `#F0FAF9` fill, `1px solid #E7EEEE`, text `#758487`.

### Team / Therapist Profile Snippets
- **Card:** Vertical card with `#FFFFFF` fill, `12px` radius, `1px solid #E7EEEE` border.
- **Content:** Centered circular avatar (`48px`), practitioner name in `#202B2D` (`body-md`, `font-weight: 600`), specialty/role tag in `#758487` (`label-sm`).

### Bottom Navigation Bar
- **Surface:** `#FFFFFF` background with subtle top border `1px solid #E7EEEE` and floating soft shadow.
- **Icon States:** Unselected icons in `#758487`; selected tab tinted `#0FA6AD` with a small active indicator dot. Central primary quick-action button floating in a circular `#0FA6AD` container with white iconography.
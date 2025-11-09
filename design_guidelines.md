# Visual Project Management Dashboard - Design Guidelines

## Design Approach
**Reference-Based**: Drawing from Google Keep (card/tile aesthetics), Trello (board organization), and Notion (clean editing interface). This creates a familiar yet distinctive productivity experience that balances visual appeal with functional efficiency.

## Core Design Principles
- **Tile-First Architecture**: Dashboard centers on interactive, colorful tiles as primary navigation
- **Clarity Over Density**: Generous spacing between tiles, clean typography, minimal chrome
- **Instant Feedback**: Every interaction provides immediate visual confirmation
- **Progressive Disclosure**: Collapsed tiles show previews; expanded tiles reveal full editing power

## Typography System
**Font Families**: 
- Primary: Inter or SF Pro Display (headings, tile titles, UI elements)
- Content: System font stack for rich text editor (optimal reading)

**Scale**:
- Tile titles: text-lg font-semibold
- Content previews: text-sm
- Editor text: text-base
- Timestamps: text-xs text-gray-500
- Section headers: text-2xl font-bold

## Layout & Spacing
**Spacing Units**: Use Tailwind units of 2, 4, 6, and 8 for consistency
- Tile padding: p-6
- Grid gaps: gap-4 (mobile), gap-6 (desktop)
- Section spacing: mb-8
- Modal/editor padding: p-8

**Grid Structure**:
- Desktop: grid-cols-5 (flexible for 10 tiles + "Add New")
- Tablet: grid-cols-3
- Mobile: grid-cols-2
- Container: max-w-7xl mx-auto px-4

## Component Library

### Tiles (Primary UI Element)
- **Dimensions**: aspect-square with min-height of 180px
- **Structure**: Icon/emoji top-left, title below, 2-3 line preview, timestamp bottom-right
- **States**: Default (subtle border), hover (lift with shadow-lg), active (scale down slightly)
- **Customization**: Each tile has customizable background color with white/black text for contrast
- **Progress Indicator**: Optional thin progress bar at tile bottom (h-1 rounded-full)

### Expanded Editor Panel
- **Behavior**: Slides in from right (desktop) or bottom (mobile) as full-screen overlay
- **Layout**: Split view - Quill editor top 50%, live preview bottom 50% with divider
- **Toolbar**: Sticky header with tile title (editable), color picker, close button
- **Footer**: Auto-save indicator + "Last saved: 2m ago" timestamp

### Photo Tile (Special Case)
- **Collapsed**: Shows 2x2 thumbnail grid of recent uploads
- **Expanded**: Full drag-drop zone + masonry grid of all images
- **Lightbox**: Dark overlay with centered image, left/right navigation, close X

### Add New Tile Button
- **Style**: Dashed border, plus icon centered, text-gray-400 "Add New Category"
- **Interaction**: Opens modal with fields for Name, Icon (emoji picker), Color (color picker)

### Navigation & Controls
- **Top Bar**: Logo/title left, search bar center, dark mode toggle + export/import right
- **Search**: Floating search bar (max-w-md) with live filtering, highlights matching tiles
- **Quick Notes Button**: Fixed bottom-right, circular bg-primary text-white shadow-xl, expands to mini-modal

### Timeline View
- **Access**: Tab/button in top navigation bar
- **Layout**: Vertical timeline with left-aligned timestamps, right-aligned content cards
- **Cards**: Show tile icon, title, content snippet, color-coded left border matching tile color

### Modals & Overlays
- **Backdrop**: bg-black/50 backdrop-blur-sm
- **Container**: bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl
- **Structure**: Header with title + close, scrollable body, footer with action buttons

## Interactive Elements
- **Buttons**: Primary (bg-blue-600 text-white), Secondary (border with bg-transparent), px-6 py-2.5 rounded-lg
- **Inputs**: border-gray-300 focus:border-blue-500 focus:ring-2 ring-blue-200 rounded-lg px-4 py-2
- **Color Picker**: Popover with preset palette + custom picker
- **Drag Handles**: Visible on tile hover, uses grab cursor

## Animations (Minimal, Purposeful)
- Tile hover: transform translateY(-4px) + shadow transition 200ms
- Modal open/close: opacity + scale transition 300ms ease-out
- Editor expand: slideInRight 400ms (desktop), slideInUp 400ms (mobile)
- Auto-save indicator: pulse animation when saving

## Dark Mode
- **Background**: bg-gray-900 (main), bg-gray-800 (tiles/cards)
- **Text**: text-gray-100 (primary), text-gray-400 (secondary)
- **Borders**: border-gray-700
- **Tiles**: Maintain custom colors but reduce opacity to 80% for dark mode
- **Toggle**: Moon/sun icon, smooth transition-colors 300ms on all elements

## Mobile Adaptations
- Stack tiles in 2-column grid
- Expand editor to full screen overlay
- Search bar becomes full-width below logo
- Timeline cards stack with reduced padding
- Photo thumbnails in 1x3 grid when collapsed
- Bottom navigation for Timeline/Dashboard/Add New

## Icons
Use Heroicons (outline style) via CDN for:
- Tile categories (document, chart-bar, ship, cog, etc.)
- UI actions (search, sun/moon, download, upload, X)
- Quick actions (plus, pencil, trash)

## Images
**Weather Widget**: Small background image or gradient for weather conditions (optional decorative element in top-right corner widget)

**No large hero image** - this is a utility dashboard, not a marketing page. Visual interest comes from colorful, organized tiles and rich content within them.
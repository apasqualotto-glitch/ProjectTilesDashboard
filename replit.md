# Visual Project Management Dashboard

## Overview

A modern, single-page web application for visual project management inspired by Google Keep, Trello, and Notion. The app features an interactive tile-based dashboard where each tile represents a project category (Research, Charters, Vessels, Equipment, etc.). Users can click tiles to expand them into a full rich-text editor with live preview, drag-and-drop tiles to reorder them, and manage photos within specific categories. All data persists to localStorage, making this a fully client-side application with no backend dependencies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript, built using Vite as the build tool and development server.

**UI Component Library**: shadcn/ui components built on Radix UI primitives, providing accessible and customizable UI elements (dialogs, popovers, buttons, forms, etc.). The design system uses the "New York" style variant with Tailwind CSS for styling.

**State Management**: Context API via `AppContext` for global application state including tiles, photos, and settings. No external state management libraries (Redux, Zustand, etc.) are used - the architecture favors React's built-in context for this single-page application.

**Routing**: Wouter for lightweight client-side routing, though the app is primarily single-page with modal-based interactions rather than route changes.

**Data Persistence**: localStorage for all application data (tiles, photos, settings). Data is serialized to JSON and stored in three keys: `projectos_tiles`, `projectos_photos`, and `projectos_settings`. The app includes automatic migration logic to handle icon format changes from emoji to icon names.

**Drag and Drop**: @dnd-kit libraries (@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities) for implementing tile reordering via drag-and-drop with keyboard support.

**Rich Text Editing**: ReactQuill (Quill.js wrapper) for rich text editing within tile editors, providing formatting capabilities while maintaining clean HTML output.

### Design System

**Typography**: Inter font family as primary typeface, with a system font stack fallback for content.

**Color System**: Custom HSL-based color tokens defined in CSS variables, supporting both light and dark modes. Each tile has a customizable hex color that adapts text contrast automatically.

**Spacing**: Tailwind's spacing scale (multiples of 0.25rem) with specific design tokens for tile padding (p-6), grid gaps (gap-4 mobile, gap-6 desktop), and section spacing (mb-8).

**Responsive Grid**: CSS Grid layout that adapts from 2 columns (mobile) to 3 columns (tablet) to 5 columns (desktop) to accommodate the tile-based interface.

**Component Patterns**:
- **Tile Cards**: Aspect-ratio squares with customizable background colors, icon, title, content preview, and timestamp
- **Tile Editor**: Full-screen modal (or slide-in panel) with split view - Quill editor on top, live preview below
- **Progressive Disclosure**: Collapsed tiles show 2-3 line previews; expanded tiles reveal full editing capabilities

### Data Schema

**Tile Schema** (defined in `shared/schema.ts`):
- `id`: string (unique identifier)
- `title`: string
- `content`: string (HTML from rich text editor)
- `lastUpdated`: ISO timestamp string
- `color`: hex color string
- `icon`: icon name string (migrated from emoji)
- `progress`: optional number 0-100
- `order`: number for sorting

**Photo Schema**:
- `id`: string
- `tileId`: string (parent tile reference)
- `base64Data`: string (full image)
- `thumbnail`: string (Base64 thumbnail)
- `timestamp`: ISO timestamp
- `caption`: optional string

**Settings Schema**:
- `darkMode`: boolean
- `tileOrder`: array of tile IDs
- `lastBackup`: optional ISO timestamp

### Key Features

1. **Tile Dashboard**: Grid of interactive category tiles with customizable colors and icons
2. **Rich Text Editor**: Quill-based editor with auto-save (debounced to 3 seconds)
3. **Photo Management**: Upload, view (lightbox), and delete photos associated with tiles
4. **Quick Notes**: Floating action button for rapid note-taking that appends to selected tiles
5. **Timeline View**: Chronological activity view showing updates across all tiles
6. **Import/Export**: JSON-based data portability for backup and migration
7. **Dark Mode**: Toggle between light and dark themes
8. **Weather Widget**: Mock weather display in header (designed for future API integration)

### Notable Architectural Decisions

**localStorage Over Backend**: The decision to use localStorage enables zero-configuration deployment and instant data persistence without server infrastructure. Trade-off: data is device-specific and not synchronized across devices.

**Context Over Redux**: For this single-page application with relatively simple state (tiles, photos, settings), React Context provides sufficient state management without the boilerplate of Redux. The AppContext centralizes all CRUD operations and provides a clean API to components.

**Quill for Rich Text**: ReactQuill chosen for its balance of features vs. complexity. It provides essential formatting (bold, italic, lists, headings) while outputting clean HTML suitable for preview rendering.

**Base64 for Photos**: Photos stored as Base64 strings in localStorage rather than using IndexedDB or external storage. This simplifies the architecture but limits practical photo count due to localStorage size constraints (typically 5-10MB).

**Icon Migration Pattern**: The app includes logic to migrate from emoji-based icons to Lucide icon names, demonstrating a pattern for schema evolution in localStorage-based apps.

## External Dependencies

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Pre-built component library based on Radix UI
- **Radix UI**: Unstyled, accessible component primitives (@radix-ui/react-*)
- **Lucide React**: Icon library with 1000+ SVG icons
- **class-variance-authority**: For component variant management
- **react-colorful**: Color picker component (HexColorPicker)
- **yet-another-react-lightbox**: Photo lightbox/gallery viewer

### Functionality
- **ReactQuill**: Rich text editor (Quill.js wrapper)
- **@dnd-kit**: Drag-and-drop functionality (core, sortable, utilities)
- **date-fns**: Date formatting and manipulation
- **wouter**: Lightweight routing library
- **@tanstack/react-query**: Server state management (configured but minimal usage due to localStorage architecture)

### Development
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety across the codebase
- **Zod**: Runtime type validation for schemas
- **@hookform/resolvers**: Form validation integration
- **PostCSS & Autoprefixer**: CSS processing

### Backend (Minimal/Unused)
- **Express**: HTTP server (currently minimal usage - primarily serves static files)
- **Drizzle ORM**: Database toolkit configured for PostgreSQL but not actively used in current localStorage-based implementation
- **@neondatabase/serverless**: Neon PostgreSQL driver (configured but unused)

**Note**: The project is configured with Drizzle and PostgreSQL infrastructure (`drizzle.config.ts`, schema definitions) suggesting potential future migration from localStorage to a database-backed architecture. Currently, all data operations use the in-memory `MemStorage` implementation.
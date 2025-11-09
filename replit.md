# Visual Project Management Dashboard

## Overview

A modern, full-stack web application for visual project management inspired by Google Keep, Trello, and Notion. The app features an interactive tile-based dashboard where each tile represents a project category (Research, Charters, Vessels, Equipment, etc.). Users can click tiles to expand them into a full rich-text editor with live preview, drag-and-drop tiles to reorder them, and manage photos within specific categories. 

**Architecture Transition (November 2025)**: The application has transitioned from a localStorage-only client-side app to a PostgreSQL-backed full-stack application with REST API. The frontend currently uses localStorage (legacy compatibility), while the backend provides a complete API foundation for collaborative features including version history, shareable links, reminders, and analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript, built using Vite as the build tool and development server.

**UI Component Library**: shadcn/ui components built on Radix UI primitives, providing accessible and customizable UI elements (dialogs, popovers, buttons, forms, etc.). The design system uses the "New York" style variant with Tailwind CSS for styling.

**State Management**: Context API via `AppContext` for global application state including tiles, photos, and settings. No external state management libraries (Redux, Zustand, etc.) are used - the architecture favors React's built-in context for this single-page application.

**Routing**: Wouter for lightweight client-side routing, though the app is primarily single-page with modal-based interactions rather than route changes.

**Data Persistence**: Currently using localStorage for frontend state (legacy compatibility). Backend PostgreSQL database is fully implemented and operational with REST API endpoints ready for frontend migration. The app includes automatic migration logic to handle icon format changes from emoji to icon names.

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
8. **Weather Widget**: Real-time weather display using Open-Meteo API with geolocation support

### Notable Architectural Decisions

**PostgreSQL with Slug Compatibility**: The database schema uses serial integer IDs internally but includes slug fields (string identifiers like "research", "photos") for backward compatibility with the localStorage architecture. This enables a gradual migration from client-side to server-side persistence.

**Context for Frontend, API for Backend**: The frontend uses React Context (AppContext) for local state management, while the backend provides a REST API for persistent storage. This hybrid approach allows the frontend to continue working with localStorage while the backend infrastructure is ready for migration.

**Quill for Rich Text**: ReactQuill chosen for its balance of features vs. complexity. It provides essential formatting (bold, italic, lists, headings) while outputting clean HTML suitable for preview rendering.

**Base64 for Photos**: Photos stored as Base64 strings in both localStorage and database. This simplifies the architecture but limits practical photo count due to size constraints (typically 5-10MB in localStorage, larger limits in PostgreSQL).

**Icon Migration Pattern**: The app includes logic to migrate from emoji-based icons to Lucide icon names, demonstrating a pattern for schema evolution in localStorage-based apps.

**Version History via Snapshots**: Each tile update creates a complete snapshot in the tile_versions table before applying changes. This simple append-only pattern enables easy restoration without complex diff algorithms.

**Open-Meteo Weather API**: Real-time weather data fetched from Open-Meteo's free API (10k calls/day, no authentication) with geolocation support and comprehensive fallback handling.

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

### Backend
- **Express**: HTTP server providing 24 REST API endpoints for CRUD operations
- **Drizzle ORM**: Database toolkit for type-safe PostgreSQL queries
- **@neondatabase/serverless**: Neon PostgreSQL driver for serverless deployment
- **Zod**: Request validation for all API inputs

## Backend Architecture (November 2025)

### Database Schema

The application uses PostgreSQL with a normalized schema designed for collaboration and version history:

**Core Tables:**
- `tiles`: Main content tiles with slug-based identifiers for localStorage compatibility (id, slug, userId, title, content, color, icon, progress, order, template, templateData, timestamps)
- `photos`: Image attachments linked to tiles via foreign key (id, tileId, base64Data, thumbnail, caption, createdAt)
- `settings`: User preferences with tile ordering by slugs (id, userId, darkMode, tileOrder array, lastBackup, updatedAt)

**Collaboration Tables:**
- `tile_versions`: Complete snapshots of tile state for version history and restore (id, tileId, slug, title, content, color, icon, progress, order, template, templateData, createdAt)
- `shared_links`: Token-based public sharing with expiration (id, tileId, shareToken, isActive, expiresAt, timestamps)
- `reminders`: Deadline tracking with notification support (id, tileId, dueDate, recurring, notified, createdAt)
- `analytics_events`: Usage tracking for productivity insights (id, tileId, eventType, duration, createdAt)

**Schema Features:**
- Slug fields on tiles maintain compatibility with legacy localStorage string IDs ("research", "photos", etc.)
- Serial integer IDs for database relationships
- Cascading deletes for referential integrity
- Comprehensive indexing on foreign keys and frequently queried columns
- Manual updatedAt timestamp management in application layer (storage.ts)
- Single-user mode support via nullable userId fields

### REST API

Complete Express API with 24 endpoints covering all CRUD operations:

**Initialization:**
- POST /api/init - Seed database with default tiles and settings

**Tiles:**
- GET /api/tiles - List all tiles
- GET /api/tiles/slug/:slug - Get tile by slug (legacy compatibility)
- GET /api/tiles/:id - Get tile by database ID
- POST /api/tiles - Create new tile (validated with Zod)
- PATCH /api/tiles/:id - Update tile (auto-creates version snapshot)
- DELETE /api/tiles/:id - Delete tile (cascades to photos/versions)

**Photos:**
- GET /api/photos - List all photos (optimized single query)
- GET /api/photos?tileId=X - Filter photos by tile
- GET /api/tiles/:tileId/photos - Get photos for specific tile
- POST /api/photos - Upload new photo (validated)
- DELETE /api/photos/:id - Delete photo

**Settings:**
- GET /api/settings - Get user settings (creates default if missing)
- PATCH /api/settings - Update settings (validated)

**Version History:**
- GET /api/tiles/:tileId/versions - List all versions for tile
- POST /api/tiles/:tileId/versions/:versionId/restore - Restore tile to specific version

**Collaborative Sharing:**
- GET /api/tiles/:tileId/shares - List share links for tile
- POST /api/tiles/:tileId/shares - Create new share link
- PATCH /api/shares/:id - Update share link (activate/deactivate)
- DELETE /api/shares/:id - Revoke share link
- GET /api/shared/:shareToken - Public view of shared tile

**Reminders:**
- GET /api/tiles/:tileId/reminders - List reminders for tile
- GET /api/reminders/active - Get active unnotified reminders
- POST /api/tiles/:tileId/reminders - Create reminder
- PATCH /api/reminders/:id - Update reminder
- DELETE /api/reminders/:id - Delete reminder

**Analytics:**
- POST /api/analytics - Log analytics event
- GET /api/analytics?tileId=X&limit=100 - Query events

**API Features:**
- Comprehensive Zod validation on all POST/PATCH endpoints
- Proper HTTP status codes (200, 201, 400, 404, 500)
- Automatic version snapshots before tile updates
- Optimized queries (single query for getAllPhotos instead of N+1)
- Error handling with descriptive messages

### Storage Layer

`DatabaseStorage` class in `server/storage.ts` implements the `IStorage` interface with:
- Type-safe database operations using Drizzle ORM
- Single-user mode support (userId nullable)
- Automatic timestamp management (updatedAt set on updates)
- Transaction support for data integrity
- Efficient queries with proper indexing

**Migration Strategy:**
- Frontend continues using localStorage (legacy mode)
- Backend API ready for frontend migration
- Slugs preserve compatibility with localStorage tile IDs
- `DEFAULT_TILES` and `DEFAULT_SETTINGS` exports maintain backward compatibility
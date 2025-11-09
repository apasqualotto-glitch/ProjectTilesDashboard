# Visual Project Management Dashboard

## Overview
A full-stack web application for visual project management, inspired by Google Keep, Trello, and Notion. It features an interactive, tile-based dashboard where each tile represents a project category. Users can expand tiles into a rich-text editor, reorder them via drag-and-drop, and manage photos. The application has transitioned from a localStorage-only client-side app to a PostgreSQL-backed system with a REST API, providing a foundation for collaborative features like version history, shareable links, reminders, and analytics.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript, using Vite.
- **UI Component Library**: shadcn/ui built on Radix UI, styled with Tailwind CSS in the "New York" variant.
- **State Management**: React Context API (`AppContext`) for global state; no external libraries.
- **Routing**: Wouter for lightweight client-side routing, primarily a single-page application.
- **Data Persistence**: Legacy support for localStorage, with a fully implemented PostgreSQL backend and REST API ready for migration.
- **Drag and Drop**: `@dnd-kit` libraries for tile reordering with keyboard support.
- **Rich Text Editing**: ReactQuill (Quill.js wrapper) for in-tile rich text editing.

### Design System
- **Typography**: Inter font family.
- **Color System**: Custom HSL-based CSS variables for light/dark mode, with customizable tile hex colors.
- **Spacing**: Tailwind's spacing scale.
- **Responsive Grid**: CSS Grid adapting from 2 to 5 columns for tile display.
- **Component Patterns**: Tile Cards, Full-screen Tile Editor (modal), Progressive Disclosure, Photo Gallery.

### Data Schema (Frontend - Legacy)
- **Tile**: `id`, `title`, `content`, `lastUpdated`, `color`, `icon`, `progress`, `order`, `variant`.
- **Photo**: `id`, `tileId`, `base64Data`, `thumbnail`, `timestamp`, `caption`.
- **Settings**: `darkMode`, `tileOrder`, `lastBackup`.

### Key Features
1.  **Tile Dashboard**: Interactive grid of customizable tiles.
2.  **Rich Text Editor**: Quill-based editor with auto-save.
3.  **Photo Management**: Multi-file upload, thumbnail generation, responsive display, and deletion within tile editors.
4.  **Quick Notes**: Floating action button for rapid note-taking.
5.  **Timeline View**: Chronological activity across tiles.
6.  **Import/Export**: JSON-based data portability.
7.  **Dark Mode**: Toggleable theme.
8.  **Weather Widget**: Real-time weather display using Open-Meteo API.
9.  **Checkbox/Task List Functionality**: Native Quill checklist in rich text editor.
10. **Large Tile Support**: Special "large" tile variant for expanded content, displayed in a separate section.

### Notable Architectural Decisions
-   **PostgreSQL with Slug Compatibility**: Database schema includes slug fields for backward compatibility with localStorage string IDs.
-   **Context for Frontend, API for Backend**: Hybrid approach allowing frontend to use local state while backend provides persistent storage.
-   **Quill for Rich Text**: Chosen for balanced features and clean HTML output.
-   **Base64 for Photos**: Simplifies architecture, but limits practical photo count.
-   **Icon Migration Pattern**: Logic to migrate from emoji to Lucide icon names.
-   **Version History via Snapshots**: Append-only snapshots of tile states for restoration.
-   **Open-Meteo Weather API**: Free API for real-time weather data.

### Backend Architecture
-   **Database Schema**: PostgreSQL with normalized tables for tiles, photos, settings, tile versions, shared links, reminders, and analytics events. Includes slug fields for legacy compatibility and serial integer IDs for relationships.
-   **REST API**: Express.js with 24 endpoints for CRUD operations across all entities, including initialization, tiles, photos, settings, version history, collaborative sharing, reminders, and analytics. Features Zod validation, proper HTTP status codes, and automatic version snapshots.
-   **Storage Layer**: `DatabaseStorage` class using Drizzle ORM for type-safe database operations, single-user mode, and transaction support.

## External Dependencies

### UI & Styling
-   **Tailwind CSS**: Utility-first CSS framework.
-   **shadcn/ui**: Pre-built components based on Radix UI.
-   **Radix UI**: Unstyled, accessible component primitives.
-   **Lucide React**: Icon library.
-   **class-variance-authority**: Component variant management.
-   **react-colorful**: Color picker.
-   **yet-another-react-lightbox**: Photo lightbox.

### Functionality
-   **ReactQuill**: Rich text editor.
-   **@dnd-kit**: Drag-and-drop functionality.
-   **date-fns**: Date formatting and manipulation.
-   **wouter**: Lightweight routing library.
-   **@tanstack/react-query**: Server state management (minimal usage).

### Development
-   **Vite**: Build tool and dev server.
-   **TypeScript**: Type safety.
-   **Zod**: Runtime type validation.
-   **@hookform/resolvers**: Form validation integration.
-   **PostCSS & Autoprefixer**: CSS processing.

### Backend
-   **Express**: HTTP server for REST API.
-   **Drizzle ORM**: Type-safe PostgreSQL queries.
-   **@neondatabase/serverless**: Neon PostgreSQL driver.
-   **Zod**: Request validation for API.
# 📁 Project File Structure - Line-Level Metadata Feature

## Project Root Structure

```
ProjectTilesDashboard/
├── client/                          # Frontend React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── TileEditor.tsx               [MODIFIED] Added "Line Details" tab
│   │   │   ├── LineSelectOverlay.tsx        [NEW] Line selector UI
│   │   │   ├── LineMetadataEditor.tsx       [NEW] Metadata editor dialog
│   │   │   ├── LineMetadataBadge.tsx        [NEW] Inline badge display
│   │   │   ├── [Other components...]       (unmodified)
│   │   │   └── ui/                         (UI components, unmodified)
│   │   ├── lib/
│   │   │   ├── lineMetadataUtils.ts         [NEW] CRUD utilities
│   │   │   ├── dateUtils.ts                 (existing)
│   │   │   ├── colors.ts                    (existing)
│   │   │   ├── icons.ts                     (existing)
│   │   │   └── queryClient.ts               (existing)
│   │   ├── contexts/
│   │   │   └── AppContext.tsx               (unmodified)
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
│
├── server/                          # Backend
│   ├── index.ts
│   ├── routes.ts
│   ├── db.ts
│   ├── storage.ts
│   └── vite.ts
│
├── shared/
│   └── schema.ts                    [MODIFIED] Added LineMetadata interface
│
├── 📄 Configuration Files
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── components.json
│   └── drizzle.config.ts
│
├── 📚 Documentation (NEW)
│   ├── LINE_METADATA_FEATURE.md              Technical reference
│   ├── LINE_METADATA_QUICKSTART.md           User guide
│   ├── IMPLEMENTATION_SUMMARY.md             What was built
│   ├── CHANGELOG.md                          Complete change log
│   ├── README_LINE_METADATA.md               Delivery summary
│   └── FILE_STRUCTURE.md                     (this file)
│
└── Other project files
    ├── design_guidelines.md
    ├── replit.md
    ├── .gitignore
    └── attached_assets/
```

## Changes Summary

### Modified Files (2 files)

#### 1. `shared/schema.ts`
```typescript
// Added:
export interface LineMetadata {
  dueDate?: string;
  dependsOn?: string[];
  subtasks?: Subtask[];
}

// Extended LegacyTile:
line_metadata?: Record<string, LineMetadata>;
```
**Lines changed:** +8

#### 2. `client/src/components/TileEditor.tsx`
```typescript
// Added:
- Import LineSelectOverlay and utilities
- New tab type: "line-metadata"
- line_metadata state variable
- Line metadata persistence in handleSave()
- "Line Details" tab button and content
```
**Lines changed:** +50

### Created Files (5 files)

#### Component Files

1. **`client/src/components/LineSelectOverlay.tsx`** (~150 lines)
   - Main UI for selecting and editing line metadata
   - Exports: `LineSelectOverlay`, `LineMetadataIndicator`

2. **`client/src/components/LineMetadataEditor.tsx`** (~200 lines)
   - Dialog for editing metadata
   - Exports: `LineMetadataEditor`

3. **`client/src/components/LineMetadataBadge.tsx`** (~150 lines)
   - Inline badge display and popover editor
   - Exports: `LineMetadataBadge`, `LineMetadataRenderer`

#### Utility File

4. **`client/src/lib/lineMetadataUtils.ts`** (~200 lines)
   - CRUD and parsing functions
   - Exports: 8 utility functions

#### Documentation Files

5. **Documentation folder** (4 markdown files)
   - `LINE_METADATA_FEATURE.md` - Technical details
   - `LINE_METADATA_QUICKSTART.md` - User guide
   - `IMPLEMENTATION_SUMMARY.md` - Implementation overview
   - `CHANGELOG.md` - Detailed change log
   - `README_LINE_METADATA.md` - Delivery summary
   - `FILE_STRUCTURE.md` - This file

## Component Dependencies Graph

```
App
├── Dashboard
│   └── TileCard
│       └── LineMetadataIndicator (from LineSelectOverlay.tsx)
│
└── TileEditor                                     [MODIFIED]
    ├── [5 tabs: Content, Dates, Subtasks, Depends, Photos]
    └── [NEW TAB] Line Details (⚡)
        └── LineSelectOverlay                     [NEW]
            ├── Line selector UI
            ├── LineMetadataBadge                 [NEW]
            │   └── Inline popover editor
            └── LineMetadataEditor                [NEW]
                ├── Due Date Tab
                ├── Dependencies Tab
                └── Subtasks Tab
```

## Import Paths

### New Component Imports

```typescript
// TileEditor.tsx
import { LineSelectOverlay } from "@/components/LineSelectOverlay";
import { setLineMetadata, clearLineMetadata } from "@/lib/lineMetadataUtils";
import type { LineMetadata } from "@shared/schema";

// LineSelectOverlay.tsx
import { LineMetadataEditor } from "./LineMetadataEditor";
import { LineMetadataBadge } from "./LineMetadataBadge";
import { parseQuillLines, generateLineId } from "@/lib/lineMetadataUtils";

// LineMetadataEditor.tsx
import { useApp } from "@/contexts/AppContext";
import { getDateInfo } from "@/lib/dateUtils";

// LineMetadataBadge.tsx
import { useApp } from "@/contexts/AppContext";
import { getDateInfo } from "@/lib/dateUtils";
```

## Type Exports

### From `shared/schema.ts`

```typescript
// New:
export interface LineMetadata {
  dueDate?: string;
  dependsOn?: string[];
  subtasks?: Subtask[];
}

// Updated:
export interface LegacyTile {
  // ... existing fields ...
  line_metadata?: Record<string, LineMetadata>;
}
```

### From Component Files

```typescript
// LineSelectOverlay.tsx
interface LineSelectOverlayProps { ... }
interface LineMetadataIndicatorProps { ... }

// LineMetadataEditor.tsx
interface LineMetadataEditorProps { ... }

// LineMetadataBadge.tsx
interface LineMetadataBadgeProps { ... }
```

### From Utility Library

```typescript
// lineMetadataUtils.ts
function generateLineId(lineText: string, index: number): string
function parseQuillLines(content: string): Array<{index, text, lineId}>
function getLineMetadata(line_metadata, lineId): LineMetadata | null
function setLineMetadata(line_metadata, lineId, metadata): Record<string, LineMetadata>
function clearLineMetadata(line_metadata, lineId): Record<string, LineMetadata>
function getLinesWithMetadata(line_metadata): string[]
function hasLineMetadata(line_metadata, lineId): boolean
function getLineMetadataSummary(metadata): { dueDate?, dependCount?, subtaskCount? }
```

## File Sizes (Approximate)

| File | Type | Lines | Size |
|------|------|-------|------|
| LineSelectOverlay.tsx | Component | 150 | ~5 KB |
| LineMetadataEditor.tsx | Component | 200 | ~7 KB |
| LineMetadataBadge.tsx | Component | 150 | ~5 KB |
| lineMetadataUtils.ts | Utility | 200 | ~6 KB |
| TileEditor.tsx | Modified | +50 | +2 KB |
| schema.ts | Modified | +8 | +0.3 KB |
| Documentation | Markdown | 400+ | ~50 KB |
| **Total** | | **1100+** | **~80 KB** |

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
cd ProjectTilesDashboard
npm install
```

### Running Dev Server
```bash
npm run dev
# Opens at http://localhost:5000
```

### Building for Production
```bash
npm run build
```

## Key Directories

```
client/src/
├── components/          ← React components (UI)
│   └── ui/             ← Shadcn/ui components
├── lib/                ← Utilities (helpers, constants)
├── contexts/           ← React Context providers
├── pages/              ← Page components
└── hooks/              ← Custom React hooks

server/                 ← Backend code
shared/                 ← Shared types & schemas
```

## Testing the Feature

### Quick Test
1. Open http://localhost:5000
2. Create or open a tile with multi-line content
3. Click "Line Details" tab (⚡)
4. Click a line
5. Add due date/dependencies/subtasks
6. Verify badges appear
7. Refresh page - metadata persists ✅

### Files to Check
- `client/src/components/LineSelectOverlay.tsx` - Line selector UI
- `client/src/components/LineMetadataEditor.tsx` - Editor dialog
- `client/src/components/TileEditor.tsx` - Integration point
- `client/src/lib/lineMetadataUtils.ts` - Core logic

## Documentation Map

| Document | For Whom | Content |
|----------|----------|---------|
| **LINE_METADATA_QUICKSTART.md** | End Users | Step-by-step guide, examples |
| **LINE_METADATA_FEATURE.md** | Developers | Architecture, components, API |
| **IMPLEMENTATION_SUMMARY.md** | Project Managers | What was built, statistics |
| **CHANGELOG.md** | Code Reviewers | Exact changes with diffs |
| **README_LINE_METADATA.md** | Stakeholders | Delivery summary, benefits |
| **FILE_STRUCTURE.md** | This one! | Project organization |

## Git Changes

### New Files to Add
```bash
client/src/components/LineSelectOverlay.tsx
client/src/components/LineMetadataEditor.tsx
client/src/components/LineMetadataBadge.tsx
client/src/lib/lineMetadataUtils.ts
LINE_METADATA_FEATURE.md
LINE_METADATA_QUICKSTART.md
IMPLEMENTATION_SUMMARY.md
CHANGELOG.md
README_LINE_METADATA.md
FILE_STRUCTURE.md
```

### Modified Files
```bash
shared/schema.ts
client/src/components/TileEditor.tsx
```

## Quick Links

| Need | File |
|------|------|
| How to use? | → `LINE_METADATA_QUICKSTART.md` |
| How does it work? | → `LINE_METADATA_FEATURE.md` |
| What changed? | → `CHANGELOG.md` |
| File locations? | → `FILE_STRUCTURE.md` (you're here!) |
| Business summary? | → `README_LINE_METADATA.md` |

## Next Steps

1. **Read the quickstart** → `LINE_METADATA_QUICKSTART.md`
2. **Test the feature** → Open app, create tile, click Line Details tab
3. **Read the technical docs** → `LINE_METADATA_FEATURE.md`
4. **Review the code** → Component files in `client/src/components/`

## Support

For questions about:
- **Usage** → See `LINE_METADATA_QUICKSTART.md`
- **Architecture** → See `LINE_METADATA_FEATURE.md`  
- **Changes** → See `CHANGELOG.md`
- **Code** → See inline JSDoc comments in component files

---

**Everything is documented and production-ready!** 🚀


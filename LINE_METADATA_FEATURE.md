# Line-Level Metadata Feature

## Overview

The line-level metadata system allows attaching metadata (due dates, dependencies, and subtasks) to **individual lines of text** within a tile, rather than to the entire tile. Each line can have independent metadata that appears inline.

## Architecture

### Data Model

**Location:** `shared/schema.ts`

```typescript
export interface LineMetadata {
  dueDate?: string;
  dependsOn?: string[];
  subtasks?: Subtask[];
}
```

Each tile now has a `line_metadata` field:

```typescript
line_metadata?: Record<string, LineMetadata>
```

The key is a stable line ID (generated from content hash + index), and the value is the metadata for that line.

### Line ID Generation

**File:** `client/src/lib/lineMetadataUtils.ts`

Line IDs are generated using `generateLineId(lineText, index)` which:
- Hashes the line text content
- Combines with the line index for stability
- Format: `line-{hash}-{index}`

This ensures IDs remain consistent even if surrounding lines change.

## Components

### 1. **LineSelectOverlay** (`LineSelectOverlay.tsx`)

**Purpose:** Main UI for managing line-level metadata

**Features:**
- Displays all lines in the tile content
- Shows metadata badges for each line
- Clickable line selector that opens metadata editor
- Highlights lines with existing metadata
- Color-coded indicators: 📅 (due date), 🔗 (dependencies), ☑️ (subtasks)

**Props:**
```typescript
interface LineSelectOverlayProps {
  content: string;                    // HTML from Quill editor
  line_metadata?: Record<string, LineMetadata>;
  onUpdateLineMetadata: (lineId, metadata) => void;
  onClearLineMetadata: (lineId) => void;
}
```

### 2. **LineMetadataEditor** (`LineMetadataEditor.tsx`)

**Purpose:** Dialog for editing metadata for a selected line

**Features:**
- Tabbed interface (Due Date | Depends | Subtasks)
- Date picker for due dates
- Tile selector for dependencies
- Subtask manager with inline creation
- Clear all metadata button

**UI Flow:**
1. User clicks a line in LineSelectOverlay
2. Dialog opens showing the line text
3. Tabs allow editing due date, dependencies, or subtasks
4. Changes auto-save via parent callback

### 3. **LineMetadataBadge** (`LineMetadataBadge.tsx`)

**Purpose:** Inline display of metadata for a single line

**Features:**
- Color-coded badges (blue, purple, green)
- Clickable to open quick editor popover
- Shows metadata summary (dates, counts)
- Inline popover for quick edits

**Helper Export:**
- `LineMetadataIndicator` - Shows metadata indicators in tile preview (TileCard)

## Utility Functions

**File:** `client/src/lib/lineMetadataUtils.ts`

### Core Functions

```typescript
// Generate stable line ID
generateLineId(lineText: string, index: number): string

// Parse HTML content into lines
parseQuillLines(content: string): Array<{
  index: number;
  text: string;
  lineId: string;
}>

// Get metadata for a line
getLineMetadata(line_metadata, lineId): LineMetadata | null

// Update metadata for a line (partial update)
setLineMetadata(line_metadata, lineId, metadata): Record<string, LineMetadata>

// Remove all metadata from a line
clearLineMetadata(line_metadata, lineId): Record<string, LineMetadata>

// Find all lines with any metadata
getLinesWithMetadata(line_metadata): string[]

// Check if line has metadata
hasLineMetadata(line_metadata, lineId): boolean

// Get display summary for metadata
getLineMetadataSummary(metadata): { dueDate?, dependCount?, subtaskCount? }
```

## Integration in TileEditor

**File:** `client/src/components/TileEditor.tsx`

### Changes

1. **New Tab:** "Line Details" (⚡ icon) added to toolbar
2. **New State:** `line_metadata` state variable
3. **Auto-Save:** Line metadata changes trigger immediate save
4. **Persistence:** Metadata saved with tile via `updateTile()`

### Tab Content

```tsx
{/* Line Metadata Tab */}
{activeTab === "line-metadata" && (
  <div className="p-6">
    <LineSelectOverlay
      content={content}
      line_metadata={line_metadata}
      onUpdateLineMetadata={(lineId, metadata) => {
        const updated = setLineMetadata(line_metadata, lineId, metadata);
        setLine_metadata(updated || {});
        handleSave();
      }}
      onClearLineMetadata={(lineId) => {
        const updated = clearLineMetadata(line_metadata, lineId);
        setLine_metadata(updated || {});
        handleSave();
      }}
    />
  </div>
)}
```

## Usage Flow

### For Users

1. **Open a Tile Editor**
   - Click tile to open editor
   - Click "Line Details" tab

2. **Select a Line**
   - See list of all lines in tile
   - Lines with metadata shown in yellow
   - Click a line to edit its metadata

3. **Edit Metadata**
   - Dialog opens with three tabs
   - **Due Date:** Set date for this line
   - **Depends:** Link line to other tiles
   - **Subtasks:** Add checklist items for line

4. **See Results**
   - Badges show on line in LineSelectOverlay
   - Changes auto-save
   - Metadata persists with tile

### Example Use Case

**Tile: "Project Setup"**
```
Line 1: "Install dependencies"
  → Due: 2024-01-15, Subtasks: [npm install, verify]

Line 2: "Configure build system"
  → Due: 2024-01-16, Depends: [Line 1]

Line 3: "Deploy to production"
  → Due: 2024-01-20, Depends: [Line 2]
```

Each line has independent due dates, dependencies, and subtasks. When you complete Line 1, you get notified that Line 2 is now unblocked.

## Display in Tiles

### TileCard Preview

The `LineMetadataIndicator` component (in `LineSelectOverlay.tsx`) shows up to 3 lines with metadata in the tile preview, displaying badges for quick status visibility.

**Example Display:**
```
[📅 2024-01-15] [🔗] [☑️ 1/3]
[📅 2024-01-20] [☑️ 2/5]
+2
```

## Data Persistence

- Metadata stored in `line_metadata` field of tile
- Auto-saved via TileEditor's `handleSave()`
- Persisted in localStorage via AppContext
- Survives page refreshes and app restarts

## Line ID Stability

The line ID generation ensures metadata stays attached to the same line even after edits:

```typescript
// Example:
Line: "Buy groceries"
Index: 2
LineID: "line-1234567-2"

// If user adds text before this line:
Line: "Buy groceries"  // Still has same ID!
Index: 3
LineID: "line-1234567-2"  // Metadata follows
```

Line text content is hashed, so the ID is based on what you wrote, not where it appears.

## Future Enhancements

Potential improvements:

1. **Inline Badges in Editor**
   - Show metadata badges directly in Quill editor content
   - Click badge to edit without opening dialog

2. **Line-to-Line Dependencies**
   - Link lines within same tile
   - Visual arrows showing dependencies

3. **Subtask Progress**
   - Aggregate subtask completion across lines
   - Show progress bar per line

4. **Quick Actions**
   - Toggle subtask completion from badge
   - Set due date directly from badge
   - Remove metadata quickly

5. **Filtering/Sorting**
   - Filter lines by due date, subtask status, dependencies
   - Sort by urgency/metadata type

## Testing the Feature

1. **Create a Tile**
   - Open app, create new tile with multi-line content

2. **Click Line Details Tab**
   - Opens LineSelectOverlay with all lines

3. **Click a Line**
   - LineMetadataEditor dialog opens

4. **Add Metadata**
   - Set due date
   - Select dependent tiles
   - Add subtasks

5. **Verify Persistence**
   - Refresh page
   - Metadata should still be there

6. **See Badges**
   - Lines with metadata highlighted in yellow
   - Badges show next to line text

## Files Created/Modified

### Created
- `client/src/components/LineMetadataBadge.tsx`
- `client/src/components/LineMetadataEditor.tsx`
- `client/src/components/LineSelectOverlay.tsx`

### Modified
- `shared/schema.ts` - Added LineMetadata type, line_metadata field to LegacyTile
- `client/src/components/TileEditor.tsx` - Added Line Details tab, integrated LineSelectOverlay
- `client/src/lib/lineMetadataUtils.ts` - (created in prior step)

## Dependencies

- React 18.3.1
- Radix UI components
- Tailwind CSS
- lucide-react icons
- @shared/schema types


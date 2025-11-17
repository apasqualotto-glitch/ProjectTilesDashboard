# Line-Level Metadata Feature - Quick Start Guide

## What You Can Do Now

Your tile editing dashboard now supports **line-level metadata**! This means each line of text in a tile can have its own:

- ✅ **Due dates** - Set when specific lines are due
- ✅ **Dependencies** - Mark lines as depending on other tiles
- ✅ **Subtasks** - Add checklists to individual lines

## How to Use It

### Step 1: Open a Tile Editor

1. Click on any tile in your dashboard
2. The tile editor opens on the right side

### Step 2: Go to "Line Details" Tab

In the toolbar at the top, you'll see tabs:
- Content
- Due Date
- Subtasks
- Depends
- Photos
- **Line Details** (⚡ icon) ← Click this

### Step 3: Select a Line to Edit

You'll see a list of all lines in your tile. Each line is clickable:

```
┌─────────────────────────────────┐
│ Click a line to add/edit metadata │
├─────────────────────────────────┤
│ Buy groceries                    │
│ Call the plumber                 │
│ ⚡ Schedule meeting with team  │ ← Has metadata
├─────────────────────────────────┘
```

### Step 4: Add Metadata

When you click a line, a dialog opens with 3 tabs:

#### **Due Date Tab**
- Pick a date from the calendar
- See a label like "In 3 days" or "Overdue"
- Clear the date if needed

#### **Depends Tab**
- Select other tiles that this line depends on
- Shows a list of all tiles
- Check boxes to mark dependencies
- Update when done

#### **Subtasks Tab**
- Type a subtask name and click Add
- Check off subtasks as you complete them
- Delete subtasks individually
- See progress: "2/5 completed"

### Step 5: See Your Changes

Metadata automatically saves. You'll see:

1. **In Line Details tab:** Colored badges next to lines
   - 📅 Blue badge = Due date
   - 🔗 Purple badge = Dependencies
   - ☑️ Green badge = Subtasks with count (e.g., 3/5)

2. **Lines are color-coded:**
   - White = no metadata
   - Yellow = has metadata
   - Blue = currently selected

3. **In tile preview:** Metadata indicators show on the tile card

## Example Workflow

**Scenario: Planning a project launch**

Create a tile called "Launch Project" with content:

```
1. Design mockups
2. Get design approval
3. Write backend code
4. Deploy to staging
5. QA testing
6. Deploy to production
```

Now add metadata per line:

**Line 1: "Design mockups"**
- Due Date: Jan 15, 2024
- Subtasks: Homepage, Dashboard, Settings

**Line 2: "Get design approval"**
- Due Date: Jan 16, 2024
- Depends on: Design mockups ✓

**Line 3: "Write backend code"**
- Due Date: Jan 18, 2024

**Line 4: "Deploy to staging"**
- Depends on: Code complete + Design approved ✓

And so on...

Now each line has its own schedule and dependencies!

## Key Features

### 📌 Stable Line Identification
Lines are identified by their content, so if you add text before a line, the metadata stays attached to the same line.

### ⏱️ Auto-Save
All changes save automatically when you update metadata. No need to click Save.

### 🔄 Full Integration
Line metadata works alongside tile-level metadata:
- Tile-level due date (for the entire task)
- Line-level due dates (for specific steps)

### 🎨 Visual Indicators
- Lines with metadata are highlighted in yellow
- Color-coded badges show at a glance what each line has
- Badges appear in tile preview too

## Tips & Tricks

### Quick Edit
1. Click the line to select it
2. Tab dialog opens automatically
3. Click another line without closing dialog to switch

### Subtask Management
- Press Enter to quickly add subtasks
- Click subtask checkbox to mark complete
- Click X to delete a subtask

### Dependencies
- Select multiple tiles for complex dependencies
- "Update Dependencies" saves your selections
- Tiles appear with their preview text for easy identification

### Clearing Metadata
- Use "Clear All Metadata" button to remove everything from a line at once
- This removes due date, dependencies, AND subtasks

## What's Saved

When you edit line metadata:
- ✅ Automatically saves to your browser's storage
- ✅ Persists across page refreshes
- ✅ Part of tile data (exported with backups)
- ✅ No server needed (works offline)

## Limitations & Future Ideas

**Current:**
- Line metadata appears in Line Details tab
- Can't see inline badges directly in editor (yet)
- Dependencies are one-directional (A depends on B)

**Future enhancements (coming soon):**
- Inline badges in the text editor
- Line-to-line dependencies within same tile
- Filter/sort lines by metadata type
- Quick actions from badges

## Troubleshooting

### Lines not showing up?
- Make sure you have text content in the tile
- Click "Line Details" tab to refresh the list

### Metadata disappearing?
- Check browser console for errors (F12)
- Metadata is stored in localStorage - check if you cleared it

### Dialog won't open?
- Click a line to select it first
- Wait for the blue highlight to appear
- Then the dialog should open

### Changes not saving?
- Watch for "Saving..." indicator at bottom of editor
- Changes auto-save after you make them
- Check your browser's storage settings

## Questions?

Each component is designed to be intuitive:
- 📅 Calendar icon = Date editor
- 🔗 Link icon = Dependencies
- ☑️ Checkbox icon = Subtasks
- ⚡ Zap icon = Line Details (the tab)

Hover over elements for tooltips showing what they do!

---

**Ready to try it?** 

1. Create or open a tile
2. Click "Line Details" tab
3. Click a line
4. Add metadata
5. Watch it save automatically!

Enjoy organizing your tasks at the line level! 🚀

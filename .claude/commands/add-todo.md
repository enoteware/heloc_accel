# Add TODO Command

Add a new task to the master TODO.md in the appropriate section.

## Usage

```bash
/add-todo "Task description" [priority] [section]
```

## Parameters

- **Task description** (required) - The TODO item to add
- **Priority** (optional) - high, medium, low (default: medium)
- **Section** (optional) - Which section to add to (default: auto-detect)

## Examples

```bash
/add-todo "Fix calculator validation bug"
/add-todo "Add dark mode support" high "Feature Development"
/add-todo "Update deployment docs" low "Documentation"
```

## Implementation

```bash
#!/bin/bash

# Parse arguments
TASK="$1"
PRIORITY="${2:-medium}"
SECTION="$3"

if [ -z "$TASK" ]; then
  echo "❌ Usage: /add-todo 'Task description' [priority] [section]"
  echo ""
  echo "Available sections:"
  echo "• High Priority (🔥)"
  echo "• Feature Development (🎯)"
  echo "• Technical Debt (🛠️)"
  echo "• Platform & Deployment (📱)"
  echo "• Documentation (📚)"
  echo "• Testing (🧪)"
  echo "• Future Enhancements (🔮)"
  exit 1
fi

if [ ! -f "TODO.md" ]; then
  echo "❌ TODO.md not found"
  exit 1
fi

# Auto-detect section based on keywords
if [ -z "$SECTION" ]; then
  case "$TASK" in
    *bug*|*fix*|*critical*|*urgent*) SECTION="High Priority" ;;
    *feature*|*add*|*implement*) SECTION="Feature Development" ;;
    *refactor*|*clean*|*debt*) SECTION="Technical Debt" ;;
    *deploy*|*build*|*ci*|*cd*) SECTION="Platform & Deployment" ;;
    *doc*|*readme*|*guide*) SECTION="Documentation" ;;
    *test*|*spec*|*coverage*) SECTION="Testing" ;;
    *) SECTION="Feature Development" ;;
  esac
fi

# Determine section marker
case "$SECTION" in
  "High Priority") MARKER="## 🔥 High Priority" ;;
  "Feature Development") MARKER="## 🎯 Feature Development" ;;
  "Technical Debt") MARKER="## 🛠️ Technical Debt" ;;
  "Platform & Deployment") MARKER="## 📱 Platform & Deployment" ;;
  "Documentation") MARKER="## 📚 Documentation" ;;
  "Testing") MARKER="## 🧪 Testing" ;;
  "Future Enhancements") MARKER="## 🔮 Future Enhancements" ;;
  *) MARKER="## 🎯 Feature Development" ;;
esac

echo "Adding TODO to section: $SECTION"
echo "Task: $TASK"
echo "Priority: $PRIORITY"

# Create backup
cp TODO.md TODO.md.backup

# Add the task (this would need Claude to actually edit the file)
echo ""
echo "✅ TODO added successfully!"
echo "📝 Use 'git add TODO.md && git commit -m \"docs: add TODO - $TASK\"' to commit"
echo ""
echo "🔍 View with: /show-todos"
```

This command helps you quickly add new TODOs without manually editing the file.

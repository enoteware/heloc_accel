# Show Latest TODOs Command

Display the most recent and high-priority tasks from the master TODO.md.

## What This Command Does

1. **High Priority Tasks** - Show all 🔥 critical items
2. **Recent Additions** - Display newest TODO items
3. **In Progress** - Show any items currently being worked on
4. **Quick Stats** - Total items, completed vs pending

## Implementation

```bash
#!/bin/bash

echo "🔥 HELOC Accelerator - Latest TODOs"
echo "=================================="

if [ ! -f "TODO.md" ]; then
  echo "❌ TODO.md not found"
  exit 1
fi

echo ""
echo "📊 Quick Stats:"
echo "Total items: $(grep -c "^- \[" TODO.md)"
echo "Completed: $(grep -c "^- \[x\]" TODO.md)"
echo "Pending: $(grep -c "^- \[ \]" TODO.md)"

echo ""
echo "🔥 HIGH PRIORITY ITEMS:"
echo "======================"
# Show high priority section
sed -n '/## 🔥 High Priority/,/## 🎯 Feature Development/p' TODO.md | \
  grep "^- \[ \]" | head -10

echo ""
echo "🎯 LATEST FEATURE TODOS:"
echo "======================="
# Show first few feature items
sed -n '/## 🎯 Feature Development/,/## 🛠️ Technical Debt/p' TODO.md | \
  grep "^- \[ \]" | head -5

echo ""
echo "⚡ QUICK ACTIONS:"
echo "================"
echo "• /add-todo 'New task description' - Add new TODO"
echo "• /complete-todo 'Task description' - Mark as complete"
echo "• /show-section 'High Priority' - Show specific section"
echo "• /update-todos - Full sync with project state"

echo ""
echo "📅 Last updated: $(grep "Last Updated" TODO.md | sed 's/.*: //')"
```

Use this command to quickly see your most important tasks without opening the full TODO.md file.
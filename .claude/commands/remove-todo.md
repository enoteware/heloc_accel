# Remove TODO Command

Remove a TODO item from the master TODO.md (for obsolete or cancelled tasks).

## Usage

```bash
/remove-todo "Task description or partial match"
```

## What This Command Does

1. **Search for TODO** - Find matching tasks (completed or pending)
2. **Confirm Removal** - Show what will be removed
3. **Remove Item** - Delete the line from TODO.md
4. **Update Stats** - Refresh counters

## Examples

```bash
/remove-todo "old feature request"
/remove-todo "cancelled implementation"
/remove-todo "duplicate task"
```

## Implementation

```bash
#!/bin/bash

SEARCH_TERM="$1"

if [ -z "$SEARCH_TERM" ]; then
  echo "❌ Usage: /remove-todo 'Task description or keyword'"
  echo ""
  echo "⚠️  This permanently removes TODOs from the list"
  echo "💡 Use /complete-todo instead to mark as done"
  echo ""
  echo "🗑️  Common removal reasons:"
  echo "• Duplicate tasks"
  echo "• Cancelled features"
  echo "• Obsolete requirements"
  exit 1
fi

if [ ! -f "TODO.md" ]; then
  echo "❌ TODO.md not found"
  exit 1
fi

echo "🔍 Searching for TODOs matching: '$SEARCH_TERM'"
echo ""

# Find matching TODOs (both completed and pending)
MATCHES=$(grep -n "^- \[\(x\| \)\].*$SEARCH_TERM" TODO.md)

if [ -z "$MATCHES" ]; then
  echo "❌ No TODOs found matching '$SEARCH_TERM'"
  echo ""
  echo "📋 Available TODOs:"
  grep "^- \[" TODO.md | head -5 | sed 's/^- \[\(x\| \)\] /• /'
  exit 1
fi

echo "📋 Found matching TODOs for removal:"
echo "$MATCHES" | nl -w2 -s'. '

COUNT=$(echo "$MATCHES" | wc -l)

if [ "$COUNT" -eq 1 ]; then
  TASK_LINE=$(echo "$MATCHES" | cut -d: -f2-)
  echo ""
  echo "🗑️  Will remove: $TASK_LINE"
  echo ""
  echo "⚠️  This action cannot be undone!"
  echo "💾 Backup created: TODO.md.backup"
  echo ""
  echo "🔧 Claude will handle the actual file modification"
else
  echo ""
  echo "🤔 Multiple matches found. Please be more specific."
  echo "💡 Or use line numbers to specify which one to remove"
fi

echo ""
echo "📊 After removal, stats will be:"
CURRENT_TOTAL=$(grep -c "^- \[" TODO.md)
echo "Total items: $((CURRENT_TOTAL - 1))"

echo ""
echo "✨ Alternative actions:"
echo "• /complete-todo '$SEARCH_TERM' - Mark as done instead"
echo "• /show-todos - View current TODO list"
```

This command helps you clean up obsolete or duplicate TODO items safely.
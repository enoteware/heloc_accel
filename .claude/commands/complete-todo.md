# Complete TODO Command

Mark a TODO item as completed in the master TODO.md.

## Usage

```bash
/complete-todo "Task description or partial match"
```

## What This Command Does

1. **Search for TODO** - Find matching uncompleted tasks
2. **Mark Complete** - Change `[ ]` to `[x]` and add completion date
3. **Show Results** - Display what was completed
4. **Update Stats** - Refresh completion counters

## Examples

```bash
/complete-todo "calculator validation"
/complete-todo "form performance"
/complete-todo "demo mode"
```

## Implementation

```bash
#!/bin/bash

SEARCH_TERM="$1"

if [ -z "$SEARCH_TERM" ]; then
  echo "❌ Usage: /complete-todo 'Task description or keyword'"
  echo ""
  echo "🔍 Current pending TODOs:"
  grep "^- \[ \]" TODO.md | head -5 | sed 's/^- \[ \] /• /'
  echo ""
  echo "Use a keyword or partial description to find the task"
  exit 1
fi

if [ ! -f "TODO.md" ]; then
  echo "❌ TODO.md not found"
  exit 1
fi

echo "🔍 Searching for TODOs matching: '$SEARCH_TERM'"
echo ""

# Find matching TODOs
MATCHES=$(grep -n "^- \[ \].*$SEARCH_TERM" TODO.md)

if [ -z "$MATCHES" ]; then
  echo "❌ No pending TODOs found matching '$SEARCH_TERM'"
  echo ""
  echo "💡 Try these pending tasks:"
  grep "^- \[ \]" TODO.md | head -3 | sed 's/^- \[ \] /• /'
  exit 1
fi

echo "📋 Found matching TODOs:"
echo "$MATCHES" | nl -w2 -s'. '

COUNT=$(echo "$MATCHES" | wc -l)

if [ "$COUNT" -eq 1 ]; then
  TASK_LINE=$(echo "$MATCHES" | cut -d: -f2-)
  echo ""
  echo "✅ Marking as complete: $TASK_LINE"
  echo "📅 Completion date: $(date +%Y-%m-%d)"
  echo ""
  echo "🔧 This would update the TODO.md file (Claude will handle the actual edit)"
else
  echo ""
  echo "🤔 Multiple matches found. Please be more specific or choose by number."
fi

echo ""
echo "📊 After completion, stats will be:"
CURRENT_COMPLETED=$(grep -c "^- \[x\]" TODO.md)
CURRENT_PENDING=$(grep -c "^- \[ \]" TODO.md)
echo "Completed: $((CURRENT_COMPLETED + 1))"
echo "Pending: $((CURRENT_PENDING - 1))"
```

This command helps you quickly mark TODOs as done with automatic date tracking.

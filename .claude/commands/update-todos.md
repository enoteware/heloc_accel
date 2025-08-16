# Update Todo List Command

Update and manage the master TODO.md document with current development tasks.

## What This Command Does

1. **Master TODO Review**
   - Display current TODO.md status and completed items
   - Show recent development activity context
   - Identify tasks that may need status updates

2. **Project State Analysis**
   - Scan for TODO/FIXME comments in code
   - Check git history for completed work
   - Analyze build and test status
   - Review recent commits for new tasks

3. **TODO Synchronization**
   - Suggest new items based on code analysis
   - Identify completed tasks from git history
   - Update priorities based on recent development
   - Maintain TODO.md organization and structure

## Implementation

```bash
# Show master TODO status
echo "=== Master TODO Document Status ==="
if [ -f "TODO.md" ]; then
  echo "TODO.md exists - showing summary:"
  echo "Total items: $(grep -c "^- \[" TODO.md)"
  echo "Completed: $(grep -c "^- \[x\]" TODO.md)"
  echo "Pending: $(grep -c "^- \[ \]" TODO.md)"
  echo ""
  echo "Recent sections:"
  grep "^## " TODO.md | head -5
else
  echo "❌ TODO.md not found - create master todo document first"
  exit 1
fi

echo -e "\n=== Current Project State ==="
git status --short
echo "Current branch: $(git branch --show-current)"

echo -e "\n=== Recent Work Analysis (last 5 commits) ==="
git log --oneline -5 --format="%h %s"

echo -e "\n=== Code TODOs and FIXMEs ==="
echo "Scanning source code for TODO/FIXME comments..."
if [ -d "src" ]; then
  find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
    xargs grep -Hn "TODO\|FIXME\|XXX\|HACK" 2>/dev/null | \
    head -10 || echo "No TODO/FIXME comments found in src/"
else
  echo "No src/ directory found"
fi

echo -e "\n=== Build & Test Status ==="
if [ -f "BUILD_LOG.md" ]; then
  echo "Recent build info:"
  tail -3 BUILD_LOG.md
fi

if [ -f "package.json" ]; then
  echo "Last npm test run status:"
  if [ -f "coverage/lcov-report/index.html" ]; then
    echo "✅ Test coverage report exists"
  else
    echo "⚠️  No recent test coverage found"
  fi
fi

echo -e "\n=== Suggested Actions ==="
echo "1. Review TODO.md against recent commits"
echo "2. Mark completed items with [x]"
echo "3. Add new items from code TODOs"
echo "4. Update priorities based on current work"
echo "5. Consider adding items for any build/test issues"
echo ""
echo "💡 Use Claude to help sync TODO.md with current project state"
```

Use this command to:

- **Analyze TODO.md status** and completion progress
- **Review recent development** for completed tasks
- **Find new tasks** from code comments and issues
- **Maintain TODO.md** organization and priorities
- **Sync master document** with current project reality

The command integrates with your TODO.md to provide comprehensive project task management.

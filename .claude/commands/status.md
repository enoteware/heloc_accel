# Project Status Command

Show recent development activity including git commits and build status.

## What This Command Does

1. **Recent Git Activity**
   - Show last 10 commits with dates and messages
   - Display current branch and any uncommitted changes
   - Highlight any merge conflicts or issues

2. **Build Log Summary**
   - Check BUILD_LOG.md for recent build issues
   - Show any critical warnings or errors
   - Display last successful build information

3. **Current State**
   - Git status (staged, modified, untracked files)
   - Active branch and remote tracking status
   - Any pending work or drafts

## Implementation

```bash
# Show recent commits
echo "=== Recent Git Activity ==="
git log --oneline -10 --decorate --graph

echo -e "\n=== Current Git Status ==="
git status --short --branch

echo -e "\n=== Build Log Summary ==="
if [ -f "BUILD_LOG.md" ]; then
  echo "Last 10 lines from BUILD_LOG.md:"
  tail -10 BUILD_LOG.md
else
  echo "No BUILD_LOG.md found"
fi

echo -e "\n=== Quick Health Check ==="
echo "Branch: $(git branch --show-current)"
echo "Last commit: $(git log -1 --format='%h - %s (%cr)')"
echo "Uncommitted files: $(git status --porcelain | wc -l | tr -d ' ')"
```

Use this to quickly understand what's been happening in the project lately.

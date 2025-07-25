# Quick Commit

Fast commit and push to main branch with auto-generated message.

## Usage

```bash
git add . && git commit -m "Update: $(date +%Y-%m-%d)" && git push origin main
```

## Alternative Messages

**With time:**
```bash
git add . && git commit -m "Update: $(date '+%Y-%m-%d %H:%M')" && git push origin main
```

**With file count:**
```bash
git add . && git commit -m "Update $(git diff --cached --name-only | wc -l) files" && git push origin main
```

**Simple update:**
```bash
git add . && git commit -m "Quick update" && git push origin main
```

## Create Alias (Optional)

Add to your `.bashrc` or `.zshrc`:
```bash
alias qc='git add . && git commit -m "Update: $(date +%Y-%m-%d)" && git push origin main'
```

Then just type `qc` to quick commit.
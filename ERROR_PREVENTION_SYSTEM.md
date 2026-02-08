# 🛡️ ERROR PREVENTION SYSTEM

## Session Startup Checklist (MANDATORY)

Before any work, run:
```bash
# 1. Verify branch
git status                    # Must show "claude/fix-cover-art-gTLvb"

# 2. Verify no uncommitted changes
git status                    # Must show "working tree clean"

# 3. Verify build works
npm run build                 # Must complete successfully

# 4. Read memory
cat /root/.claude/projects/-home-user-gameshop/memory/MEMORY.md
```

---

## Critical Error Prevention (15-Point Checklist)

### Git Safety
- ❌ NEVER: `git add -A` or `git add .`
- ✅ ALWAYS: Use specific files: `git add src/components/...`
- ❌ NEVER: Commit to main/master
- ✅ ALWAYS: Verify branch with `git branch | grep \*`
- ❌ NEVER: Use --force push
- ✅ ALWAYS: Use `-u` flag: `git push -u origin`

### Code Safety
- ❌ NEVER: Skip build validation
- ✅ ALWAYS: Run `npm run build` after changes
- ❌ NEVER: Commit without testing
- ✅ ALWAYS: Review `git diff` before commit
- ❌ NEVER: Edit without reading first
- ✅ ALWAYS: Use Read tool before Edit

### Image Safety
- ❌ NEVER: Add NTSC/US versions
- ✅ ALWAYS: Use PAL/EUR versions only
- ❌ NEVER: Add <20KB images (too compressed)
- ✅ ALWAYS: Verify 25-70KB for games, 7-15KB for accessories
- ❌ NEVER: Use fan art or screenshots
- ✅ ALWAYS: Use professional boxart only

### Data Safety
- ❌ NEVER: Edit products.json without validating
- ✅ ALWAYS: Validate JSON: `jq . src/data/products.json`
- ❌ NEVER: Include .env or secrets in commits
- ✅ ALWAYS: Review git log before pulling

---

## Common Errors & Recovery

### Error 1: Wrong Branch
```bash
# Problem: You're not on claude/fix-cover-art-gTLvb
# Fix:
git checkout claude/fix-cover-art-gTLvb
```

### Error 2: Build Fails
```bash
# Problem: npm run build returns errors
# Fix:
npm run build 2>&1 | grep -A 5 "error"    # Find error
# Fix the issue
npm run build                              # Retry
```

### Error 3: JSON Invalid
```bash
# Problem: products.json has syntax errors
# Fix:
jq . src/data/products.json                # Shows error line
# Fix the syntax
npm run build                              # Retry
```

### Error 4: Images Too Small
```bash
# Problem: Added images < 20KB (compressed/damaged)
# Fix:
ls -lh public/images/products/*.webp | awk '$5 ~ /[0-9]K/ && $5 < 20K'
# Delete these files
# Re-download from PriceCharting with better quality
```

### Error 5: Uncommitted Changes
```bash
# Problem: git status shows modifications
# Fix:
git add [SPECIFIC FILES]
git commit -m "Description..."
git push -u origin claude/fix-cover-art-gTLvb
```

### Error 6: Accidental git add -A
```bash
# Problem: You did git add -A and now secret files are staged
# Fix (BEFORE commit):
git reset HEAD                             # Unstage everything
git add [SPECIFIC SAFE FILES]              # Add only what you need
git commit -m "Fix..."
```

### Error 7: Build Time Exceeded
```bash
# Problem: Build takes > 2 minutes
# Fix:
npm run build 2>&1 | grep "Generating"   # See progress
# If hangs, stop with Ctrl+C and debug
npm run prebuild                           # Just validate images
```

---

## Verification Procedures

### Before Committing
```bash
# 1. Status check
git status                          # Should be: "working tree clean" or "1 file changed"

# 2. Diff review
git diff src/                       # Review ALL changes

# 3. Build test
npm run build                       # Must succeed

# 4. Specific file check
jq . src/data/products.json         # If JSON changed
ls -lh public/images/products/*.webp | wc -l  # If images added
```

### After Committing
```bash
# 1. Verify commit
git log --oneline -1                # See your commit

# 2. Verify push
git status                          # Should show "Your branch is ahead..."

# 3. Verify remote
git log --oneline origin/claude/fix-cover-art-gTLvb -3  # See remote commits
```

---

## Workflow Template (Copy This)

For EVERY change:

```
1. READ
   - The file you'll change
   - Related documentation

2. PLAN
   - What will I change?
   - What could break?
   - How will I test?

3. VERIFY BRANCH
   git status  # Must be claude/fix-cover-art-gTLvb

4. CHANGE
   - Use Edit tool (not Bash sed/awk)
   - Make small, focused changes
   - Keep commits atomic

5. BUILD TEST
   npm run build  # MUST succeed

6. GIT REVIEW
   git diff          # Review changes
   git status        # Verify files

7. COMMIT
   git add [files]
   git commit -m "Dutch message..."
   git push -u origin claude/fix-cover-art-gTLvb

8. UPDATE MEMORY
   - Add learnings to MEMORY.md
   - Update success metrics
```

---

## Success Indicators

### Per Session: Should see ✅
- Build passes: `npm run build` = SUCCESS
- Commits made: 1-3 focused commits
- No errors: Error count = 0
- Warnings OK: In-progress images are acceptable

### Ongoing: Should see ✅
- Image coverage: >= 754 products (89.1%)
- Build time: < 120 seconds
- Branch clean: `git status` = "working tree clean"
- Latest commit: Within last session

---

## Quick Reference

### Must Know Commands
```bash
git status                    # Current state
git diff                      # Review changes
npm run build                 # Full build + validation
npm run prebuild              # Just image validation
jq . src/data/products.json   # Validate JSON
git log --oneline -5          # Recent commits
git reset HEAD~1              # Undo last commit (if not pushed)
```

### Must Know Paths
```
src/data/products.json        # Product data (source of truth)
public/images/products/       # Cover art images
src/components/               # React components
scripts/validate-images.mjs   # Build validation
MEMORY.md                     # This project's context
CLAUDE.md                     # Project rules
```

### Must Know Sizes
```
Games:       25-70KB (ideal)
Consoles:    7-15KB (ideal)
Accessories: 7-15KB (ideal)
Too small:   <20KB (REJECT)
Too large:   >100KB (REJECT)
```

---

## When Everything Breaks

### Nuclear Option (Last Resort)
```bash
git reset --hard origin/claude/fix-cover-art-gTLvb
npm install
npm run build
```

### Or Just Ask for Help
If you can't fix it and the nuclear option doesn't work:
1. Don't panic - nothing is permanently lost
2. Capture error message
3. Git reset if needed
4. Start fresh with next session

---

**REMEMBER: This checklist prevents 99% of errors. Use it.**

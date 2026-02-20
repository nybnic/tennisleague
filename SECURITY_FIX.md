# 🔒 Security Fix Guide - Exposed API Keys in Git

## Status: KEYS EXPOSED IN GIT HISTORY ⚠️

Your `.env` file with Supabase API keys was committed to git on:
- **Feb 18, 2026** - "supabase url and api key"
- **Feb 15-18, 2026** - Multiple commits containing keys

---

## ✅ What You Need to Do

### PRIORITY 1: Rotate Your API Keys (15 minutes)

This is the **most important step**. Even though these are "public" anonymous keys, they should be rotated as a precaution.

#### For Main Supabase Project:
1. Go to https://app.supabase.com
2. Select your main project (not the auth one)
3. Go to **Settings → API** at the bottom
4. Click the eye icon next to "Anonymous/Public"
5. Click **Rotate** → confirm
6. Copy the new key
7. Update `.env.local`:
   ```
   VITE_SUPABASE_ANON_KEY=<new-key-here>
   ```

#### For Auth Supabase Project:
1. Go to https://app.supabase.com
2. Select your Auth project
3. Go to **Settings → API** at the bottom
4. Click the eye icon next to "Anonymous/Public"
5. Click **Rotate** → confirm
6.  Copy the new key
7. Update `.env.local.auth`:
   ```
   VITE_SUPABASE_ANON_KEY_AUTH=<new-key-here>
   ```

### PRIORITY 2: Remove Keys from Git History

Once you've rotated the keys, remove them from git history using `git filter-branch`:

#### Option A: Using Command Line (Recommended)
```powershell
cd c:\Users\nicon\Documents\tennisleague

# Remove .env file from entire history
git filter-branch --tree-filter 'rm -f .env' -- --all

# Force push to remote (WARNING: This rewrites history)
git push origin --force --all

# Prune old objects
git reflog expire --expire=now --all
git gc --aggressive --prune=now
```

#### Option B: Using BFG Repo-Cleaner (Easier, Recommended)
```powershell
# Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
# Then run:
bfg --delete-files .env /path/to/repo
bfg --delete-files .env.local /path/to/repo
bfg --delete-files .env.local.auth /path/to/repo

git reflog expire --expire=now --all
git gc --aggressive --prune=now
git push origin --force --all
```

### PRIORITY 3: Update Your Workflow

Change `.gitignore` ✅ (Already done)

Now use **only `.env.local` and `.env.local.auth`** files. These are automatically ignored and never committed.

**To set up for next time:**
1. Copy `.env.example` to `.env.local`
2. Edit `.env.local` with your actual keys
3. Copy `.env.example` to `.env.local.auth`
4. Edit `.env.local.auth` with your auth keys
5. Never commit them (they're in `.gitignore` now)

---

## 📋 Checklist

- [ ] Rotated both Supabase anonymous keys
- [ ] Removed `.env` from git history
- [ ] Force pushed to remote
- [ ] Verified `.gitignore` updated
- [ ] Created `.env.local` with new keys
- [ ] Created `.env.local.auth` with new keys
- [ ] Tested that app still works
- [ ] Verified old commits don't show keys (GitHub → view file history)

---

## 🛡️ What Made This Happen & How to Prevent

**Why this is risky:**
- Anonymous API keys in git history are discoverable by anyone
- Attackers can enumerate your Supabase projects
- However, RLS policies should prevent unauthorized data access

**How to prevent in future:**
- Always use `.env.local` and `.env.local.auth` (not `.env`)
- Add to `.gitignore` **before** first commit
- Use IDE secrets tools (VS Code Secrets) for development
- Install `git-secrets` hook to prevent accidental commits

```powershell
# Add git-secrets hook
npm install --save-dev git-secrets
git secrets --install
git secrets --register-aws  # or your own patterns
```

---

## 📚 Environment File Structure

### Use This Structure:

❌ **WRONG (committed to git):**
```
.env  ← DO NOT CREATE
.env.local  ← OK but not for secrets normally
```

✅ **RIGHT (never committed):**
```
.env.example  ← Template, safe to commit
.env.local  ← Your actual secrets, ignored
.env.local.auth  ← Your auth secrets, ignored
```

---

## 🔍 How to Verify Fix

After rotating keys and cleaning history:

1. **Check git history:**
   ```powershell
   git log -p -- .env | grep "VITE_SUPABASE_ANON_KEY"
   ```
   Should return: `(no output)`

2. **Check GitHub:**
   - Go to GitHub repo → Code tab
   - Press `y` to view file history
   - Try to find `.env` file
   - Should not exist in recent commits

3. **Check local files:**
   ```powershell
   git status
   # .env and .env.local should show as "ignored"
   # (not listed in untracked files)
   ```

---

## ⚠️ Important Notes

- The anonymous keys are somewhat less dangerous than SECRET keys
- But they should still be rotated as a precaution
- Git history rewriting is permanent and requires force push
- If you have collaborators, coordinate before force pushing
- After force push, they need to `git pull --force`

---

## Need Help?

If you get stuck, the most important steps are:
1. **Rotate the keys now** (takes 2 min per project)
2. Move `.env` to `.env.local` 
3. Add `.env` to `.gitignore`

The git history cleanup can be done later if needed.

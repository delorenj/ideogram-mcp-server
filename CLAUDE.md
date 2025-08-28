# 🚨 CRITICAL PROJECT CONFIGURATION

## ⚠️ THIS PROJECT USES PNPM - NEVER USE NPM

**MANDATORY**: All package management MUST use `pnpm`:

```bash
✅ CORRECT: pnpm install
✅ CORRECT: pnpm run dev  
✅ CORRECT: pnpm run build
✅ CORRECT: pnpm test

❌ WRONG: npm install
❌ WRONG: npm run dev
❌ WRONG: npm run build  
❌ WRONG: npm test
```

## Evidence of pnpm Usage:
- ✅ `pnpm-lock.yaml` file exists
- ✅ `package.json` has `"packageManager": "pnpm@8.0.0"`
- ✅ `package.json` engines specifies pnpm
- ✅ `.npmrc` contains engine-strict=true
- ✅ `preinstall` script checks for pnpm usage
- ✅ User repeatedly mentions pnpm usage

## Why This Matters:
- Different dependency resolution than npm
- Performance optimizations specific to pnpm
- Project configured for pnpm's symlinking approach
- npm will break the intended dependency structure

**NEVER IGNORE THIS - ALWAYS USE PNPM FOR THIS PROJECT**

---

# Claude Code Configuration - SPARC Development Environment (Batchtools Optimized)

[Rest of existing CLAUDE.md content...]
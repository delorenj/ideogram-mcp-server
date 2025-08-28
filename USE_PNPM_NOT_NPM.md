# 🚨 CRITICAL: THIS PROJECT USES PNPM

## ✅ CORRECT COMMANDS:
```bash
pnpm install
pnpm run dev
pnpm run build
pnpm test
```

## ❌ NEVER USE:
```bash
npm install  # DON'T USE THIS
npm run dev  # DON'T USE THIS
```

## Why pnpm?
- Faster installs
- Disk space efficient
- Strict dependency resolution
- Better monorepo support

## Files that indicate pnpm usage:
- ✅ `pnpm-lock.yaml` exists
- ✅ `.npmrc` with engine-strict
- ✅ `package.json` uses `pnpm run build` in prepare script
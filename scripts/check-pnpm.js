#!/usr/bin/env node

// Check if pnpm is being used
if (!process.env.npm_config_user_agent?.startsWith('pnpm/')) {
  console.error('\n🚨 ERROR: This project uses pnpm, not npm!');
  console.error('\n✅ Use: pnpm install');
  console.error('❌ NOT: npm install\n');
  process.exit(1);
}

console.log('✅ Using pnpm correctly!');
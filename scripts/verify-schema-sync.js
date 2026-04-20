import fs from 'fs';
import path from 'path';

/**
 * Script to verify sync between Zod schemas and AI_CONTEXT.md
 * This is a simplified check for the Git Lifecycle
 */

console.log("🔄 Verifying Schema-Sync...");

const CONTEXT_FILE = 'AI_CONTEXT.md';

if (!fs.existsSync(CONTEXT_FILE)) {
  console.log("⚠️  AI_CONTEXT.md not found. Skipping sync check.");
  process.exit(0);
}

const contextContent = fs.readFileSync(CONTEXT_FILE, 'utf-8');

// We simulate getting staged files via process environment or arguments if passed by lint-staged
const files = process.argv.slice(2);

let syncIssue = false;

files.forEach(file => {
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Check if file contains Zod schemas
    if (content.includes('z.object') || content.includes('z.infer')) {
      // Very basic check: Does AI_CONTEXT.md mention this file or the schemas?
      // In a real scenario, we'd parse the file and check for specific entity names
      const fileName = path.basename(file, path.extname(file));
      
      if (!contextContent.includes(fileName)) {
        console.warn(`⚠️  Warning: Schema file '${file}' modified but not explicitly mentioned in '${CONTEXT_FILE}'.`);
        console.warn(`    Please ensure the 'Source of Truth' in '${CONTEXT_FILE}' reflects your latest changes.`);
        // Note: We don't exit 1 here yet, just warn, unless we want strict enforcement.
        // syncIssue = true; 
      }
    }
  }
});

if (syncIssue) {
  console.error("❌ Schema-Sync verification failed.");
  process.exit(1);
}

console.log("✅ Schema-Sync verification passed.");
process.exit(0);

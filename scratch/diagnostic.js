const fs = require('fs');
const path = require('path');

const checkFiles = (dir, extensions) => {
  let results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        results = results.concat(checkFiles(fullPath, extensions));
      }
    } else if (extensions.includes(path.extname(file))) {
      results.push(fullPath);
    }
  }
  return results;
};

const main = () => {
  console.log('Starting Diagnostic...');
  const tsFiles = checkFiles(process.cwd(), ['.ts', '.tsx']);
  console.log(`Found ${tsFiles.length} source files.`);

  let errors = 0;
  tsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    if (content.includes('your_gemini_api_key_here')) {
      console.warn(`[SECURITY] Potential hardcoded placeholder in ${file}`);
      errors++;
    }
    
    if (file.includes('page.tsx') && content.includes('saveConversation') && !content.includes('firestoreService')) {
       if (!file.includes('lib/db.ts')) {
         console.warn(`[REFACTOR] Potential direct DB call instead of service in ${file}`);
       }
    }
    
    // Check for broken imports or common mistakes
    if (content.includes('from "next/navigation"') && content.includes('useRouter') && content.includes('next/router')) {
      console.error(`[NEXTJS] Conflicting router imports in ${file}`);
      errors++;
    }
  });

  console.log(`Diagnostic complete. Issues found: ${errors}`);
};

main();

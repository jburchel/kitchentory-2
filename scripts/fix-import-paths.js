#!/usr/bin/env node

/**
 * Import Path Standardization Script
 * Converts inconsistent import paths to use @/ alias consistently
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Import patterns to fix
const REPLACEMENTS = [
  {
    pattern: /from ['"]src\//g,
    replacement: 'from "@/',
    description: 'Replace src/ imports with @/ alias'
  },
  {
    pattern: /import\s+(['"])src\//g,
    replacement: 'import $1@/',
    description: 'Replace src/ imports in import statements'
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/([^'"]+)['"]/g,
    replacement: 'from "@/$1"',
    description: 'Replace deep relative imports with @/ alias'
  }
];

class ImportPathFixer {
  constructor() {
    this.filesProcessed = 0;
    this.changesApplied = 0;
    this.errors = [];
  }

  /**
   * Get all TypeScript/JavaScript files recursively
   */
  getAllFiles(dir, files = []) {
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.getAllFiles(fullPath, files);
      } else if (EXTENSIONS.some(ext => entry.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      let content = originalContent;
      let fileChanges = 0;

      // Apply each replacement pattern
      for (const { pattern, replacement, description } of REPLACEMENTS) {
        const beforeReplace = content;
        content = content.replace(pattern, replacement);
        
        if (content !== beforeReplace) {
          fileChanges++;
          console.log(`  ✓ ${description}`);
        }
      }

      // Write file if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.changesApplied += fileChanges;
        console.log(`📝 Updated: ${path.relative(process.cwd(), filePath)} (${fileChanges} changes)`);
      }

      this.filesProcessed++;
    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      console.error(`❌ Error processing ${filePath}: ${error.message}`);
    }
  }

  /**
   * Validate TypeScript compilation after changes
   */
  validateTypeScript() {
    console.log('\n🔍 Validating TypeScript compilation...');
    try {
      execSync('npm run type-check', { stdio: 'inherit', cwd: path.dirname(SRC_DIR) });
      console.log('✅ TypeScript validation passed');
      return true;
    } catch (error) {
      console.error('❌ TypeScript validation failed');
      return false;
    }
  }

  /**
   * Run the import path fixing process
   */
  run() {
    console.log('🚀 Starting import path standardization...\n');
    
    // Get all files to process
    const files = this.getAllFiles(SRC_DIR);
    console.log(`📁 Found ${files.length} files to process\n`);

    // Process each file
    for (const file of files) {
      console.log(`\n📄 Processing: ${path.relative(process.cwd(), file)}`);
      this.processFile(file);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 IMPORT PATH STANDARDIZATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Files processed: ${this.filesProcessed}`);
    console.log(`Changes applied: ${this.changesApplied}`);
    console.log(`Errors: ${this.errors.length}`);

    if (this.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.errors.forEach(({ file, error }) => {
        console.log(`  - ${file}: ${error}`);
      });
    }

    // Validate compilation
    const isValid = this.validateTypeScript();
    
    if (isValid && this.errors.length === 0) {
      console.log('\n🎉 Import path standardization completed successfully!');
      console.log('\nNext steps:');
      console.log('1. Run: npm run build');
      console.log('2. Run: npm run test');
      console.log('3. Run: npm run lint');
    } else {
      console.log('\n⚠️  Please review and fix any errors before proceeding.');
    }
  }
}

// Run the script
if (require.main === module) {
  const fixer = new ImportPathFixer();
  fixer.run();
}

module.exports = ImportPathFixer;
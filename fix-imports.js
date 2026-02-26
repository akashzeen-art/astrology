#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const uiComponentsDir = path.join(__dirname, "src", "components", "ui");

// Get all .tsx files in the UI components directory
function getAllTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isFile() && item.endsWith(".tsx")) {
      files.push(fullPath);
    }
  });

  return files;
}

// Fix import in a single file
function fixImportInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Replace @/lib/utils imports with ./utils
    if (content.includes("@/lib/utils")) {
      const originalContent = content;
      content = content.replace(
        /import\s*{\s*cn\s*}\s*from\s*["']@\/lib\/utils["'];?/g,
        'import { cn } from "./utils";',
      );

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`✅ Fixed: ${path.basename(filePath)}`);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Main function
function main() {
  console.log("🔧 Fixing UI component imports...\n");

  // Check if utils file exists in UI directory
  const utilsPath = path.join(uiComponentsDir, "utils.ts");
  if (!fs.existsSync(utilsPath)) {
    console.error("❌ utils.ts not found in UI components directory");
    return;
  }

  console.log("✅ Found utils.ts in UI components directory");

  // Get all .tsx files
  const tsxFiles = getAllTsxFiles(uiComponentsDir);
  console.log(`📁 Found ${tsxFiles.length} .tsx files\n`);

  let fixedCount = 0;

  // Fix each file
  tsxFiles.forEach((filePath) => {
    if (fixImportInFile(filePath)) {
      fixedCount++;
    }
  });

  console.log(`\n🎉 Fixed ${fixedCount} files successfully!`);

  if (fixedCount > 0) {
    console.log("\n💡 Restart your dev server to see the changes.");
  }
}

// Run the script
main();

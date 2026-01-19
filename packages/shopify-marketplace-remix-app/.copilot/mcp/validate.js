#!/usr/bin/env node

/**
 * MCP Configuration Validator
 * Validates the MCP configuration files for the Shopify marketplace repository
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_DIR = __dirname;
const REQUIRED_FILES = [
  'copilot-config.json',
  'tools-config.json', 
  'patterns.json',
  'quick-reference.json',
  'troubleshooting.json',
  'index.json',
  'README.md'
];

function validateJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function validateFile(fileName) {
  const filePath = path.join(CONFIG_DIR, fileName);
  
  if (!fs.existsSync(filePath)) {
    return { exists: false };
  }
  
  if (fileName.endsWith('.json')) {
    return { exists: true, ...validateJSON(filePath) };
  } else {
    return { exists: true, valid: true };
  }
}

function main() {
  console.log('🔍 Validating MCP Configuration...\n');
  
  let allValid = true;
  
  for (const fileName of REQUIRED_FILES) {
    const result = validateFile(fileName);
    
    if (!result.exists) {
      console.log(`❌ ${fileName} - Missing`);
      allValid = false;
    } else if (!result.valid) {
      console.log(`❌ ${fileName} - Invalid: ${result.error}`);
      allValid = false;
    } else {
      console.log(`✅ ${fileName} - OK`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (allValid) {
    console.log('✅ All MCP configuration files are valid!');
    process.exit(0);
  } else {
    console.log('❌ Some configuration files have issues.');
    process.exit(1);
  }
}

main();
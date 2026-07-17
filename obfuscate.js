#!/usr/bin/env node
/**
 * obfuscate.js — Obfuscate all public-facing JavaScript files
 * Run: node obfuscate.js
 * This reads from server/public/src/ and writes obfuscated output to server/public/
 * 
 * WORKFLOW:
 *   1. Edit source files in server/public/src/
 *   2. Run `node obfuscate.js` to produce obfuscated output
 *   3. Restart the server
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'server/public/src');
const OUT_DIR = path.join(__dirname, 'server/public');

const OBFUSCATOR_FLAGS = [
    '--compact true',
    '--control-flow-flattening false',
    '--dead-code-injection false',
    '--identifier-names-generator hexadecimal',
    '--rename-globals false',
    '--self-defending false',
    '--string-array true',
    '--string-array-encoding rc4',
    '--string-array-threshold 0.75',
    '--transform-object-keys true',
].join(' ');

// If src/ directory doesn't exist yet, just obfuscate in-place
const targets = fs.existsSync(SRC_DIR)
    ? fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.js')).map(f => ({
        input: path.join(SRC_DIR, f),
        output: path.join(OUT_DIR, f)
    }))
    : fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.js')).map(f => ({
        input: path.join(OUT_DIR, f),
        output: path.join(OUT_DIR, f)
    }));

if (targets.length === 0) {
    console.log('No .js files found to obfuscate.');
    process.exit(0);
}

for (const { input, output } of targets) {
    const filename = path.basename(input);
    console.log(`🔒 Obfuscating ${filename}...`);
    try {
        execSync(
            `npx javascript-obfuscator "${input}" --output "${output}" ${OBFUSCATOR_FLAGS}`,
            { stdio: 'inherit', cwd: __dirname }
        );
        console.log(`   ✅ ${filename} → ${path.relative(__dirname, output)}`);
    } catch (e) {
        console.error(`   <:no:1526496561188831244>Failed to obfuscate ${filename}:`, e.message);
        process.exit(1);
    }
}

console.log('\n✅ All files obfuscated successfully. Restart the server to apply.');

#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend');
const PUBLIC_DIR = path.join(__dirname, 'server/public');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');

console.log('📦 Starting frontend Vite build pipeline...');

// 1. Append window mappings to frontend JS source files if they don't exist
const dashboardPath = path.join(FRONTEND_DIR, 'dashboard.js');
const developerPath = path.join(FRONTEND_DIR, 'developer.js');

const dashBindings = `
;if (typeof window !== 'undefined') {
    window.switchTab = typeof switchTab !== 'undefined' ? switchTab : undefined;
    window.saveRooms = typeof saveRooms !== 'undefined' ? saveRooms : undefined;
    window.saveWelcomeSettings = typeof saveWelcomeSettings !== 'undefined' ? saveWelcomeSettings : undefined;
    window.saveAutoMod = typeof saveAutoMod !== 'undefined' ? saveAutoMod : undefined;
    window.saveEconomy = typeof saveEconomy !== 'undefined' ? saveEconomy : undefined;
    window.launchGiveaway = typeof launchGiveaway !== 'undefined' ? launchGiveaway : undefined;
    window.addCustomCommand = typeof addCustomCommand !== 'undefined' ? addCustomCommand : undefined;
    window.deleteCustomCommand = typeof deleteCustomCommand !== 'undefined' ? deleteCustomCommand : undefined;
    window.addShopItem = typeof addShopItem !== 'undefined' ? addShopItem : undefined;
    window.removeShopItem = typeof removeShopItem !== 'undefined' ? removeShopItem : undefined;
    window.deleteApiKey = typeof deleteApiKey !== 'undefined' ? deleteApiKey : undefined;
    window.generateApiKey = typeof generateApiKey !== 'undefined' ? generateApiKey : undefined;
    window.saveWarn = typeof saveWarn !== 'undefined' ? saveWarn : undefined;
    window.saveJail = typeof saveJail !== 'undefined' ? saveJail : undefined;
    window.saveMute = typeof saveMute !== 'undefined' ? saveMute : undefined;
    window.saveVerification = typeof saveVerification !== 'undefined' ? saveVerification : undefined;
    window.saveAntiLink = typeof saveAntiLink !== 'undefined' ? saveAntiLink : undefined;
    window.saveApply = typeof saveApply !== 'undefined' ? saveApply : undefined;
    window.saveAutoRole = typeof saveAutoRole !== 'undefined' ? saveAutoRole : undefined;
    window.saveAntiBot = typeof saveAntiBot !== 'undefined' ? saveAntiBot : undefined;
    window.saveAntiWebhook = typeof saveAntiWebhook !== 'undefined' ? saveAntiWebhook : undefined;
    window.saveLogs = typeof saveLogs !== 'undefined' ? saveLogs : undefined;
    window.updateLivePreview = typeof updateLivePreview !== 'undefined' ? updateLivePreview : undefined;
    window.saveGuildSettings = typeof saveGuildSettings !== 'undefined' ? saveGuildSettings : undefined;
    window.saveSecuritySettings = typeof saveSecuritySettings !== 'undefined' ? saveSecuritySettings : undefined;
    window.saveRaidSettings = typeof saveRaidSettings !== 'undefined' ? saveRaidSettings : undefined;
    window.createBackup = typeof createBackup !== 'undefined' ? createBackup : undefined;
    window.restoreBackup = typeof restoreBackup !== 'undefined' ? restoreBackup : undefined;
    window.deleteBackup = typeof deleteBackup !== 'undefined' ? deleteBackup : undefined;
    window.addWhitelistEntity = typeof addWhitelistEntity !== 'undefined' ? addWhitelistEntity : undefined;
    window.deleteWhitelistEntity = typeof deleteWhitelistEntity !== 'undefined' ? deleteWhitelistEntity : undefined;
}
`;

const devBindings = `
;if (typeof window !== 'undefined') {
    window.switchTab = typeof switchTab !== 'undefined' ? switchTab : undefined;
    window.loadServersList = typeof loadServersList !== 'undefined' ? loadServersList : undefined;
    window.lookupUser = typeof lookupUser !== 'undefined' ? lookupUser : undefined;
    window.grantPremium = typeof grantPremium !== 'undefined' ? grantPremium : undefined;
    window.sendBroadcast = typeof sendBroadcast !== 'undefined' ? sendBroadcast : undefined;
    window.clearErrorLogs = typeof clearErrorLogs !== 'undefined' ? clearErrorLogs : undefined;
    window.confirmBotAction = typeof confirmBotAction !== 'undefined' ? confirmBotAction : undefined;
    window.toggleMaintenance = typeof toggleMaintenance !== 'undefined' ? toggleMaintenance : undefined;
    window.saveSettings = typeof saveSettings !== 'undefined' ? saveSettings : undefined;
    window.filterNotes = typeof filterNotes !== 'undefined' ? filterNotes : undefined;
    window.openCreateNoteModal = typeof openCreateNoteModal !== 'undefined' ? openCreateNoteModal : undefined;
    window.closeConfirmModal = typeof closeConfirmModal !== 'undefined' ? closeConfirmModal : undefined;
    window.closeNoteModal = typeof closeNoteModal !== 'undefined' ? closeNoteModal : undefined;
    window.saveNote = typeof saveNote !== 'undefined' ? saveNote : undefined;
}
`;

let origDash = '';
let origDev = '';

if (fs.existsSync(dashboardPath)) {
    origDash = fs.readFileSync(dashboardPath, 'utf8');
    if (!origDash.includes('window.switchTab = typeof switchTab')) {
        fs.appendFileSync(dashboardPath, dashBindings, 'utf8');
        console.log('🔗 Injected window bindings into frontend/dashboard.js');
    }
}

if (fs.existsSync(developerPath)) {
    origDev = fs.readFileSync(developerPath, 'utf8');
    if (!origDev.includes('window.switchTab = typeof switchTab')) {
        fs.appendFileSync(developerPath, devBindings, 'utf8');
        console.log('🔗 Injected window bindings into frontend/developer.js');
    }
}

// 2. Run Vite build
try {
    console.log('⚡ Running Vite build...');
    execSync('npx vite build', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Vite build completed successfully.');
} catch (err) {
    console.error('❌ Vite build failed:', err.message);
    // Restore files before exiting
    restoreOriginalFiles();
    process.exit(1);
}

// Restore original files so the source remains clean
restoreOriginalFiles();

function restoreOriginalFiles() {
    if (origDash && fs.existsSync(dashboardPath)) {
        fs.writeFileSync(dashboardPath, origDash, 'utf8');
        console.log('📋 Restored original frontend/dashboard.js source file.');
    }
    if (origDev && fs.existsSync(developerPath)) {
        fs.writeFileSync(developerPath, origDev, 'utf8');
        console.log('📋 Restored original frontend/developer.js source file.');
    }
}

// 3. Discover generated JS assets and obfuscate them in-place
if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`❌ Assets directory not found at: ${ASSETS_DIR}`);
    process.exit(1);
}

const jsFiles = fs.readdirSync(ASSETS_DIR)
    .filter(file => file.endsWith('.js'))
    .map(file => path.join(ASSETS_DIR, file));

if (jsFiles.length === 0) {
    console.warn('⚠️ No bundled JavaScript files found to obfuscate.');
    process.exit(0);
}

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

console.log(`🔒 Found ${jsFiles.length} JS asset bundle(s) for obfuscation.`);

for (const file of jsFiles) {
    const filename = path.basename(file);
    console.log(`🔒 Obfuscating ${filename}...`);
    try {
        execSync(
            `npx javascript-obfuscator "${file}" --output "${file}" ${OBFUSCATOR_FLAGS}`,
            { stdio: 'inherit', cwd: __dirname }
        );
        console.log(`   ✅ Obfuscated ${filename}`);
    } catch (e) {
        console.error(`   ❌ Failed to obfuscate ${filename}:`, e.message);
        process.exit(1);
    }
}

console.log('\n✨ Frontend Vite build & obfuscation pipeline finished successfully!');

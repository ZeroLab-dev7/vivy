const assert = require('assert');

try {
    console.log('Testing slashCommands/Admins Cmds/alias.js...');
    const aliasCmd = require('../slashCommands/Admins Cmds/alias.js');
    assert.ok(aliasCmd.data, 'Alias command should have a "data" property');
    assert.strictEqual(typeof aliasCmd.execute, 'function', 'Alias command should have an "execute" function');
    console.log('✅ alias.js loaded successfully and exported correctly!');

    console.log('Testing slashCommands/Admins Cmds/setup-profile.js...');
    const profileCmd = require('../slashCommands/Admins Cmds/setup-profile.js');
    assert.ok(profileCmd.data, 'Setup-profile command should have a "data" property');
    assert.strictEqual(typeof profileCmd.execute, 'function', 'Setup-profile command should have an "execute" function');
    console.log('✅ setup-profile.js loaded successfully and exported correctly!');

    console.log('All slash command registrations verified.');
} catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
}

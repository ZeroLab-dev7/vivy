const ADMINISTRATOR = 0x8n;
const MANAGE_GUILD = 0x20n;

function parsePermissions(raw) {
    try {
        const n = BigInt(raw || 0);
        const MAX_PERMS = (1n << 53n) - 1n;
        return n < 0n ? 0n : n > MAX_PERMS ? MAX_PERMS : n;
    } catch {
        return 0n;
    }
}

// Function to test matching checkGuildPermission logic
function evaluatePermission(guild, targetGuildId) {
    if (guild.id !== targetGuildId) return { success: false, reason: 'Access denied (Guild mismatch).' };
    
    const perms = parsePermissions(guild.permissions);
    const isAdmin = guild.owner === true || (perms & ADMINISTRATOR) === ADMINISTRATOR || (perms & MANAGE_GUILD) === MANAGE_GUILD;
    
    if (!isAdmin) return { success: false, reason: 'Manage Server permission required.' };
    return { success: true };
}

// Test cases
const tests = [
    {
        name: 'Server Owner (no perms set)',
        guild: { id: '123', owner: true, permissions: '0' },
        expected: true
    },
    {
        name: 'Administrator (no manage guild set)',
        guild: { id: '123', owner: false, permissions: String(ADMINISTRATOR) },
        expected: true
    },
    {
        name: 'Manage Guild User',
        guild: { id: '123', owner: false, permissions: String(MANAGE_GUILD) },
        expected: true
    },
    {
        name: 'Regular Member (no admin/manage perms)',
        guild: { id: '123', owner: false, permissions: '1048576' }, // random permissions
        expected: false
    },
    {
        name: 'Guild Mismatch',
        guild: { id: '456', owner: true, permissions: '0' },
        expected: false
    }
];

console.log('Starting Permission Logic Tests...\n');
let passed = 0;

for (const t of tests) {
    const res = evaluatePermission(t.guild, '123');
    const success = res.success === t.expected;
    console.log(`[${success ? 'PASS' : 'FAIL'}] ${t.name}: Got success=${res.success} (expected: ${t.expected})`);
    if (!res.success) console.log(`       Reason: ${res.reason}`);
    if (success) passed++;
}

console.log(`\nResult: ${passed}/${tests.length} tests passed.`);
process.exit(passed === tests.length ? 0 : 1);

const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

// Read owner ID from env — never hardcode
const BOT_OWNER_ID = process.env.BOT_OWNER_ID || '1218037013966491770';
const COOLDOWN_TIME = 5000;
const cooldowns = new Map();

// Extended blocklist — NOTE: This is not a security boundary, just UX protection.
// The eval command is OWNER-ONLY. The only real security is the owner ID check.
const BLOCKED = [
    'process.exit', 'process.kill', 'process.abort',
    'child_process', 'spawnSync', 'execSync', 'exec(',
    'spawn(', '__dirname', '__filename',
    'fs.unlink', 'fs.rm', 'fs.rmdir', 'fs.writeFile', 'fs.appendFile',
    'fs.rename', 'fs.truncate', 'fs.chmod', 'fs.chown',
    'require(\'fs\')', 'require("fs")', 'require(`fs`)',
    '.env', 'process.env',
    'setInterval', 'setTimeout',  // Prevent long-running loops
];

module.exports = {
    name: 'eval',
    aliases: ['ev'],
    description: 'Execute JavaScript code. (Bot Owner only — dangerous!)',
    async execute(message, args) {
        // ── Owner Guard ─────────────────────────────────────────────────────────
        if (message.author.id !== BOT_OWNER_ID) {
            return message.reply({
                components: [UI.createContainer({ description: '- 🔒 Only the **Bot Owner** can use this command.' })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // ── Cooldown ────────────────────────────────────────────────────────────
        if (cooldowns.has(message.author.id)) return message.react('⏳');
        cooldowns.set(message.author.id, true);
        setTimeout(() => cooldowns.delete(message.author.id), COOLDOWN_TIME);

        const code = args.join(' ');

        if (!code) {
            return message.reply({
                components: [UI.createContainer({ description: '- Provide code to evaluate. Usage: `eval <code>`' })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // ── Block dangerous patterns (additional UX guard on top of owner check) ─
        const blocked = BLOCKED.find(p => code.includes(p));
        if (blocked) {
            return message.reply({
                components: [UI.createContainer({
                    title: '🚫 Blocked Expression',
                    description: `- The expression \`${blocked}\` is not allowed.`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        let result;
        let isError = false;
        const startTime = Date.now();

        try {
            // Make these available in eval scope
            const client = message.client;  // eslint-disable-line no-unused-vars
            const guild = message.guild;    // eslint-disable-line no-unused-vars
            const channel = message.channel; // eslint-disable-line no-unused-vars

            result = await eval(code); // eslint-disable-line no-eval
        } catch (err) {
            result = err.message || String(err);
            isError = true;
        }

        const elapsed = Date.now() - startTime;

        // Stringify output
        let output = result;
        if (typeof result !== 'string') {
            try {
                const { inspect } = require('util');
                output = inspect(result, { depth: 2, maxArrayLength: 20 });
            } catch {
                output = String(result);
            }
        }

        // Redact sensitive values from output
        const sensitivePatterns = [
            message.client.token,
            process.env.OAUTH_CLIENT_SECRET,
            process.env.SESSION_SECRET,
            process.env.MONGO_DB,
        ].filter(Boolean);

        for (const secret of sensitivePatterns) {
            output = output.replace(new RegExp(secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '[REDACTED]');
        }

        // Truncate
        if (output.length > 1800) {
            output = output.slice(0, 1800) + '\n...(output truncated)';
        }

        return message.reply({
            components: [UI.createContainer({
                title: isError ? '<:no:1526496561188831244>Eval Error' : '✅ Eval Result',
                description: [
                    `**📥 Input:**`,
                    `\`\`\`js\n${code.slice(0, 500)}\n\`\`\``,
                    `**📤 Output:**`,
                    `\`\`\`js\n${output || 'undefined'}\n\`\`\``,
                    `- **Type:** \`${typeof result}\` | **Time:** \`${elapsed}ms\``
                ].join('\n')
            })],
            flags: MessageFlags.IsComponentsV2
        });
    }
};

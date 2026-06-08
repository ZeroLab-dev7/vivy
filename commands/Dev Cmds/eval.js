const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

const BOT_OWNER_ID = '1218034475775299688';
const COOLDOWN_TIME = 3000;
const cooldowns = new Map();

// Blocked keywords for safety
const BLOCKED = ['process.exit', 'require(', 'child_process', '__dirname', 'fs.', 'unlink', 'exec(', 'spawn('];

module.exports = {
    name: 'eval',
    aliases: ['ev', 'js'],
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

        // ── Block dangerous patterns ─────────────────────────────────────────────
        const blocked = BLOCKED.find(p => code.includes(p));
        if (blocked) {
            return message.reply({
                components: [UI.createContainer({
                    title: '🚫 Blocked Expression',
                    description: `- The expression \`${blocked}\` is not allowed for safety reasons.`
                })],
                flags: MessageFlags.IsComponentsV2
            });
        }

        let result;
        let isError = false;
        const startTime = Date.now();

        try {
            // Make these available in eval scope
            const client  = message.client;  // eslint-disable-line no-unused-vars
            const guild   = message.guild;   // eslint-disable-line no-unused-vars
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

        // Censor bot token
        const token = message.client.token;
        if (token) output = output.replace(new RegExp(token, 'g'), '[REDACTED]');

        // Truncate
        if (output.length > 1800) {
            output = output.slice(0, 1800) + '\n...(output truncated)';
        }

        return message.reply({
            components: [UI.createContainer({
                title: isError ? '❌ Eval Error' : '✅ Eval Result',
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

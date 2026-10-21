const { AiConfig } = require('../db/models');
const axios = require('axios');

class AiService {
    static async getOrCreateConfig(guildId) {
        let config = await AiConfig.findByPk(guildId);
        if (!config) {
            config = await AiConfig.create({ guild_id: guildId });
        }
        return config;
    }

    static async generateText(prompt, apiKey) {
        const key = apiKey || process.env.GEMINI_API_KEY;
        if (!key) return "⚠️ API Key not configured. Please set the Gemini API Key in the dashboard settings.";

        try {
            // Call Google Gemini API (standard endpoint)
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`,
                {
                    contents: [{ parts: [{ text: prompt }] }]
                },
                { headers: { 'Content-Type': 'application/json' } }
            );

            return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
        } catch (error) {
            console.error("AI Generation Error:", error.response?.data || error.message);
            return "<:no:1526496561188831244>Failed to communicate with the AI model. Please check the API key configuration.";
        }
    }

    static async checkSmartModeration(message) {
        const config = await this.getOrCreateConfig(message.guild.id);
        if (!config.smart_moderation || !config.api_key) return false;

        const prompt = `You are a Discord chat moderator. Check if the following message is highly toxic, abusive, or contains extreme hate speech. Answer ONLY with 'toxic' or 'safe'.\n\nMessage: "${message.content}"`;
        const result = await this.generateText(prompt, config.api_key);

        if (result.trim().toLowerCase().includes('toxic')) {
            await message.delete().catch(() => { });
            await message.channel.send(`⚠️ ${message.author}, your message was removed by Smart AI Moderation.`).then(m => setTimeout(() => m.delete().catch(() => { }), 5000));
            return true;
        }
        return false;
    }

    static async handleAutoReply(message) {
        const config = await this.getOrCreateConfig(message.guild.id);
        let rules = [];
        try {
            rules = JSON.parse(config.auto_reply_rules || '[]');
        } catch (e) { }

        const content = message.content.toLowerCase();
        for (const rule of rules) {
            if (rule.trigger && content.includes(rule.trigger.toLowerCase())) {
                await message.reply(rule.reply);
                return true;
            }
        }
        return false;
    }

    static async summarizeChannel(channel, limit = 50) {
        const messages = await channel.messages.fetch({ limit });
        const list = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        let chatText = "";
        list.forEach(msg => {
            if (!msg.author.bot) {
                chatText += `${msg.author.username}: ${msg.content}\n`;
            }
        });

        if (!chatText) return "No conversation history found to summarize.";

        const prompt = `Summarize the following Discord conversation in 3-5 bullet points focusing on the main topics discussed:\n\n${chatText}`;
        return await this.generateText(prompt);
    }
}

module.exports = AiService;

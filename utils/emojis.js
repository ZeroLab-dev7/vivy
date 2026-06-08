module.exports = {
    // Standard Navigation
    Nav: {
        back: "⬅️",
        next: "➡️",
        home: "🏠"
    },
    // Standard Status
    Status: {
        success: "✅",
        error: "❌",
        warning: "⚠️"
    },
    // Animated Custom Emojis (from scans)
    Anim: {
        warn: "<a:warn:1365688576758644797>",
        done: "<a:warn:1365688576758644797>"
    },
    // Static Custom Emojis (from scans)
    Static: {
        redlogo: "<a:warn:1365688576758644797>",
        warning: "<a:warn:1365688576758644797>"
    },
    /**
     * Helper to extract ID from a custom emoji string for ButtonBuilders
     * @param {string} emojiString e.g. "<:name:123456>"
     * @returns {string|null} "123456" or null
     */
    getId(emojiString) {
        if (!emojiString) return null;
        const match = emojiString.match(/:(?:[^:]+):(\d+)>/);
        return match ? match[1] : emojiString; // Return ID if matched, else return original (for unicode)
    }
};

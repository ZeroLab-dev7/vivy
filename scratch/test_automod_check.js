const AutoModService = require('../services/autoModService');
const { PermissionFlagsBits } = require('discord.js');

// Mock message
const mockMessage = {
    guild: { id: '1491234165901889629' },
    author: { bot: false, id: '1111111111' },
    client: { user: { id: 'bot_id' } },
    member: {
        id: '1111111111',
        user: { tag: 'User#0000' },
        permissions: {
            has: (perm) => {
                return false;
            }
        }
    },
    content: 'this is a test message containing zb bad word',
    reply: async (payload) => {
        console.log("REPLY CALLED WITH:", payload);
        return { delete: async () => { console.log("DELETED REPLY"); } };
    },
    delete: async () => {
        console.log("DELETED MESSAGE");
    }
};

async function test() {
    try {
        console.log("Testing automod check on mock message...");
        const result = await AutoModService.checkMessage(mockMessage);
        console.log("AutoMod check result:", result);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

test();

const { SystemConfig, CommandLog } = require('../db/models');

async function isDeveloper(userId, client) {
    try {
        const devGuildId = '1291865555753762907';
        const devRoleId = '1297545090168000604';
        
        let guild = client.guilds.cache.get(devGuildId);
        if (!guild) {
            guild = await client.guilds.fetch(devGuildId).catch(() => null);
        }
        if (!guild) return false;
        
        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member) return false;
        
        return member.roles.cache.has(devRoleId);
    } catch {
        return false;
    }
}

async function checkMaintenanceAndDisabled(commandName, userId, client) {
    // 1. Check Maintenance Mode
    const maintenanceConfig = await SystemConfig.findOne({ where: { key: 'maintenance_mode' } });
    const isMaintenance = maintenanceConfig?.value === 'true';
    
    if (isMaintenance) {
        const isDev = await isDeveloper(userId, client);
        if (!isDev) {
            const msgConfig = await SystemConfig.findOne({ where: { key: 'maintenance_message' } });
            const customMessage = msgConfig?.value || 'Vivy is currently undergoing maintenance.\nPlease try again later.';
            return { blocked: true, reason: 'maintenance', message: customMessage };
        }
    }
    
    // 2. Check Disabled Commands
    const disabledConfig = await SystemConfig.findOne({ where: { key: 'disabled_commands' } });
    let disabledCommands = [];
    try {
        disabledCommands = JSON.parse(disabledConfig?.value || '[]');
    } catch {}
    
    if (disabledCommands.includes(commandName.toLowerCase())) {
        return { blocked: true, reason: 'disabled' };
    }
    
    return { blocked: false };
}

async function logCommand(commandName, userId, guildId, type) {
    try {
        await CommandLog.create({
            command_name: commandName.toLowerCase(),
            user_id: userId,
            guild_id: guildId || null,
            type
        });
    } catch (err) {
        console.error('[DeveloperHelper] Failed to log command:', err);
    }
}

module.exports = {
    isDeveloper,
    checkMaintenanceAndDisabled,
    logCommand
};

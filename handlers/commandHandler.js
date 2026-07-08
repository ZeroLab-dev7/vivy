const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const config = require('../config');

module.exports = async (client) => {
    client.commands = new Map();
    client.slashCommands = new Map();
    const slashCommandsArray = [];

    // Load Prefix Commands
    const commandsPath = path.join(__dirname, '../commands');
    if (fs.existsSync(commandsPath)) {
        const commandFolders = fs.readdirSync(commandsPath);
        for (const folder of commandFolders) {
            const folderPath = path.join(commandsPath, folder);
            if (fs.statSync(folderPath).isDirectory()) {
                const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
                for (const file of commandFiles) {
                    const command = require(path.join(folderPath, file));
                    if (command.name) {
                        client.commands.set(command.name, command);
                    }
                }
            }
        }
    }

    // Load Slash Commands
    const slashPath = path.join(__dirname, '../slashCommands');
    if (fs.existsSync(slashPath)) {
        const slashFolders = fs.readdirSync(slashPath);
        for (const folder of slashFolders) {
            const folderPath = path.join(slashPath, folder);
            if (fs.statSync(folderPath).isDirectory()) {
                const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
                for (const file of commandFiles) {
                    const command = require(path.join(folderPath, file));
                    if (command.data) {
                        client.slashCommands.set(command.data.name, command);
                        slashCommandsArray.push(command.data.toJSON());
                    }
                }
            }
        }
    }

    console.log('Loaded commands:', Array.from(client.commands.keys()));
    console.log(`✅ Loaded ${client.commands.size} legacy commands.`);
    console.log(`✅ Loaded ${client.slashCommands.size} slash commands.`);

    // Register Slash Commands GLOBALLY
    const rest = new REST({ version: '10' }).setToken(config.token);
    try {
        console.log('Started refreshing global application (/) commands.');
        await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: slashCommandsArray },
        );
        console.log('✅ Successfully reloaded application (/) commands GLOBALLY.');
    } catch (error) {
        console.error('❌ Error registering global commands:', error);
    }
};

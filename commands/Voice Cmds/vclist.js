const { MessageFlags } = require('discord.js');
const UI = require('../../utils/ui');

module.exports = {
  name: 'vclist',
  aliases: ['vL'],
  description: 'Shows a list of users currently in your voice channel.',
  async execute(message) {
    // Ensure the user is in a voice channel
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply({
        components: [UI.createContainer({
          description: '- <a:warn:1365688576758644797> You must be in a voice channel to use this command.'
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // Get the list of users in the voice channel
    const members = voiceChannel.members;
    const memberMentions = members.map(member => `\`${member.user.username}\``).join('\n');

    // If no members are found
    if (!memberMentions) {
      return message.reply({
        components: [UI.createContainer({
          description: '- <a:warn:1365688576758644797> No other members are currently in this voice channel.'
        })],
        flags: MessageFlags.IsComponentsV2
      });
    }

    // Create and send the embed showing the users
    // Create and send the container showing the users
    const container = UI.createContainer({
      title: 'Users in Voice Channel',
      description: `- **Current Members in ${voiceChannel.name}:**\n${memberMentions}`
    });

    message.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  }
};

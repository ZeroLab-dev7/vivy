const Economy = require('../../db/models/Economy');
const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

module.exports = {
    name: 'top',
    aliases: ['lb', 'leaderboard'],
    description: 'Show economy leaderboard',
    async execute(message, args) {
        try {
            const allUsers = await Economy.findAll({
                where: { guild_id: message.guild.id }
            });

            // Sort by Total Net Worth
            const sortedUsers = allUsers.sort((a, b) => {
                const totalA = (a.balance || 0) + (a.bank || 0);
                const totalB = (b.balance || 0) + (b.bank || 0);
                return totalB - totalA;
            });

            const top10 = sortedUsers.slice(0, 10);
            if (top10.length === 0) return message.reply("No data found.");

            // Canvas Setup
            const canvasWidth = 700;
            const rowHeight = 80;
            const headerHeight = 0; // No header text, just list
            const canvasHeight = top10.length * rowHeight + 20;

            const canvas = createCanvas(canvasWidth, canvasHeight);
            const ctx = canvas.getContext('2d');

            // --- Fonts ---
            // If you had a custom font file, you would load it here. 
            // We'll use system fonts.
            ctx.font = 'bold 28px sans-serif';

            // --- Background ---
            // Dark background (Discord dark mode-ish but darker)
            ctx.fillStyle = '#0f1115';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // --- Draw Rows ---
            for (let i = 0; i < top10.length; i++) {
                const userEco = top10[i];
                const y = i * rowHeight + 10;
                const total = (userEco.balance || 0) + (userEco.bank || 0);

                // Fetch User Details
                let username = "Unknown User";
                let avatarUrl = "https://cdn.discordapp.com/embed/avatars/0.png"; // Default

                try {
                    const user = await message.client.users.fetch(userEco.user_id);
                    username = user.username.slice(0, 15); // Truncate name
                    avatarUrl = user.displayAvatarURL({ extension: 'png' });
                } catch (e) { }

                // -- Card Background --
                // Alternate slightly or just plain dark cards
                ctx.fillStyle = '#16191d'; // Card color
                ctx.beginPath();
                ctx.roundRect(10, y, canvasWidth - 20, rowHeight - 10, 15); // Rounded card
                ctx.fill();

                // -- Rank (Right Side) --
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'right';
                ctx.font = 'bold 32px sans-serif';

                let rankColor = '#ffffff';
                if (i === 0) rankColor = '#ffd700'; // Gold
                else if (i === 1) rankColor = '#c0c0c0'; // Silver
                else if (i === 2) rankColor = '#cd7f32'; // Bronze

                ctx.fillStyle = rankColor;
                ctx.fillText(`#${i + 1}`, canvasWidth - 30, y + 50);

                // -- Avatar (Left) --
                try {
                    const avatar = await loadImage(avatarUrl);
                    // Circle clipping
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(50, y + 35, 25, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(avatar, 25, y + 10, 50, 50);
                    ctx.restore();
                } catch (err) {
                    console.error("Avatar load error", err);
                }

                // -- Username --
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'left';
                ctx.font = 'bold 24px sans-serif';
                ctx.fillText(username, 90, y + 35);

                // -- Balance --
                ctx.fillStyle = '#aaaaaa'; // Greyish for subtext
                ctx.font = '20px sans-serif';
                ctx.fillText(`Coins: ${total.toLocaleString()}$`, 90, y + 60);
            }

            const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'leaderboard.png' });
            message.reply({ files: [attachment] });

        } catch (error) {
            console.error('Leaderboard error:', error);
            message.reply("Failed to generate leaderboard image.");
        }
    },
};

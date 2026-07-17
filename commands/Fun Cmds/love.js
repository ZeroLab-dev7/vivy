const { AttachmentBuilder, MessageFlags } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const UI = require('../../utils/ui');

// Heart drawing helper path
function drawHeart(ctx, x, y, width, height) {
    ctx.beginPath();
    const topCurveHeight = height * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    // Top left curve
    ctx.bezierCurveTo(
        x, y,
        x - width / 2, y,
        x - width / 2, y + topCurveHeight
    );
    // Bottom left curve
    ctx.bezierCurveTo(
        x - width / 2, y + (height + topCurveHeight) / 2,
        x, y + (height + topCurveHeight) / 2,
        x, y + height
    );
    // Bottom right curve
    ctx.bezierCurveTo(
        x, y + (height + topCurveHeight) / 2,
        x + width / 2, y + (height + topCurveHeight) / 2,
        x + width / 2, y + topCurveHeight
    );
    // Top right curve
    ctx.bezierCurveTo(
        x + width / 2, y,
        x, y,
        x, y + topCurveHeight
    );
    ctx.closePath();
}

module.exports = {
    name: 'love',
    description: 'Calculates love percentage with a gorgeous canvas visual',
    async execute(message, args) {
        const target = message.mentions.users.first();

        if (!target) {
            return message.reply({
                embeds: [UI.createEmbed({ type: 'warning', description: 'Please mention someone to calculate love with!' })]
            });
        }

        const rate = Math.floor(Math.random() * 101);
        let messageText;

        if (rate < 20) messageText = "Not a good match...";
        else if (rate < 50) messageText = "Maybe just friends?";
        else if (rate < 80) messageText = "Looking good!";
        else messageText = "It's meant to be!";

        try {
            // Canvas dimensions
            const W = 800;
            const H = 300;
            const canvas = createCanvas(W, H);
            const ctx = canvas.getContext('2d');

            // --- Background gradient ---
            const grad = ctx.createLinearGradient(0, 0, W, H);
            grad.addColorStop(0, '#160826');
            grad.addColorStop(0.5, '#3a0c30');
            grad.addColorStop(1, '#20071a');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);

            // --- Background floating hearts ---
            ctx.fillStyle = 'rgba(255, 77, 141, 0.04)';
            drawHeart(ctx, 100, 50, 40, 40); ctx.fill();
            drawHeart(ctx, 220, 180, 60, 60); ctx.fill();
            drawHeart(ctx, 700, 60, 50, 50); ctx.fill();
            drawHeart(ctx, 600, 200, 45, 45); ctx.fill();
            drawHeart(ctx, 350, 220, 35, 35); ctx.fill();

            // --- Draw connection line with gradient ---
            const gradLine = ctx.createLinearGradient(150, 130, 650, 130);
            gradLine.addColorStop(0, '#ff4d8d');
            gradLine.addColorStop(0.5, '#7209b7');
            gradLine.addColorStop(1, '#f72585');
            ctx.strokeStyle = gradLine;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(150, 130);
            ctx.lineTo(650, 130);
            ctx.stroke();

            // --- Load avatars ---
            const authorAvatarUrl = message.author.displayAvatarURL({ extension: 'png', size: 256 });
            const targetAvatarUrl = target.displayAvatarURL({ extension: 'png', size: 256 });

            let authorAvatarImg, targetAvatarImg;
            try {
                authorAvatarImg = await loadImage(authorAvatarUrl);
            } catch (e) {
                console.error('[LoveCommand] Failed to load author avatar:', e);
            }
            try {
                targetAvatarImg = await loadImage(targetAvatarUrl);
            } catch (e) {
                console.error('[LoveCommand] Failed to load target avatar:', e);
            }

            // --- Draw Left Avatar (Author) ---
            ctx.save();
            ctx.shadowColor = '#ff4d8d';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = '#ff4d8d';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(150, 130, 60, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            if (authorAvatarImg) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(150, 130, 57, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(authorAvatarImg, 150 - 57, 130 - 57, 114, 114);
                ctx.restore();
            } else {
                ctx.fillStyle = '#ff4d8d';
                ctx.beginPath();
                ctx.arc(150, 130, 57, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 30px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(message.author.username[0].toUpperCase(), 150, 130);
            }

            // --- Draw Right Avatar (Target) ---
            ctx.save();
            ctx.shadowColor = '#f72585';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = '#f72585';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(650, 130, 60, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            if (targetAvatarImg) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(650, 130, 57, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(targetAvatarImg, 650 - 57, 130 - 57, 114, 114);
                ctx.restore();
            } else {
                ctx.fillStyle = '#f72585';
                ctx.beginPath();
                ctx.arc(650, 130, 57, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 30px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(target.username[0].toUpperCase(), 650, 130);
            }

            // --- Draw Central Heart ---
            if (rate >= 50) {
                // Glowing heart
                ctx.save();
                ctx.shadowColor = '#ff2a6d';
                ctx.shadowBlur = 25;
                const heartGrad = ctx.createRadialGradient(400, 130, 5, 400, 130, 60);
                heartGrad.addColorStop(0, '#ff6b8b');
                heartGrad.addColorStop(1, '#e6003a');
                ctx.fillStyle = heartGrad;
                drawHeart(ctx, 400, 75, 120, 110);
                ctx.fill();
                ctx.restore();
            } else {
                // Broken / Cracked dark heart
                ctx.save();
                const heartGrad = ctx.createLinearGradient(340, 75, 460, 185);
                heartGrad.addColorStop(0, '#8c8c8c');
                heartGrad.addColorStop(1, '#4a4a4a');
                ctx.fillStyle = heartGrad;
                drawHeart(ctx, 400, 75, 120, 110);
                ctx.fill();

                // Draw a jagged crack down the center
                ctx.strokeStyle = '#ff3333';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(400, 75);
                ctx.lineTo(395, 105);
                ctx.lineTo(405, 125);
                ctx.lineTo(395, 145);
                ctx.lineTo(400, 185);
                ctx.stroke();
                ctx.restore();
            }

            // --- Draw Love Percentage ---
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 28px sans-serif';
            ctx.shadowColor = '#000000';
            ctx.shadowBlur = 8;
            ctx.fillText(`${rate}%`, 400, 128);
            ctx.restore();

            // --- Draw Usernames ---
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 5;

            const authorNameClean = message.author.username.slice(0, 14) + (message.author.username.length > 14 ? '...' : '');
            ctx.fillText(authorNameClean, 150, 230);

            const targetNameClean = target.username.slice(0, 14) + (target.username.length > 14 ? '...' : '');
            ctx.fillText(targetNameClean, 650, 230);
            ctx.restore();

            // --- Draw Match Text Quote ---
            ctx.save();
            ctx.fillStyle = rate >= 50 ? '#ff75a0' : '#bbbbbb';
            ctx.font = 'italic bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.fillText(messageText, 400, 270);
            ctx.restore();

            // Compile & Send
            const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'love.png' });
            const container = UI.createContainer({
                title: '❤️ Love Calculator',
                description: `How compatible are **${message.author.username}** and **${target.username}**?`,
                image: 'attachment://love.png',
                color: rate >= 50 ? 0xff2a6d : 0x888888
            });

            await message.reply({
                components: [container],
                files: [attachment],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('[LoveCommand] Error generating canvas:', error);
            message.reply('An error occurred while calculating love compatibility.');
        }
    },
};

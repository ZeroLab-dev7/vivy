const { createCanvas, loadImage } = require('@napi-rs/canvas');

class CanvasService {
    /**
     * Generate Dark Minimal Premium Profile Card
     */
    static async generateProfileCard(user, economyData) {
        const width = 800;
        const height = 450;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Background Gradient (Dark Linear Theme)
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#0F172A');
        bgGrad.addColorStop(0.5, '#1E293B');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Subtle Glassmorphism Card Overlay
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1.5;
        this.roundRect(ctx, 25, 25, width - 50, height - 50, 20, true, true);
        ctx.restore();

        // User Avatar
        const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
        try {
            const avatarImg = await loadImage(avatarURL);
            ctx.save();
            ctx.beginPath();
            ctx.arc(100, 110, 50, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatarImg, 50, 60, 100, 100);
            ctx.restore();

            // Avatar Glow Border
            ctx.save();
            ctx.beginPath();
            ctx.arc(100, 110, 52, 0, Math.PI * 2, true);
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
        } catch (e) {
            console.error('Failed to load avatar for profile card', e);
        }

        // Username & Title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(user.username.toUpperCase(), 170, 95);

        ctx.fillStyle = '#38BDF8';
        ctx.font = '16px sans-serif';
        const titleText = economyData.active_title || 'Novice Trader';
        ctx.fillText(`✨ Title: ${titleText}`, 170, 125);

        // Stats Panels (Wallet, Bank, Net Worth, Gems)
        const stats = [
            { label: 'WALLET', val: `${Number(economyData.balance).toLocaleString()} Coins`, color: '#10B981' },
            { label: 'BANK', val: `${Number(economyData.bank).toLocaleString()} Coins`, color: '#6366F1' },
            { label: 'NET WORTH', val: `${Number(economyData.net_worth).toLocaleString()} Coins`, color: '#F59E0B' },
            { label: 'GEMS', val: `${economyData.gems} 💎`, color: '#EC4899' }
        ];

        stats.forEach((s, idx) => {
            const x = 50 + (idx % 2) * 350;
            const y = 180 + Math.floor(idx / 2) * 90;

            ctx.save();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            this.roundRect(ctx, x, y, 330, 75, 12, true, true);

            ctx.fillStyle = '#94A3B8';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(s.label, x + 15, y + 28);

            ctx.fillStyle = s.color;
            ctx.font = 'bold 22px sans-serif';
            ctx.fillText(s.val, x + 15, y + 58);
            ctx.restore();
        });

        // Level & XP Bar
        const currentXP = economyData.xp || 0;
        const maxXP = (economyData.level || 1) * 1000;
        const progress = Math.min(1, currentXP / maxXP);

        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`LEVEL ${economyData.level || 1}  •  PRESTIGE ${economyData.prestige || 0}`, 50, 395);

        // XP Track
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.roundRect(ctx, 50, 405, 700, 12, 6, true, false);

        // XP Fill
        if (progress > 0) {
            ctx.fillStyle = '#00FFFF';
            this.roundRect(ctx, 50, 405, Math.max(12, 700 * progress), 12, 6, true, false);
        }

        return canvas.toBuffer('image/png');
    }

    /**
     * Generate Dark Minimal Premium Leaderboard Card
     */
    static async generateLeaderboardCard(entries) {
        const width = 550;
        const height = 20 + entries.length * 58;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Background Gradient
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#0F172A');
        bgGrad.addColorStop(0.5, '#1E293B');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        const rankColors = ['#F59E0B', '#94A3B8', '#B45309', '#38BDF8', '#6366F1'];

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const y = 12 + i * 58;

            // Row Container
            ctx.save();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
            ctx.strokeStyle = i === 0 ? '#F59E0B' : 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = i === 0 ? 1.5 : 1;
            this.roundRect(ctx, 20, y, width - 40, 48, 10, true, true);
            ctx.restore();

            // Rank Badge Pill
            const badgeColor = rankColors[i] || '#475569';
            ctx.save();
            ctx.fillStyle = badgeColor;
            this.roundRect(ctx, 30, y + 9, 32, 30, 8, true, false);

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`#${i + 1}`, 46, y + 29);
            ctx.restore();

            // User Avatar
            if (entry.avatarURL) {
                try {
                    const avatarImg = await loadImage(entry.avatarURL);
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(88, y + 24, 16, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(avatarImg, 72, y + 8, 32, 32);
                    ctx.restore();

                    // Avatar Border
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(88, y + 24, 17, 0, Math.PI * 2, true);
                    ctx.strokeStyle = badgeColor;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    ctx.restore();
                } catch (e) { }
            }

            // Username
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText((entry.userTag || 'Unknown User').toUpperCase(), 118, y + 29);

            // Net Worth Balance
            ctx.fillStyle = '#F59E0B';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${Number(entry.netWorth).toLocaleString()} Coins`, width - 35, y + 29);
        }

        return canvas.toBuffer('image/png');
    }

    /**
     * Helper to draw rounded rectangle
     */
    static roundRect(ctx, x, y, w, h, radius, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
    }
}

module.exports = CanvasService;
